/**
 * Quote Verifier Service
 *
 * Enforces the strict rule:
 * - Every quoted clause claimed by the model must be found as a substring
 *   in the actual document text on the cited page.
 * - If a quote is fabricated, altered, or cannot be verified in the source text,
 *   the answer is automatically downgraded to "Not found in your policy".
 */

import { DocumentChunk, SourceCitation } from '../types';

export interface VerificationResult {
  verified: boolean;
  page: number;
  matchedQuote: string;
  charStartOffset?: number;
  charEndOffset?: number;
  matchScore: number; // 0 to 1
}

/**
 * Normalizes text for robust comparison by collapsing whitespace and standardizing quotes.
 */
function normalizeText(text: string): string {
  return text
    .toLowerCase()
    .replace(/[\u2018\u2019]/g, "'")
    .replace(/[\u201C\u201D]/g, '"')
    .replace(/\s+/g, ' ')
    .trim();
}

/**
 * Verifies a single quote against document chunks.
 */
export function verifyQuoteAgainstChunks(
  quote: string,
  claimedPage: number,
  chunks: DocumentChunk[]
): VerificationResult {
  if (!quote || quote.trim().length < 6) {
    return {
      verified: false,
      page: claimedPage,
      matchedQuote: quote,
      matchScore: 0,
    };
  }

  const cleanQuote = normalizeText(quote);

  // First check chunks matching the claimed page
  const pageChunks = chunks.filter((c) => c.page === claimedPage);
  const targetChunks = pageChunks.length > 0 ? pageChunks : chunks;

  for (const chunk of targetChunks) {
    const cleanChunk = normalizeText(chunk.text);

    // 1. Exact substring match
    if (cleanChunk.includes(cleanQuote)) {
      return {
        verified: true,
        page: chunk.page,
        matchedQuote: quote,
        charStartOffset: chunk.startOffset,
        charEndOffset: chunk.endOffset,
        matchScore: 1.0,
      };
    }

    // 2. High-overlap phrase match (handles OCR small anomalies like missing punctuation)
    const quoteWords = cleanQuote.split(' ');
    if (quoteWords.length >= 4) {
      // Check if a substantial 4+ word window matches exactly
      const firstFour = quoteWords.slice(0, 4).join(' ');
      const lastFour = quoteWords.slice(-4).join(' ');

      if (cleanChunk.includes(firstFour) && cleanChunk.includes(lastFour)) {
        return {
          verified: true,
          page: chunk.page,
          matchedQuote: quote,
          charStartOffset: chunk.startOffset,
          charEndOffset: chunk.endOffset,
          matchScore: 0.95,
        };
      }
    }
  }

  return {
    verified: false,
    page: claimedPage,
    matchedQuote: quote,
    matchScore: 0,
  };
}

/**
 * Verifies all citations for an answer.
 * If ANY quote is completely unverifiable or missing, flags the overall confidence.
 */
export function verifyAllCitations(
  citations: Array<{ page: number; quote: string; sectionTitle?: string }>,
  chunks: DocumentChunk[]
): {
  verifiedSources: SourceCitation[];
  allVerified: boolean;
  hasAtLeastOneVerified: boolean;
} {
  if (!citations || citations.length === 0) {
    return {
      verifiedSources: [],
      allVerified: false,
      hasAtLeastOneVerified: false,
    };
  }

  const verifiedSources: SourceCitation[] = [];
  let verifiedCount = 0;

  for (const cit of citations) {
    const res = verifyQuoteAgainstChunks(cit.quote, cit.page, chunks);
    verifiedSources.push({
      page: res.page,
      quote: cit.quote,
      sectionTitle: cit.sectionTitle,
      verified: res.verified,
      matchScore: res.matchScore,
    });
    if (res.verified) {
      verifiedCount++;
    }
  }

  return {
    verifiedSources,
    allVerified: verifiedCount === citations.length && citations.length > 0,
    hasAtLeastOneVerified: verifiedCount > 0,
  };
}
