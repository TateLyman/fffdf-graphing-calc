'use strict';

const { sumDiffAnalyze } = require('./sum-diff-formulas.js');

// STRESS TEST - Sum/Difference Formulas
//
// FORMULAS:
// ============================================
// sin(A ± B) = sin(A)cos(B) ± cos(A)sin(B)
// cos(A ± B) = cos(A)cos(B) ∓ sin(A)sin(B)
// tan(A ± B) = (tan(A) ± tan(B)) / (1 ∓ tan(A)tan(B))
// ============================================

const tests = [
  {
    input: 'sin(3pi/4 - 5pi/6)',
    note: 'WORKSHEET PROBLEM 27',
    exact: '(√2 - √6) / 4',
    decimal: '-0.2588',
    steps: [
      'sin(3π/4)cos(5π/6) - cos(3π/4)sin(5π/6)',
      '(√2/2)(-√3/2) - (-√2/2)(1/2)',
      '-√6/4 + √2/4',
      '= (√2 - √6)/4'
    ]
  },
  {
    input: 'cos(pi/2 + 2pi/3)',
    note: 'WORKSHEET PROBLEM 28',
    exact: '-√3 / 2',
    decimal: '-0.8660',
    steps: [
      'cos(π/2)cos(2π/3) - sin(π/2)sin(2π/3)',
      '0·(-1/2) - 1·(√3/2)',
      '= -√3/2'
    ]
  },
  {
    input: 'sin(3pi/4 - 5pi/3)',
    note: '3.12B PROBLEM 1',
    exact: '(√2 - √6) / 4',
    decimal: '-0.2588',
    steps: [
      'sin(3π/4)cos(5π/3) - cos(3π/4)sin(5π/3)',
      '(√2/2)(1/2) - (-√2/2)(-√3/2)',
      '√2/4 - √6/4',
      '= (√2 - √6)/4'
    ]
  },
  {
    input: 'cos(pi/2 + 4pi/3)',
    note: '3.12B PROBLEM 2',
    exact: '√3 / 2',
    decimal: '0.8660',
    steps: [
      'cos(π/2)cos(4π/3) - sin(π/2)sin(4π/3)',
      '0·(-1/2) - 1·(-√3/2)',
      '= √3/2'
    ]
  },
  {
    input: 'cos(pi - 7pi/6)',
    note: '3.12B PROBLEM 3',
    exact: '√3 / 2',
    decimal: '0.8660',
    steps: [
      'cos(π)cos(7π/6) + sin(π)sin(7π/6)',
      '(-1)(-√3/2) + 0',
      '= √3/2'
    ]
  },
  {
    input: 'sin(7pi/4 - pi/6)',
    note: '3.12B PROBLEM 4',
    exact: '(-√6 - √2) / 4',
    decimal: '-0.9659',
    steps: [
      'sin(7π/4)cos(π/6) - cos(7π/4)sin(π/6)',
      '(-√2/2)(√3/2) - (√2/2)(1/2)',
      '-√6/4 - √2/4',
      '= (-√6 - √2)/4'
    ]
  },
  {
    input: 'sin(x - 4pi/3)',
    note: '3.12B PROBLEM 5',
    exact: '-1/2·sin(x) + √3/2·cos(x)',
    steps: [
      'sin(x)cos(4π/3) - cos(x)sin(4π/3)',
      'sin(x)(-1/2) - cos(x)(-√3/2)',
      '= -sin(x)/2 + √3cos(x)/2'
    ]
  },
  {
    input: 'cos(3pi/2 + x)',
    note: '3.12B PROBLEM 6',
    exact: 'sin(x)',
    steps: [
      'cos(3π/2)cos(x) - sin(3π/2)sin(x)',
      '0·cos(x) - (-1)·sin(x)',
      '= sin(x)'
    ]
  },
  {
    input: 'cos(x - pi)',
    note: '3.12B PROBLEM 7',
    exact: '-cos(x)',
    steps: [
      'cos(x)cos(π) + sin(x)sin(π)',
      'cos(x)(-1) + 0',
      '= -cos(x)'
    ]
  },
  {
    input: 'sin(pi/4 + pi/6)',
    exact: '(√6 + √2) / 4',
    decimal: '0.9659'
  },
  {
    input: 'cos(pi/4 - pi/6)',
    exact: '(√6 + √2) / 4',
    decimal: '0.9659'
  },
  {
    input: 'sin(pi/3 + pi/4)',
    exact: '(√6 + √2) / 4',
    decimal: '0.9659'
  },
  {
    input: 'cos(pi/3 + pi/6)',
    exact: '0',
    decimal: '0',
    note: 'simplifies to cos(π/2)'
  },
  {
    input: 'sin(pi/6 + pi/6)',
    exact: '√3 / 2',
    decimal: '0.8660',
    note: 'simplifies to sin(π/3)'
  },
  {
    input: 'cos(pi/4 + pi/4)',
    exact: '0',
    decimal: '0',
    note: 'simplifies to cos(π/2)'
  },
  {
    input: 'sin(x + pi/6)',
    exact: '√3/2·sin(x) + 1/2·cos(x)',
    steps: [
      'sin(x)cos(π/6) + cos(x)sin(π/6)',
      '= √3/2·sin(x) + 1/2·cos(x)'
    ]
  },
  {
    input: 'cos(x + pi/3)',
    exact: '1/2·cos(x) - √3/2·sin(x)',
    steps: [
      'cos(x)cos(π/3) - sin(x)sin(π/3)',
      '= 1/2·cos(x) - √3/2·sin(x)'
    ]
  },
  {
    input: 'sin(x + pi/4)',
    exact: '√2/2·sin(x) + √2/2·cos(x)'
  },
  {
    input: 'cos(x - pi/6)',
    exact: '√3/2·cos(x) + 1/2·sin(x)'
  },
  {
    input: 'sin(x - pi/2)',
    exact: '-cos(x)',
    steps: ['sin(x)(0) - cos(x)(1)', '= -cos(x)']
  },
  {
    input: 'cos(x + pi)',
    exact: '-cos(x)'
  },
  {
    input: 'sin(x + pi)',
    exact: '-sin(x)'
  },
  {
    input: 'sin(pi/12)',
    exact: '(√6 - √2) / 4',
    decimal: '0.2588',
    note: 'rewrite as π/3 - π/4',
    steps: [
      'sin(π/3)cos(π/4) - cos(π/3)sin(π/4)',
      '(√3/2)(√2/2) - (1/2)(√2/2)',
      '√6/4 - √2/4',
      '= (√6 - √2)/4'
    ]
  },
  {
    input: 'cos(5pi/12)',
    exact: '(√6 - √2) / 4',
    decimal: '0.2588',
    note: 'rewrite as π/6 + π/4',
    steps: [
      'cos(π/6)cos(π/4) - sin(π/6)sin(π/4)',
      '(√3/2)(√2/2) - (1/2)(√2/2)',
      '√6/4 - √2/4',
      '= (√6 - √2)/4'
    ]
  }
];

function runTests(yourSumDiffFunction) {
  let passed = 0;
  let failed = 0;
  const failures = [];

  for (const test of tests) {
    const result = yourSumDiffFunction(test.input);
    const normalize = (s) => s.replace(/\s+/g, '').toLowerCase();

    const exactOk = normalize(result.exact) === normalize(test.exact);

    let decimalOk = true;
    if (test.decimal !== undefined) {
      decimalOk =
        Math.abs(parseFloat(result.decimal) - parseFloat(test.decimal)) < 0.001;
    }

    if (exactOk && decimalOk) {
      passed++;
    } else {
      failed++;
      let msg = `❌ "${test.input}":`;
      if (!exactOk) msg += ` exact got "${result.exact}", expected "${test.exact}"`;
      if (!decimalOk) msg += ` decimal got "${result.decimal}", expected "${test.decimal}"`;
      if (test.note) msg += ` (${test.note})`;
      failures.push(msg);
    }
  }

  console.log(`\n${'='.repeat(50)}`);
  console.log(`SUM/DIFF TESTS: ${passed} passed, ${failed} failed out of ${passed + failed}`);
  console.log(`${'='.repeat(50)}\n`);

  if (failures.length > 0) {
    console.log('FAILURES:');
    failures.forEach((f) => console.log(f));
  } else {
    console.log('✅ ALL TESTS PASSED');
  }
}

if (require.main === module) {
  runTests(sumDiffAnalyze);
}

module.exports = { tests, runTests };
