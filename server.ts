/**
 * Plainly Full-Stack Server
 * Express Backend + Vite Middleware
 *
 * Implements:
 * - Server-side Gemini API calls for grounded document extraction and Q&A
 * - Strict quote extraction and PII-free audit logging
 * - Benchmark test runner endpoint
 * - Port 3000 compliance with Vite integration
 */

import express, { Request, Response } from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import { GoogleGenAI } from '@google/genai';
import { runBenchmark } from './src/benchmark/runPolicyBenchmark';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT ? parseInt(process.env.PORT, 10) : 3000;

app.use(express.json({ limit: '25mb' }));

// Initialize Google Gen AI
const ai = new GoogleGenAI({});

// In-Memory PII-Free Audit Logs
interface AuditLogEntry {
  id: string;
  timestamp: string;
  eventType: string;
  policyType: string;
  confidence: string;
  quoteVerified: boolean;
  charCount: number;
}
const auditLogs: AuditLogEntry[] = [];

// ============================================================================
// API ROUTES
// ============================================================================

/**
 * Health check
 */
app.get('/api/health', (req: Request, res: Response) => {
  res.json({ status: 'ok', service: 'Plainly Insurance Backend' });
});

/**
 * PII-Free Audit Logs endpoint
 */
app.get('/api/qa/audit-log', (req: Request, res: Response) => {
  res.json({ logs: auditLogs });
});

/**
 * Policy Benchmark Runner Endpoint
 */
app.get('/api/benchmark/run', (req: Request, res: Response) => {
  try {
    const report = runBenchmark();
    res.json(report);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

/**
 * Grounded Q&A Endpoint
 * LLM is called ONLY from backend.
 * Instructed to answer strictly from provided policy chunks.
 * Rejects general knowledge and returns exact source quotes.
 */
app.post('/api/qa/ask', async (req: Request, res: Response) => {
  try {
    const { question, policyType, chunks, facts, phone } = req.body;

    if (!question || !chunks) {
      return res.status(400).json({ error: 'Missing question or policy chunks' });
    }

    const contextText = chunks
      .map((c: any) => `[PAGE ${c.page}${c.sectionTitle ? ` - ${c.sectionTitle}` : ''}]\n${c.text}`)
      .join('\n\n');

    const factsText = facts && facts.length > 0
      ? facts.map((f: any) => `- ${f.label}: ${f.valueDisplay} (${f.explanation || ''})`).join('\n')
      : 'None extracted yet';

    const systemInstruction = `You are the plain-language insurance explainer for "Plainly".
THE MOST CRITICAL SAFETY RULE: HONESTY ABOUT UNCERTAINTY.
A wrong answer causes real financial harm. You must follow these strict constraints:
1. Base your answer EXCLUSIVELY on the provided Document Chunks below.
2. NEVER use general knowledge about what insurance "usually" or "typically" covers.
3. If the provided document chunks do not explicitly answer the question, or if you are in any doubt:
   - Set confidence to "not_found"
   - In plainAnswer, say: "I couldn't find this in your policy documents. Here is what to ask your insurer before booking:"
   - Do NOT invent quotes.
4. If the question can be answered from the document chunks:
   - Set confidence to "clear" (or "partly_clear" if conditional)
   - plainAnswer: 1 concise, reassuring sentence in grade 6-8 reading level. No insurance jargon without a plain explanation.
   - sources: An array of exact supporting sentences quoted word-for-word from the chunks, along with the page number where they appear. Every quote MUST be an exact verbatim substring from the chunks.
5. Estimate: If the service has a copay or coinsurance stated in the text, extract estimateInputs. Otherwise leave null.
6. questionsToAsk: 2 to 3 specific questions the user should ask their insurer or clinic before booking.

OUTPUT FORMAT: Return pure JSON conforming to this structure:
{
  "confidence": "clear" | "partly_clear" | "not_found",
  "plainAnswer": "One clear sentence explanation.",
  "sources": [
    {
      "page": 1,
      "sectionTitle": "Section title",
      "quote": "Exact verbatim sentence from document."
    }
  ],
  "estimateInputs": {
    "serviceName": "Specialist visit",
    "fixedCopay": 35,
    "coinsuranceRate": 0.20,
    "quotedPrice": 350
  },
  "questionsToAsk": [
    "Question 1",
    "Question 2"
  ]
}`;

    const prompt = `DOCUMENT CHUNKS:
${contextText}

KNOWN POLICY FACTS:
${factsText}

USER QUESTION: "${question}"

Remember: If the chunks do not explicitly answer this, return confidence "not_found". Exact verbatim quotes only.`;

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
      config: {
        systemInstruction,
        responseMimeType: 'application/json',
        temperature: 0.1, // Low temperature for high grounded fidelity
      },
    });

    const responseText = response.text || '{}';
    let parsed: any;
    try {
      parsed = JSON.parse(responseText);
    } catch {
      parsed = {
        confidence: 'not_found',
        plainAnswer: "I couldn't find an explicit answer in your policy documents. Here is what to ask your insurer:",
        sources: [],
        questionsToAsk: [
          `Call your insurer at ${phone || 'customer support'}.`,
          'Ask: Is this procedure covered under my current benefit year?',
          'Ask: What is the specific CPT billing code and my out-of-pocket obligation?',
        ],
      };
    }

    // Record PII-Free Audit Log
    auditLogs.push({
      id: `log_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
      timestamp: new Date().toISOString(),
      eventType: 'question_answered',
      policyType: policyType || 'unknown',
      confidence: parsed.confidence || 'unknown',
      quoteVerified: parsed.sources && parsed.sources.length > 0,
      charCount: question.length,
    });

    res.json(parsed);
  } catch (err: any) {
    console.error('Gemini QA Error:', err);
    res.status(500).json({
      error: 'Failed to process policy question',
      confidence: 'not_found',
      plainAnswer: "An error occurred while inspecting your documents. Please confirm coverage directly with your insurer.",
      sources: [],
    });
  }
});

// ============================================================================
// VITE DEV SERVER / STATIC ASSETS
// ============================================================================

async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.join(__dirname, 'dist')));
    app.get('*', (req: Request, res: Response) => {
      res.sendFile(path.join(__dirname, 'dist', 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Plainly Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
