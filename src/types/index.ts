/**
 * Plainly Type Definitions
 */

export type InsuranceType = 'health' | 'dental' | 'vision' | 'other';

export type ConfidenceLevel = 'clear' | 'partly_clear' | 'not_found';

export interface UserProfile {
  id: string;
  country: string;
  currency: string;
  currencySymbol: string;
  language: string;
  isPro: boolean;
  questionsAskedThisMonth: number;
}

export interface Policy {
  id: string;
  userId: string;
  insurer: string;
  planName: string;
  memberId: string;
  groupNumber: string;
  phone: string;
  type: InsuranceType;
  country: string;
  currency: string;
  currencySymbol: string;
  renewalDate: string;
  yearStart: string;
  isActive: boolean;
  createdAt: string;
  documentCount?: number;
}

export interface DocumentChunk {
  id: string;
  documentId: string;
  page: number;
  sectionTitle?: string;
  text: string;
  startOffset: number;
  endOffset: number;
}

export interface PolicyDocument {
  id: string;
  policyId: string;
  fileName: string;
  fileUrl: string;
  pageCount: number;
  processedAt?: string;
  rawText?: string;
  chunks?: DocumentChunk[];
}

export interface PlanFact {
  id: string;
  policyId: string;
  key: string;
  label: string;
  value: number | null;
  valueDisplay: string;
  unit?: 'currency' | 'percentage' | 'days' | 'visits' | 'text';
  sourcePage?: number;
  sourceQuote?: string;
  confidence: ConfidenceLevel;
  explanation: string;
  quoteVerified?: boolean;
}

export interface UsageData {
  policyId: string;
  year: number;
  deductibleUsed: number;
  outOfPocketUsed: number;
  limitsUsed: Record<string, number>;
}

export interface SourceCitation {
  page: number;
  quote: string;
  sectionTitle?: string;
  verified: boolean;
  matchScore?: number;
}

export interface EstimateBreakdown {
  quotedAmount: number;
  deductiblePortion: number;
  deductibleRemainingBefore: number;
  deductibleRemainingAfter: number;
  coinsurancePortion: number;
  coinsuranceRate: number;
  copayPortion: number;
  annualLimitRemainingBefore?: number;
  annualLimitExceededPortion?: number;
  outOfPocketMaxCapped: boolean;
  totalEstimatedPatientCost: number;
  costRange: {
    min: number;
    max: number;
  };
  explanationSteps: string[];
}

export interface AnswerResult {
  id: string;
  policyId: string;
  question: string;
  plainAnswer: string;
  confidence: ConfidenceLevel;
  sources: SourceCitation[];
  estimate?: EstimateBreakdown;
  questionsToAsk: string[];
  insurerPhone?: string;
  createdAt: string;
}

export interface ChecklistItem {
  id: string;
  task: string;
  explanation: string;
  completed: boolean;
  category: 'before_visit' | 'at_checkin' | 'billing';
}

export interface PreVisitChecklist {
  id: string;
  policyId: string;
  visitType: string;
  items: ChecklistItem[];
  notes: string;
  updatedAt: string;
}

export interface GlossaryTerm {
  term: string;
  plainDefinition: string;
  example: string;
  category: 'cost' | 'network' | 'rules';
}

export interface OCRCardResult {
  insurer: string;
  planName: string;
  memberId: string;
  groupNumber: string;
  phone: string;
  rawText: string;
  confidence: number;
}
