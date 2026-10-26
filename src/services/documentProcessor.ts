/**
 * Document Processor Service
 * Handles text extraction, page & section chunking with character offsets,
 * and plan summary fact extraction with strict verification.
 */

import { DocumentChunk, PlanFact } from '../types';
import { verifyQuoteAgainstChunks } from './quoteVerifier';

export interface ExtractedFactPayload {
  key: string;
  label: string;
  value: number | null;
  valueDisplay: string;
  unit?: 'currency' | 'percentage' | 'days' | 'visits' | 'text';
  sourcePage: number;
  sourceQuote: string;
  explanation: string;
}

/**
 * Splits raw document text by page and section headers.
 * Computes exact startOffset and endOffset for each chunk.
 */
export function chunkDocumentText(
  pages: Array<{ pageNumber: number; text: string }>
): DocumentChunk[] {
  const chunks: DocumentChunk[] = [];
  let globalOffset = 0;

  for (const p of pages) {
    const rawPage = p.text;
    // Split page into sections by double newline or Section/Article headers
    const rawSections = rawPage.split(/(?=\n(?:Section|Article|\d+\.|\bSchedule\b|\bBenefit\b))/i);

    let pageOffset = 0;
    for (let i = 0; i < rawSections.length; i++) {
      const secText = rawSections[i].trim();
      if (!secText) continue;

      const lines = secText.split('\n');
      const sectionTitle = lines[0].length < 60 ? lines[0].replace(/[:#]/g, '').trim() : undefined;

      const start = globalOffset + pageOffset;
      const end = start + secText.length;

      chunks.push({
        id: `chunk_${p.pageNumber}_${i + 1}`,
        documentId: `doc_current`,
        page: p.pageNumber,
        sectionTitle,
        text: secText,
        startOffset: start,
        endOffset: end,
      });

      pageOffset += secText.length + 1;
    }

    globalOffset += rawPage.length + 10;
  }

  return chunks;
}

/**
 * Validates extracted facts against actual document chunks.
 * Rejects any value whose quoted source text does not appear in the document.
 */
export function validateAndGroundPlanFacts(
  extractedFacts: ExtractedFactPayload[],
  chunks: DocumentChunk[]
): PlanFact[] {
  return extractedFacts.map((fact) => {
    // If the model reported no quote or could not find it
    if (!fact.sourceQuote || fact.sourceQuote.trim().length === 0 || fact.valueDisplay === 'Not found') {
      return {
        id: `fact_${fact.key}_${Date.now()}`,
        policyId: 'current',
        key: fact.key,
        label: fact.label,
        value: null,
        valueDisplay: 'Not found in your document',
        unit: fact.unit,
        sourcePage: undefined,
        sourceQuote: undefined,
        confidence: 'not_found',
        explanation: 'This benefit is not explicitly mentioned in your uploaded pages.',
        quoteVerified: false,
      };
    }

    // Verify quote in document chunks
    const verification = verifyQuoteAgainstChunks(fact.sourceQuote, fact.sourcePage, chunks);

    if (!verification.verified) {
      // Auto-downgrade to Not Found because quote could not be verified in text
      return {
        id: `fact_${fact.key}_${Date.now()}`,
        policyId: 'current',
        key: fact.key,
        label: fact.label,
        value: null,
        valueDisplay: 'Not found in your document',
        unit: fact.unit,
        sourcePage: undefined,
        sourceQuote: undefined,
        confidence: 'not_found',
        explanation: 'Could not verify exact quote in source document. Downgraded for safety.',
        quoteVerified: false,
      };
    }

    return {
      id: `fact_${fact.key}_${Date.now()}`,
      policyId: 'current',
      key: fact.key,
      label: fact.label,
      value: fact.value,
      valueDisplay: fact.valueDisplay,
      unit: fact.unit,
      sourcePage: verification.page,
      sourceQuote: fact.sourceQuote,
      confidence: verification.matchScore >= 0.9 ? 'clear' : 'partly_clear',
      explanation: fact.explanation,
      quoteVerified: true,
    };
  });
}
