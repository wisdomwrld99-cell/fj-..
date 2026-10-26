/**
 * Unit Tests for Deterministic Cost Estimator
 *
 * Verifies exact arithmetic rules across insurance edge cases:
 * 1. User brief example: Quote 400, Ded 300 (150 used), 20% coinsurance -> total 200
 * 2. Flat copay service ($35 specialist)
 * 3. 100% preventive service ($0)
 * 4. Out-of-pocket maximum capping
 * 5. Dental annual limit exhaustion
 */

import { calculateEstimatedCost } from './costEstimator';

function assert(condition: boolean, message: string) {
  if (!condition) {
    throw new Error(`TEST FAILED: ${message}`);
  }
}

export function runCostEstimatorTests(): { passed: number; total: number; logs: string[] } {
  const logs: string[] = [];
  let passed = 0;
  let total = 0;

  function test(name: string, fn: () => void) {
    total++;
    try {
      fn();
      passed++;
      logs.push(`PASS: ${name}`);
    } catch (err: any) {
      logs.push(`FAIL: ${name} -> ${err.message}`);
    }
  }

  // TEST 1: User Brief Canonical Example
  // "Quote 400. You've paid 150 of your 300 deductible, so you pay 150 more.
  // Then 20% of the remaining 250 is 50. Estimated total: 200."
  test('Canonical prompt example: Deductible remaining + 20% coinsurance', () => {
    const res = calculateEstimatedCost({
      serviceName: 'Dermatology Biopsy',
      quotedPrice: 400,
      deductibleTotal: 300,
      deductibleUsed: 150,
      coinsuranceRate: 0.20,
      outOfPocketMaxTotal: 3000,
      outOfPocketMaxUsed: 500,
    });

    assert(res.deductiblePortion === 150, `Expected deductible portion 150, got ${res.deductiblePortion}`);
    assert(res.coinsurancePortion === 50, `Expected coinsurance portion 50, got ${res.coinsurancePortion}`);
    assert(res.totalEstimatedPatientCost === 200, `Expected total 200, got ${res.totalEstimatedPatientCost}`);
    assert(res.deductibleRemainingAfter === 0, `Expected remaining deductible 0, got ${res.deductibleRemainingAfter}`);
  });

  // TEST 2: Fixed copay without deductible requirement
  test('Fixed flat copay of $35 for specialist visit', () => {
    const res = calculateEstimatedCost({
      serviceName: 'Specialist Visit',
      quotedPrice: 280,
      fixedCopay: 35,
      deductibleTotal: 1500,
      deductibleUsed: 200,
      outOfPocketMaxTotal: 4000,
      outOfPocketMaxUsed: 400,
    });

    assert(res.copayPortion === 35, `Expected copay 35, got ${res.copayPortion}`);
    assert(res.deductiblePortion === 0, `Expected deductible portion 0 for flat copay, got ${res.deductiblePortion}`);
    assert(res.totalEstimatedPatientCost === 35, `Expected total 35, got ${res.totalEstimatedPatientCost}`);
    assert(res.costRange.min === 35 && res.costRange.max === 35, 'Fixed copay range must have min == max');
  });

  // TEST 3: Preventive care 100% covered ($0)
  test('Preventive annual physical is 100% covered ($0)', () => {
    const res = calculateEstimatedCost({
      serviceName: 'Annual Routine Checkup',
      quotedPrice: 350,
      isPreventive: true,
      deductibleTotal: 1500,
      deductibleUsed: 0,
      outOfPocketMaxTotal: 4000,
      outOfPocketMaxUsed: 0,
    });

    assert(res.totalEstimatedPatientCost === 0, `Expected $0 patient cost, got ${res.totalEstimatedPatientCost}`);
    assert(res.deductiblePortion === 0, 'Preventive care does not draw from deductible');
    assert(res.costRange.min === 0 && res.costRange.max === 0, 'Preventive range must be 0-0');
  });

  // TEST 4: Out-of-pocket maximum cap applied
  test('High cost surgery capped by remaining out-of-pocket maximum', () => {
    // Quote $8,000. Ded remaining $500. Coinsurance 20% on $7,500 = $1,500. Total would be $2,000.
    // But OOP max is $4,000, and user already used $3,200. Remaining OOP max is $800.
    const res = calculateEstimatedCost({
      serviceName: 'Knee Arthroscopy',
      quotedPrice: 8000,
      deductibleTotal: 1000,
      deductibleUsed: 500,
      coinsuranceRate: 0.20,
      outOfPocketMaxTotal: 4000,
      outOfPocketMaxUsed: 3200, // $800 remaining to max
    });

    assert(res.outOfPocketMaxCapped === true, 'Expected out of pocket max to be capped');
    assert(res.totalEstimatedPatientCost === 800, `Expected total capped at 800, got ${res.totalEstimatedPatientCost}`);
  });

  // TEST 5: Dental annual benefit limit exceeded
  test('Dental crown exceeding remaining annual dental maximum', () => {
    // Dental Crown $1,200. Ded 0. Coinsurance 50% (insurance pays $600, user pays $600).
    // But plan yearly max is $1,500, and $1,100 already used -> only $400 benefit left.
    // Insurance pays $400. User pays $600 + $200 excess = $800.
    const res = calculateEstimatedCost({
      serviceName: 'Porcelain Crown',
      quotedPrice: 1200,
      deductibleTotal: 50,
      deductibleUsed: 50, // Ded already met
      coinsuranceRate: 0.50,
      outOfPocketMaxTotal: 0, // Dental typically has no OOP max, only benefit max
      outOfPocketMaxUsed: 0,
      annualLimitTotal: 1500,
      annualLimitUsed: 1100, // Only $400 remaining
    });

    assert(res.annualLimitExceededPortion === 200, `Expected annual limit exceeded portion of 200, got ${res.annualLimitExceededPortion}`);
    assert(res.totalEstimatedPatientCost === 800, `Expected total patient cost 800 (600 + 200), got ${res.totalEstimatedPatientCost}`);
  });

  return { passed, total, logs };
}

// When run directly with tsx
if (typeof process !== 'undefined' && process.argv && process.argv[1] && import.meta.url === `file://${process.argv[1]}`) {
  console.log('--- Running Plainly Cost Estimator Unit Tests ---');
  const result = runCostEstimatorTests();
  result.logs.forEach(l => console.log(l));
  console.log(`\nResult: ${result.passed}/${result.total} tests passed.`);
  if (result.passed !== result.total) {
    process.exit(1);
  }
}
