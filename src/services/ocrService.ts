/**
 * OCR Service for Member Insurance Cards
 *
 * Scans insurance card images and extracts:
 * - Insurer Name
 * - Plan Name
 * - Member ID
 * - Group Number
 * - Customer Service Phone
 */

import { OCRCardResult } from '../types';

export interface SampleCardPreset {
  id: string;
  name: string;
  type: 'health' | 'dental' | 'vision';
  insurer: string;
  planName: string;
  memberId: string;
  groupNumber: string;
  phone: string;
  cardImageNote: string;
}

export const SAMPLE_CARD_PRESETS: SampleCardPreset[] = [
  {
    id: 'carefirst_ppo',
    name: 'BlueCross BlueShield PPO Card',
    type: 'health',
    insurer: 'CareFirst BlueCross BlueShield',
    planName: 'BlueChoice Advantage Preferred PPO',
    memberId: 'XBD928374011',
    groupNumber: 'GRP-77492A',
    phone: '1-800-535-9700',
    cardImageNote: 'PPO Network · In-Network Ded $500 · Specialist Copay $35',
  },
  {
    id: 'kaiser_hmo',
    name: 'Kaiser Permanente HMO Card',
    type: 'health',
    insurer: 'Kaiser Permanente',
    planName: 'Signature Select Direct HMO',
    memberId: 'KP-882049102',
    groupNumber: 'KPF-40291',
    phone: '1-800-464-4000',
    cardImageNote: 'HMO Network · Primary Care $20 · Ded $0',
  },
  {
    id: 'aetna_hdhp',
    name: 'Aetna High Deductible HDHP with HSA',
    type: 'health',
    insurer: 'Aetna Health',
    planName: 'Open Access HDHP 2800 with HSA',
    memberId: 'W192837465',
    groupNumber: 'AET-102938',
    phone: '1-855-586-2481',
    cardImageNote: 'HDHP · Deductible $2,800 · Coinsurance 20%',
  },
  {
    id: 'delta_dental',
    name: 'Delta Dental Premier Card',
    type: 'dental',
    insurer: 'Delta Dental',
    planName: 'Delta Dental Premier Comprehensive',
    memberId: 'DD-449201948',
    groupNumber: 'GRP-90234',
    phone: '1-800-521-2651',
    cardImageNote: 'Annual Max $1,500 · Preventive 100% · Basic 80%',
  },
  {
    id: 'vsp_vision',
    name: 'VSP Vision Care Card',
    type: 'vision',
    insurer: 'VSP Vision Care',
    planName: 'VSP Choice Plan B',
    memberId: 'VSP-71930485',
    groupNumber: 'VSP-55901',
    phone: '1-800-877-7195',
    cardImageNote: 'Exam Copay $10 · Frame Allowance $150 · 12 Month Reset',
  },
];

/**
 * Parses raw text extracted from an insurance card into structured fields.
 */
export function parseInsuranceCardText(rawText: string): OCRCardResult {
  const lines = rawText.split('\n').map((l) => l.trim()).filter(Boolean);
  let insurer = '';
  let planName = '';
  let memberId = '';
  let groupNumber = '';
  let phone = '';

  // Phone regex pattern
  const phoneRegex = /(?:1[-. ]?)?(?:\(?\d{3}\)?[-. ]?)?\d{3}[-. ]\d{4}/;

  // Member ID patterns (e.g. Member ID:, ID #, Subscriber ID:)
  const memberIdRegex = /(?:Member\s*(?:ID|#|No)|ID\s*#?|Subscriber\s*ID)[:\s]+([A-Z0-9-]+)/i;

  // Group number patterns (e.g. Group #:, GRP:, Group ID:)
  const groupRegex = /(?:Group\s*(?:#|No|ID)|GRP[:\s]|Group)[:\s]+([A-Z0-9-]+)/i;

  // Search line by line
  for (const line of lines) {
    if (!phone) {
      const matchPhone = line.match(phoneRegex);
      if (matchPhone) phone = matchPhone[0];
    }
    if (!memberId) {
      const matchMember = line.match(memberIdRegex);
      if (matchMember && matchMember[1]) memberId = matchMember[1];
    }
    if (!groupNumber) {
      const matchGroup = line.match(groupRegex);
      if (matchGroup && matchGroup[1]) groupNumber = matchGroup[1];
    }
  }

  // Fallbacks if not explicitly tagged
  if (!insurer && lines.length > 0) {
    insurer = lines[0];
  }
  if (!planName && lines.length > 1) {
    planName = lines[1];
  }

  // Confidence calculation
  let foundCount = 0;
  if (insurer) foundCount++;
  if (planName) foundCount++;
  if (memberId) foundCount++;
  if (groupNumber) foundCount++;
  if (phone) foundCount++;

  const confidence = Math.round((foundCount / 5) * 100);

  return {
    insurer: insurer || 'Unknown Insurer',
    planName: planName || 'Standard Policy',
    memberId: memberId || 'PENDING-ID',
    groupNumber: groupNumber || 'GRP-STANDARD',
    phone: phone || '1-800-555-0199',
    rawText,
    confidence,
  };
}
