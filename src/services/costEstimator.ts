/**
 * Pure Deterministic Cost Estimator
 *
 * All arithmetic is performed in deterministic code, never free-form AI math.
 * Every step produces a checkable human-readable explanation trace.
 */

import { EstimateBreakdown } from '../types';

export interface CostCalculationInput {
  serviceName: string;
  quotedPrice: number;
  fixedCopay?: number; // e.g. $40 for specialist visit
  coinsuranceRate?: number; // e.g. 0.20 for 20%
  deductibleTotal: number;
  deductibleUsed: number;
  outOfPocketMaxTotal: number;
  outOfPocketMaxUsed: number;
  annualLimitTotal?: number; // e.g. $1,500 dental limit
  annualLimitUsed?: number;
  isPreventive?: boolean; // 100% covered if true
  currencySymbol?: string;
}

export function calculateEstimatedCost(input: CostCalculationInput): EstimateBreakdown {
  const symbol = input.currencySymbol || '$';
  const steps: string[] = [];
  const quote = Math.max(0, input.quotedPrice);

  // 1. Preventive Service Check (ACA / Standard 100% Coverage)
  if (input.isPreventive) {
    steps.push(`Service "${input.serviceName}" is classified as preventive care.`);
    steps.push(`Under your policy, preventive in-network care is covered at 100%.`);
    steps.push(`Estimated patient cost: ${symbol}0.`);
    return {
      quotedAmount: quote,
      deductiblePortion: 0,
      deductibleRemainingBefore: Math.max(0, input.deductibleTotal - input.deductibleUsed),
      deductibleRemainingAfter: Math.max(0, input.deductibleTotal - input.deductibleUsed),
      coinsurancePortion: 0,
      coinsuranceRate: 0,
      copayPortion: 0,
      outOfPocketMaxCapped: false,
      totalEstimatedPatientCost: 0,
      costRange: { min: 0, max: 0 },
      explanationSteps: steps,
    };
  }

  // 2. Fixed Copay Service Check (e.g. Primary Care or Specialist flat copay)
  if (input.fixedCopay !== undefined && input.fixedCopay > 0) {
    const copay = input.fixedCopay;
    const remainingOOP = Math.max(0, input.outOfPocketMaxTotal - input.outOfPocketMaxUsed);
    const finalCopay = Math.min(copay, remainingOOP);

    steps.push(`Your plan has a fixed copay of ${symbol}${copay} for ${input.serviceName}.`);
    if (finalCopay < copay) {
      steps.push(
        `Your remaining out-of-pocket maximum is only ${symbol}${remainingOOP}, which caps your copay at ${symbol}${finalCopay}.`
      );
    } else {
      steps.push(`This visit does not require meeting your deductible first.`);
    }
    steps.push(`Total fixed copay to pay at the desk: ${symbol}${finalCopay}.`);

    return {
      quotedAmount: quote || copay,
      deductiblePortion: 0,
      deductibleRemainingBefore: Math.max(0, input.deductibleTotal - input.deductibleUsed),
      deductibleRemainingAfter: Math.max(0, input.deductibleTotal - input.deductibleUsed),
      coinsurancePortion: 0,
      coinsuranceRate: 0,
      copayPortion: finalCopay,
      outOfPocketMaxCapped: finalCopay < copay,
      totalEstimatedPatientCost: finalCopay,
      costRange: { min: finalCopay, max: finalCopay },
      explanationSteps: steps,
    };
  }

  // 3. Deductible & Coinsurance Calculation
  const deductibleRemaining = Math.max(0, input.deductibleTotal - input.deductibleUsed);
  steps.push(
    `Starting procedure quote: ${symbol}${quote}. (Your annual deductible is ${symbol}${input.deductibleTotal}, and you have used ${symbol}${input.deductibleUsed} so far this year).`
  );

  let patientPaysForDeductible = 0;
  let remainingAfterDeductible = quote;

  if (deductibleRemaining > 0) {
    patientPaysForDeductible = Math.min(deductibleRemaining, quote);
    remainingAfterDeductible = Math.max(0, quote - patientPaysForDeductible);
    steps.push(
      `You have ${symbol}${deductibleRemaining} remaining on your deductible, so you pay ${symbol}${patientPaysForDeductible} towards your deductible.`
    );
  } else {
    steps.push(`Your deductible has already been 100% met for this year.`);
  }

  // 4. Coinsurance Phase
  const coinsuranceRate = input.coinsuranceRate !== undefined ? input.coinsuranceRate : 0.2; // default 20%
  let patientPaysCoinsurance = 0;

  if (remainingAfterDeductible > 0 && coinsuranceRate > 0) {
    patientPaysCoinsurance = Math.round(remainingAfterDeductible * coinsuranceRate * 100) / 100;
    const coinsurancePercent = Math.round(coinsuranceRate * 100);
    steps.push(
      `For the remaining ${symbol}${remainingAfterDeductible}, your plan's coinsurance is ${coinsurancePercent}%. You pay ${symbol}${patientPaysCoinsurance} and insurance pays the rest (${100 - coinsurancePercent}%).`
    );
  }

  // 5. Annual Limit Check (Dental / Vision)
  let annualLimitExceeded = 0;
  if (input.annualLimitTotal !== undefined && input.annualLimitTotal > 0) {
    const limitRemaining = Math.max(
      0,
      input.annualLimitTotal - (input.annualLimitUsed || 0)
    );
    const insurancePaysPortion = quote - (patientPaysForDeductible + patientPaysCoinsurance);
    if (insurancePaysPortion > limitRemaining) {
      annualLimitExceeded = insurancePaysPortion - limitRemaining;
      steps.push(
        `Note: Your plan has a ${symbol}${input.annualLimitTotal} yearly maximum benefit. You have ${symbol}${limitRemaining} left. Because insurance's share exceeds this by ${symbol}${annualLimitExceeded}, you must pay the excess.`
      );
    }
  }

  // 6. Subtotal before Out-of-Pocket Cap
  let subtotal = patientPaysForDeductible + patientPaysCoinsurance + annualLimitExceeded;

  // 7. Out-of-Pocket Maximum Cap
  const oopMaxRemaining = Math.max(0, input.outOfPocketMaxTotal - input.outOfPocketMaxUsed);
  let oopCapped = false;
  let finalPatientCost = subtotal;

  if (input.outOfPocketMaxTotal > 0 && subtotal > oopMaxRemaining) {
    oopCapped = true;
    finalPatientCost = oopMaxRemaining;
    steps.push(
      `Your annual out-of-pocket maximum is ${symbol}${input.outOfPocketMaxTotal} (${symbol}${oopMaxRemaining} remaining before you reach it). Your share is capped at ${symbol}${oopMaxRemaining}.`
    );
  }

  steps.push(`Estimated total patient out-of-pocket: ${symbol}${finalPatientCost}.`);

  // Calculate realistic range (e.g. +/- 15% on non-fixed quote to account for facility variations)
  const rangeMin = Math.max(0, Math.round(finalPatientCost * 0.9));
  const rangeMax = Math.round(finalPatientCost * 1.15);

  return {
    quotedAmount: quote,
    deductiblePortion: patientPaysForDeductible,
    deductibleRemainingBefore: deductibleRemaining,
    deductibleRemainingAfter: Math.max(0, deductibleRemaining - patientPaysForDeductible),
    coinsurancePortion: patientPaysCoinsurance,
    coinsuranceRate,
    copayPortion: 0,
    annualLimitRemainingBefore: input.annualLimitTotal
      ? Math.max(0, input.annualLimitTotal - (input.annualLimitUsed || 0))
      : undefined,
    annualLimitExceededPortion: annualLimitExceeded > 0 ? annualLimitExceeded : undefined,
    outOfPocketMaxCapped: oopCapped,
    totalEstimatedPatientCost: finalPatientCost,
    costRange: {
      min: rangeMin,
      max: rangeMax,
    },
    explanationSteps: steps,
  };
}
