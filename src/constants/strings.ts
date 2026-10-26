/**
 * Central strings dictionary for Plainly.
 * All insurance-specific terms, plain explanations, and safety disclaimers live here.
 * Reading level: Grade 6 to 8. No jargon without an immediate plain explanation.
 */

export const STRINGS = {
  app: {
    name: 'Plainly',
    tagline: 'Understand your insurance before you pay.',
    heroSubtitle: 'Plain words. Verifiable proof from your own document. No surprise bills.',
  },

  disclaimers: {
    persistent:
      'This explains your documents. It isn\'t a promise of coverage. Confirm with your insurer before treatment.',
    medicalAdviceRefusal:
      'Plainly cannot provide medical advice. Please consult your physician for care choices. We can help you understand what your policy pays for this procedure.',
    notFactualAdvice:
      'Always request an in-network confirmation and procedure code (CPT) check directly from your doctor and insurer before treatment.',
  },

  confidence: {
    clear: {
      title: 'Clear in your policy',
      description: 'Your document explicitly states this benefit with exact terms.',
      badgeLabel: 'Clear in policy',
    },
    partly_clear: {
      title: 'Partly clear',
      description: 'The document mentions this benefit, but some conditions or specific dollar limits depend on your provider.',
      badgeLabel: 'Partly clear',
    },
    not_found: {
      title: 'Not found in your policy',
      description: 'We searched your document and could not find an explicit statement about this. Ask your insurer before booking.',
      badgeLabel: 'Not found in document',
    },
  },

  jargon: {
    deductible: {
      term: 'Deductible',
      shortDef: 'The amount you pay yourself before insurance starts helping.',
      fullDef: 'A fixed dollar amount you must spend each year out of your own pocket on covered healthcare before your insurer begins paying their share.',
      example: 'If your deductible is $1,000, you pay the first $1,000 of covered medical bills.',
    },
    outOfPocketMax: {
      term: 'Out-of-Pocket Maximum',
      shortDef: 'The most you can possibly pay for covered care in one plan year.',
      fullDef: 'After your total payments (deductible, copays, and coinsurance) reach this limit, insurance pays 100% of covered services for the rest of the year.',
      example: 'If your max is $4,000 and you have paid $4,000 this year, your next covered specialist visit costs $0.',
    },
    copay: {
      term: 'Copay (Copayment)',
      shortDef: 'A fixed flat dollar fee you pay at the front desk when you visit.',
      fullDef: 'A preset amount you pay for a specific covered service, like $25 for a primary doctor or $10 for generic medicine.',
      example: 'You see your regular doctor and hand them a flat $20 fee at check-in.',
    },
    coinsurance: {
      term: 'Coinsurance',
      shortDef: 'Your share of costs, paid as a percentage, after your deductible is met.',
      fullDef: 'A split between you and your insurer after you pay your deductible. Commonly 80/20 (insurer pays 80%, you pay 20%).',
      example: 'If a scan is $500 and your coinsurance is 20%, you pay $100 and insurance pays $400.',
    },
    inNetwork: {
      term: 'In-Network Provider',
      shortDef: 'Doctors and hospitals that agreed to discount their rates with your insurer.',
      fullDef: 'Healthcare providers who have signed a contract with your health insurance company to charge agreed, lower rates.',
      example: 'Seeing an in-network doctor prevents surprise balance billing and gives you the highest insurance discounts.',
    },
    outOfNetwork: {
      term: 'Out-of-Network Provider',
      shortDef: 'Providers who have no contract with your plan. Costs are much higher.',
      fullDef: 'Doctors who do not have a contract with your insurer. You may have to pay the entire bill yourself or pay a much higher deductible.',
      example: 'An out-of-network clinic may bill you for whatever your insurance refuses to pay (balance billing).',
    },
    priorAuthorization: {
      term: 'Prior Authorization (Pre-Approval)',
      shortDef: 'Written permission from your insurer before they agree to pay for a treatment.',
      fullDef: 'A requirement that your doctor submit paperwork proving a procedure, scan, or medication is medically necessary before you receive it.',
      example: 'MRIs and complex surgeries almost always need prior authorization. Without it, insurance can refuse to pay at all.',
    },
    annualLimit: {
      term: 'Annual Limit (Maximum Benefit)',
      shortDef: 'The highest dollar amount an insurer will pay for your care in one year.',
      fullDef: 'Common in dental and vision insurance (e.g. $1,500 per year). Once insurance has paid this amount, you pay 100% of all further costs until next year.',
      example: 'If your dental limit is $1,500 and insurance paid $1,500 on dental crowns, you pay 100% of any remaining dental work this year.',
    },
    waitingPeriod: {
      term: 'Waiting Period',
      shortDef: 'The time you must wait after buying insurance before a benefit is covered.',
      fullDef: 'A delay before insurance pays for major work (especially common in dental for crowns or braces).',
      example: 'A 6-month waiting period on major dental means cleanings are covered today, but crowns are not covered until month 7.',
    },
    formulary: {
      term: 'Formulary (Drug List)',
      shortDef: 'The official list of prescription medicines your insurance agrees to pay for.',
      fullDef: 'Drugs are usually organized into tiers (Tier 1 is cheapest generic; Tier 4 is expensive specialty medicine).',
      example: 'If your blood pressure medicine is on Tier 1, your copay is typically only $5 to $10.',
    },
  },

  checklists: {
    specialist: {
      title: 'Visiting a Specialist (e.g., Dermatologist, Cardiologist)',
      items: [
        {
          task: 'Check if you need a primary care doctor referral',
          explanation: 'HMO plans require a signed referral from your primary doctor first, or they will refuse payment.',
          category: 'before_visit' as const,
        },
        {
          task: 'Confirm the doctor AND facility are in-network',
          explanation: 'Sometimes a doctor is in-network, but the hospital or clinic they work at is out-of-network.',
          category: 'before_visit' as const,
        },
        {
          task: 'Ask the clinic for the billing code (CPT code)',
          explanation: 'Having the 5-digit code lets you call your insurer and get an exact copay or deductible answer.',
          category: 'before_visit' as const,
        },
        {
          task: 'Bring your physical insurance card and photo ID',
          explanation: 'Front desks must verify the group and member ID numbers printed on the card.',
          category: 'at_checkin' as const,
        },
        {
          task: 'Pay only your copay at check-in',
          explanation: 'Do not pay estimated coinsurance before the clinic bills insurance, unless required by policy.',
          category: 'billing' as const,
        },
      ],
    },
    imaging: {
      title: 'Getting an MRI, CT Scan, or Ultrasound',
      items: [
        {
          task: 'Confirm Prior Authorization is approved in writing',
          explanation: 'Almost all major scans require pre-approval. Get the approval reference number from your doctor.',
          category: 'before_visit' as const,
        },
        {
          task: 'Ask if an independent imaging center is cheaper than a hospital',
          explanation: 'Free-standing imaging centers can cost 50% less for the exact same scan compared to hospital radiology.',
          category: 'before_visit' as const,
        },
        {
          task: 'Verify the reading radiologist is in-network',
          explanation: 'The technician taking the scan and the radiologist reading the scan bill separately.',
          category: 'before_visit' as const,
        },
        {
          task: 'Request an itemized estimate from the facility',
          explanation: 'Having written documentation protects you against unexpected facility fees.',
          category: 'billing' as const,
        },
      ],
    },
    dental: {
      title: 'Major Dental Care (Crowns, Root Canals, Bridges)',
      items: [
        {
          task: 'Check if you have finished your waiting period',
          explanation: 'Many dental plans have a 6 to 12 month waiting period before covering major restorative work.',
          category: 'before_visit' as const,
        },
        {
          task: 'Ask your dentist for a "Pre-Treatment Estimate"',
          explanation: 'The dentist sends the planned work to your insurer before drilling, so you know the exact balance.',
          category: 'before_visit' as const,
        },
        {
          task: 'Check your remaining annual dental maximum',
          explanation: 'If you have only $400 left on your yearly maximum, any cost over $400 is paid 100% by you.',
          category: 'before_visit' as const,
        },
        {
          task: 'Ask about the crown material covered',
          explanation: 'Some plans only pay for metal crowns on back teeth, charging extra if you choose porcelain.',
          category: 'at_checkin' as const,
        },
      ],
    },
  },

  countries: [
    { code: 'US', name: 'United States', currency: 'USD', symbol: '$' },
    { code: 'CA', name: 'Canada', currency: 'CAD', symbol: 'CA$' },
    { code: 'UK', name: 'United Kingdom', currency: 'GBP', symbol: '£' },
    { code: 'AU', name: 'Australia', currency: 'AUD', symbol: 'A$' },
    { code: 'EU', name: 'European Union', currency: 'EUR', symbol: '€' },
  ],
};
