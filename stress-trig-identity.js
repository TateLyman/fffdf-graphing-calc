'use strict';

const { trigIdentitySimplify } = require('./trig-identity-simplify.js');

// STRESS TEST - Trig Identity Simplification
//
// IDENTITIES USED:
// ============================================
// RECIPROCAL:
//   sec(x) = 1/cos(x)
//   csc(x) = 1/sin(x)
//   cot(x) = 1/tan(x) = cos(x)/sin(x)
//
// PYTHAGOREAN:
//   sin²(x) + cos²(x) = 1
//   1 + tan²(x) = sec²(x)
//   1 + cot²(x) = csc²(x)
//   → sin²(x) = 1 - cos²(x)
//   → cos²(x) = 1 - sin²(x)
//   → tan²(x) = sec²(x) - 1
//   → cot²(x) = csc²(x) - 1
//
// QUOTIENT:
//   tan(x) = sin(x)/cos(x)
//   cot(x) = cos(x)/sin(x)
// ============================================

const tests = [
  {
    input: 'cos^2(x)sec(x)',
    note: 'WORKSHEET PROBLEM 24',
    simplified: 'cos(x)',
    steps: ['cos²(x) · 1/cos(x)', 'cancel one cos(x)', '= cos(x)'],
    desmosOriginal: '\\cos^2(x)\\cdot\\frac{1}{\\cos(x)}',
    desmosSimplified: '\\cos(x)'
  },
  {
    input: '(1 - sin^2(x))csc^2(x)',
    note: 'WORKSHEET PROBLEM 25',
    simplified: 'cot^2(x)',
    steps: [
      '1 - sin²(x) = cos²(x)',
      'cos²(x) · csc²(x)',
      'cos²(x) · 1/sin²(x)',
      '= cos²(x)/sin²(x)',
      '= cot²(x)'
    ],
    desmosOriginal: '(1-\\sin^2(x))\\cdot\\frac{1}{\\sin^2(x)}',
    desmosSimplified: '\\cot^2(x)'
  },
  {
    input: '1 / (1 + cot^2(x))',
    note: 'WORKSHEET PROBLEM 26',
    simplified: 'sin^2(x)',
    steps: ['1 + cot²(x) = csc²(x)', '1/csc²(x)', '= sin²(x)'],
    desmosOriginal: '\\frac{1}{1+\\cot^2(x)}',
    desmosSimplified: '\\sin^2(x)'
  },
  {
    input: 'sin(x)sec(x)',
    note: '3.12A PROBLEM 1',
    simplified: 'tan(x)',
    steps: ['sin(x) · 1/cos(x)', '= sin(x)/cos(x)', '= tan(x)']
  },
  {
    input: '(1 - sin^2(x))sec(x)',
    note: '3.12A PROBLEM 2',
    simplified: 'cos(x)',
    steps: ['1 - sin²(x) = cos²(x)', 'cos²(x) · 1/cos(x)', '= cos(x)']
  },
  {
    input: 'sin^2(x) + cos^2(x) + cot^2(x)',
    note: '3.12A PROBLEM 3',
    simplified: 'csc^2(x)',
    steps: ['sin²(x) + cos²(x) = 1', '1 + cot²(x) = csc²(x)']
  },
  {
    input: 'sin(x)csc(x) / cot(x)',
    note: '3.12A PROBLEM 4',
    simplified: 'tan(x)',
    steps: [
      'sin(x) · csc(x) = sin(x) · 1/sin(x) = 1',
      '1 / cot(x) = tan(x)'
    ]
  },
  {
    input: '(sec^2(x) - 1) / cot(x)',
    note: '3.12A PROBLEM 5',
    simplified: 'tan^3(x)',
    steps: [
      'sec²(x) - 1 = tan²(x)',
      'tan²(x) / cot(x)',
      'tan²(x) · tan(x)',
      '= tan³(x)'
    ]
  },
  {
    input: 'sec(x) / cos(x)',
    note: '3.12A PROBLEM 6',
    simplified: 'sec^2(x)',
    steps: ['sec(x)/cos(x)', '= 1/cos(x) · 1/cos(x)', '= 1/cos²(x)', '= sec²(x)']
  },
  {
    input: 'sin^2(x) + cos^2(x)',
    simplified: '1',
    steps: ['Pythagorean identity']
  },
  {
    input: 'tan(x)cos(x)',
    simplified: 'sin(x)',
    steps: ['tan(x) = sin(x)/cos(x)', 'sin(x)/cos(x) · cos(x) = sin(x)']
  },
  {
    input: 'cot(x)sin(x)',
    simplified: 'cos(x)',
    steps: ['cot(x) = cos(x)/sin(x)', 'cos(x)/sin(x) · sin(x) = cos(x)']
  },
  {
    input: 'tan(x) / sin(x)',
    simplified: 'sec(x)',
    steps: ['tan(x)/sin(x) = sin(x)/cos(x)/sin(x) = 1/cos(x) = sec(x)']
  },
  {
    input: 'cos(x) / cot(x)',
    simplified: 'sin(x)',
    steps: ['cos(x) · sin(x)/cos(x) = sin(x)']
  },
  {
    input: 'sec^2(x) - tan^2(x)',
    simplified: '1',
    steps: ['sec²(x) = 1 + tan²(x)', '1 + tan²(x) - tan²(x) = 1']
  },
  {
    input: 'csc^2(x) - cot^2(x)',
    simplified: '1',
    steps: ['csc²(x) = 1 + cot²(x)', '1 + cot²(x) - cot²(x) = 1']
  },
  {
    input: 'sin(x) / tan(x)',
    simplified: 'cos(x)',
    steps: ['sin(x) · cos(x)/sin(x) = cos(x)']
  },
  {
    input: 'tan^2(x) + 1',
    simplified: 'sec^2(x)',
    steps: ['Pythagorean identity: 1 + tan²(x) = sec²(x)']
  },
  {
    input: 'cot^2(x) + 1',
    simplified: 'csc^2(x)',
    steps: ['Pythagorean identity: 1 + cot²(x) = csc²(x)']
  },
  {
    input: '1 - cos^2(x)',
    simplified: 'sin^2(x)',
    steps: ['sin²(x) + cos²(x) = 1 → 1 - cos²(x) = sin²(x)']
  },
  {
    input: '1 - sin^2(x)',
    simplified: 'cos^2(x)',
    steps: ['sin²(x) + cos²(x) = 1 → 1 - sin²(x) = cos²(x)']
  },
  {
    input: 'sec^2(x) - 1',
    simplified: 'tan^2(x)',
    steps: ['sec²(x) = 1 + tan²(x) → sec²(x) - 1 = tan²(x)']
  },
  {
    input: 'csc^2(x) - 1',
    simplified: 'cot^2(x)',
    steps: ['csc²(x) = 1 + cot²(x) → csc²(x) - 1 = cot²(x)']
  },
  {
    input: 'sin^2(x)csc(x)',
    simplified: 'sin(x)',
    steps: ['sin²(x) · 1/sin(x) = sin(x)']
  },
  {
    input: 'cos^2(x)sec^2(x)',
    simplified: '1',
    steps: ['cos²(x) · 1/cos²(x) = 1']
  },
  {
    input: 'tan(x)cot(x)',
    simplified: '1',
    steps: ['tan(x) · cot(x) = sin(x)/cos(x) · cos(x)/sin(x) = 1']
  },
  {
    input: 'sin(x)csc(x)',
    simplified: '1',
    steps: ['sin(x) · 1/sin(x) = 1']
  },
  {
    input: 'cos(x)sec(x)',
    simplified: '1',
    steps: ['cos(x) · 1/cos(x) = 1']
  }
];

function runTests(yourSimplifyFunction) {
  let passed = 0;
  let failed = 0;
  const failures = [];

  for (const test of tests) {
    const result = yourSimplifyFunction(test.input);

    const normalize = (s) => s.replace(/\s+/g, '').toLowerCase();

    if (normalize(result.simplified) === normalize(test.simplified)) {
      passed++;
    } else {
      failed++;
      failures.push(
        `❌ "${test.input}": got "${result.simplified}", expected "${test.simplified}"${
          test.note ? ' (' + test.note + ')' : ''
        }`
      );
    }
  }

  console.log(`\n${'='.repeat(50)}`);
  console.log(`IDENTITY TESTS: ${passed} passed, ${failed} failed out of ${passed + failed}`);
  console.log(`${'='.repeat(50)}\n`);

  if (failures.length > 0) {
    console.log('FAILURES:');
    failures.forEach((f) => console.log(f));
  } else {
    console.log('✅ ALL TESTS PASSED');
  }
}

if (require.main === module) {
  runTests(trigIdentitySimplify);
}

module.exports = { tests, runTests };
