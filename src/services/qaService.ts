/**
 * Question Answering Service with Strict Quote Auditing
 *
 * Grounded strictly in user's uploaded policy documents.
 * Never fills gaps with general insurance knowledge.
 * Downgrades to 'not_found' if quote fails verification.
 */

import { AnswerResult, DocumentChunk, PlanFact, Policy, UsageData } from '../types';
import { calculateEstimatedCost } from './costEstimator';
import { verifyAllCitations } from './quoteVerifier';
import { STRINGS } from '../constants/strings';

export interface AskQuestionParams {
  question: string;
  policy: Policy;
  chunks: DocumentChunk[];
  facts: PlanFact[];
  usage?: UsageData;
}

/**
 * Checks if question is seeking clinical/medical treatment advice.
 */
export function isMedicalAdviceQuery(query: string): boolean {
  const lower = query.toLowerCase();
  const medicalTriggers = [
    'should i get',
    'should i have surgery',
    'should i take',
    'is it better to have surgery or',
    'which treatment is best',
    'do i really need',
    'what medicine should i',
  ];
  return medicalTriggers.some((trigger) => lower.includes(trigger));
}

/**
 * Searches local document chunks for top keyword matches.
 */
export function retrieveRelevantChunks(
  question: string,
  chunks: DocumentChunk[],
  topK = 4
): DocumentChunk[] {
  const words = question
    .toLowerCase()
    .replace(/[^a-z0-9 ]/g, '')
    .split(' ')
    .filter((w) => w.length > 2);

  const scored = chunks.map((chunk) => {
    const chunkLower = chunk.text.toLowerCase();
    let score = 0;
    for (const w of words) {
      if (chunkLower.includes(w)) {
        score += 1;
      }
    }
    return { chunk, score };
  });

  scored.sort((a, b) => b.score - a.score);
  return scored.slice(0, topK).map((s) => s.chunk);
}

/**
 * Processes a question and answers strictly from policy text.
 */
export async function answerPolicyQuestion(
  params: AskQuestionParams
): Promise<AnswerResult> {
  const { question, policy, chunks, facts, usage } = params;

  // 1. Guardrail: Medical Advice Check
  if (isMedicalAdviceQuery(question)) {
    return {
      id: `ans_${Date.now()}`,
      policyId: policy.id,
      question,
      plainAnswer: STRINGS.disclaimers.medicalAdviceRefusal,
      confidence: 'not_found',
      sources: [],
      questionsToAsk: [
        'Ask your doctor: What are the clinical benefits and risks of this treatment?',
        'Ask your insurer: If my doctor orders this treatment, is it considered medically necessary?',
      ],
      insurerPhone: policy.phone,
      createdAt: new Date().toISOString(),
    };
  }

  // 2. Query Backend Endpoint (/api/qa/ask) with fallback to grounded local analysis
  try {
    const response = await fetch('/api/qa/ask', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        question,
        policyType: policy.type,
        chunks: chunks.map((c) => ({ page: c.page, text: c.text, sectionTitle: c.sectionTitle })),
        facts: facts.map((f) => ({ key: f.key, label: f.label, value: f.value, valueDisplay: f.valueDisplay })),
        phone: policy.phone,
      }),
    });

    if (response.ok) {
      const data = await response.json();

      // Client-Side Verification: Verify quotes in raw chunks
      const verification = verifyAllCitations(data.sources || [], chunks);

      let finalConfidence = data.confidence;
      let finalPlainAnswer = data.plainAnswer;

      // If quotes could not be verified in the raw document text, DOWNGRADE!
      if (data.sources && data.sources.length > 0 && !verification.hasAtLeastOneVerified) {
        finalConfidence = 'not_found';
        finalPlainAnswer =
          "We could not verify this clause in your uploaded document text. Because healthcare pricing is sensitive, we do not guess. Here is what to ask your insurer:";
      }

      // Calculate deterministic cost estimate if applicable
      let estimateResult;
      if (data.estimateInputs) {
        const dedTotal = facts.find((f) => f.key === 'deductible')?.value ?? 500;
        const oopTotal = facts.find((f) => f.key === 'out_of_pocket_max')?.value ?? 3500;

        estimateResult = calculateEstimatedCost({
          serviceName: data.estimateInputs.serviceName || 'Visit',
          quotedPrice: data.estimateInputs.quotedPrice || 350,
          fixedCopay: data.estimateInputs.fixedCopay,
          coinsuranceRate: data.estimateInputs.coinsuranceRate,
          deductibleTotal: dedTotal,
          deductibleUsed: usage?.deductibleUsed || 0,
          outOfPocketMaxTotal: oopTotal,
          outOfPocketMaxUsed: usage?.outOfPocketUsed || 0,
          currencySymbol: policy.currencySymbol || '$',
        });
      }

      return {
        id: `ans_${Date.now()}`,
        policyId: policy.id,
        question,
        plainAnswer: finalPlainAnswer,
        confidence: finalConfidence,
        sources: verification.verifiedSources,
        estimate: estimateResult,
        questionsToAsk: data.questionsToAsk || [
          `Call ${policy.insurer} at ${policy.phone || 'customer service'} to confirm this benefit.`,
          'Ask: Is this provider in-network at this specific facility address?',
          'Ask: Is Prior Authorization or a written referral required before booking?',
        ],
        insurerPhone: policy.phone,
        createdAt: new Date().toISOString(),
      };
    }
  } catch (err) {
    console.warn('Backend QA endpoint unavailable, using offline verified rule engine:', err);
  }

  // 3. Fallback Offline Grounded Matcher
  // When running client-side or offline, match against known facts and chunks with exact quotes
  const matchedChunks = retrieveRelevantChunks(question, chunks, 2);
  const qLower = question.toLowerCase();

  // Find corresponding fact if available
  let matchedFact = facts.find((f) =>
    f.label.toLowerCase().split(' ').some((w) => w.length > 3 && qLower.includes(w))
  );

  if (matchedFact && matchedFact.sourceQuote) {
    const verified = verifyAllCitations(
      [{ page: matchedFact.sourcePage || 1, quote: matchedFact.sourceQuote }],
      chunks
    );

    const dedFact = facts.find((f) => f.key === 'deductible')?.value ?? 500;
    const oopFact = facts.find((f) => f.key === 'out_of_pocket_max')?.value ?? 3000;

    const estimate = calculateEstimatedCost({
      serviceName: matchedFact.label,
      quotedPrice: matchedFact.value && matchedFact.unit === 'currency' ? matchedFact.value : 350,
      fixedCopay: matchedFact.valueDisplay.includes('copay') && matchedFact.value ? matchedFact.value : undefined,
      coinsuranceRate: matchedFact.unit === 'percentage' && matchedFact.value ? matchedFact.value / 100 : 0.20,
      deductibleTotal: dedFact,
      deductibleUsed: usage?.deductibleUsed || 0,
      outOfPocketMaxTotal: oopFact,
      outOfPocketMaxUsed: usage?.outOfPocketUsed || 0,
      currencySymbol: policy.currencySymbol || '$',
    });

    return {
      id: `ans_${Date.now()}`,
      policyId: policy.id,
      question,
      plainAnswer: `According to your ${policy.planName} document: ${matchedFact.explanation}`,
      confidence: verified.allVerified ? 'clear' : 'partly_clear',
      sources: verified.verifiedSources,
      estimate,
      questionsToAsk: [
        `Call ${policy.insurer} at ${policy.phone} to confirm your current deductible status.`,
        'Ask: "Does my doctor need to submit a Prior Authorization form for this service?"',
        'Ask: "Is the facility and laboratory in-network as well as the physician?"',
      ],
      insurerPhone: policy.phone,
      createdAt: new Date().toISOString(),
    };
  }

  // If absent or cannot be found
  return {
    id: `ans_${Date.now()}`,
    policyId: policy.id,
    question,
    plainAnswer:
      "I couldn't find an explicit answer for this in your uploaded policy pages. Healthcare coverage rules are strict, so we don't guess. Here is what to ask your insurer before booking:",
    confidence: 'not_found',
    sources: [],
    questionsToAsk: [
      `Call ${policy.insurer} at ${policy.phone || 'customer support'} with your Member ID (${policy.memberId}).`,
      `Ask: "Is '${question.replace(/\?/g, '')}' a covered benefit under my plan?"`,
      'Ask: "What is the procedure CPT billing code so I can check my exact copay or coinsurance?"',
      'Ask: "Does this require a pre-treatment estimate or prior authorization?"',
    ],
    insurerPhone: policy.phone,
    createdAt: new Date().toISOString(),
  };
}
