'use strict';

const { create, all } = require('mathjs');
const math = create(all, {});
const { setMath, asymptoteFormula } = require('./asymptote.js');
setMath(math);

const tests = [
  { input: 'tan(x)', expectedFormula: 'x = π/2 + πk' },
  { input: 'tan(2x)', expectedFormula: 'x = π/4 + (π/2)k' },
  { input: 'tan(3x)', expectedFormula: 'x = π/6 + (π/3)k' },
  { input: 'tan(x/2)', expectedFormula: 'x = π + 2πk' },
  { input: 'tan(x/6)', expectedFormula: 'x = 3π + 6πk' },
  { input: 'tan(x/3)', expectedFormula: 'x = 3π/2 + 3πk' },
  { input: 'tan(x + pi/4)', expectedFormula: 'x = π/4 + πk' },
  { input: 'tan(theta + pi/4)', expectedFormula: 'x = π/4 + πk' },
  { input: 'tan(x - pi/3)', expectedFormula: 'x = 5π/6 + πk' },
  { input: 'tan(2x + pi)', expectedFormula: 'x = -π/4 + (π/2)k' },
  { input: 'tan(2x - pi/2)', expectedFormula: 'x = π/2 + (π/2)k' },
  { input: 'tan(3x + pi/6)', expectedFormula: 'x = π/9 + (π/3)k' },
  { input: '-2tan(2x) + 3', expectedFormula: 'x = π/4 + (π/2)k' },
  { input: '5tan(x) - 10', expectedFormula: 'x = π/2 + πk' },
  { input: '-tan(x/4)', expectedFormula: 'x = 2π + 4πk' },
  { input: 'cot(x)', expectedFormula: 'x = πk' },
  { input: 'cot(2x)', expectedFormula: 'x = (π/2)k' },
  { input: 'cot(x/2)', expectedFormula: 'x = 2πk' },
  { input: 'cot(x + pi/4)', expectedFormula: 'x = -π/4 + πk' },
  { input: 'cot(x - pi/6)', expectedFormula: 'x = π/6 + πk' },
  { input: 'cot(3x - pi/2)', expectedFormula: 'x = π/6 + (π/3)k' },
  { input: 'csc(x)', expectedFormula: 'x = πk' },
  { input: '2csc(x + pi/2) - 1', expectedFormula: 'x = -π/2 + πk' },
  { input: 'csc(2x)', expectedFormula: 'x = (π/2)k' },
  { input: 'csc(x/3)', expectedFormula: 'x = 3πk' },
  { input: 'sec(x)', expectedFormula: 'x = π/2 + πk' },
  { input: '3sec(x/2)', expectedFormula: 'x = π + 2πk' },
  { input: 'sec(2x)', expectedFormula: 'x = π/4 + (π/2)k' },
  { input: 'sec(x + pi/3)', expectedFormula: 'x = π/6 + πk' },
  { input: '-sec(3x - pi/4)', expectedFormula: 'x = π/4 + (π/3)k' },
  { input: 'tan(pi*x)', expectedFormula: 'x = 1/2 + k' },
  { input: 'tan(0.5x)', expectedFormula: 'x = π + 2πk' },
  { input: 'cot(4x + pi)', expectedFormula: 'x = -π/4 + (π/4)k' },
  { input: 'tan(-x)', expectedFormula: 'x = -π/2 + πk' },
  { input: 'sin(x)', expectedFormula: 'none' },
  { input: 'cos(x)', expectedFormula: 'none' },
  { input: '2sin(3x + pi) - 5', expectedFormula: 'none' },
  { input: 'tan(x/6)', expectedFormula: 'x = 3π + 6πk' },
  { input: 'tan(x + pi/4) - 1', expectedFormula: 'x = π/4 + πk' },
  { input: '-2tan(2x) + 3', expectedFormula: 'x = π/4 + (π/2)k' },
  { input: '2csc(x + pi/2) - 1', expectedFormula: 'x = -π/2 + πk' },
  { input: '3sec(x/2)', expectedFormula: 'x = π + 2πk' }
];

function normalize(s) {
  return String(s).replace(/\s+/g, '').toLowerCase();
}

function runTests(fn) {
  let passed = 0;
  let failed = 0;
  const failures = [];

  for (const test of tests) {
    const result = fn(test.input);
    if (normalize(result) === normalize(test.expectedFormula)) {
      passed++;
    } else {
      failed++;
      failures.push('❌ ' + test.input + ': got "' + result + '", expected "' + test.expectedFormula + '"');
    }
  }

  console.log('\n' + '='.repeat(50));
  console.log('ASYMPTOTE TESTS: ' + passed + ' passed, ' + failed + ' failed out of ' + (passed + failed));
  console.log('='.repeat(50) + '\n');

  if (failures.length > 0) {
    console.log('FAILURES:');
    failures.forEach(function (f) {
      console.log(f);
    });
    process.exitCode = 1;
  } else {
    console.log('✅ ALL TESTS PASSED');
  }
}

if (require.main === module) {
  runTests(asymptoteFormula);
}

module.exports = { tests, runTests };
