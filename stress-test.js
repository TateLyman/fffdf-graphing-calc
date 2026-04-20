'use strict';

const { create, all } = require('mathjs');
const math = create(all, {});
const { createExactEvaluator } = require('./exact-evaluate.js');

const yourEvaluate = createExactEvaluator(math);

const tests = [
  { input: 'sin(0)', expected: '0' },
  { input: 'sin(pi/6)', expected: '1/2' },
  { input: 'sin(pi/4)', expected: '√2/2' },
  { input: 'sin(pi/3)', expected: '√3/2' },
  { input: 'sin(pi/2)', expected: '1' },
  { input: 'sin(2pi/3)', expected: '√3/2' },
  { input: 'sin(3pi/4)', expected: '√2/2' },
  { input: 'sin(5pi/6)', expected: '1/2' },
  { input: 'sin(pi)', expected: '0' },
  { input: 'sin(7pi/6)', expected: '-1/2' },
  { input: 'sin(5pi/4)', expected: '-√2/2' },
  { input: 'sin(4pi/3)', expected: '-√3/2' },
  { input: 'sin(3pi/2)', expected: '-1' },
  { input: 'sin(5pi/3)', expected: '-√3/2' },
  { input: 'sin(7pi/4)', expected: '-√2/2' },
  { input: 'sin(11pi/6)', expected: '-1/2' },
  { input: 'sin(2pi)', expected: '0' },

  { input: 'cos(0)', expected: '1' },
  { input: 'cos(pi/6)', expected: '√3/2' },
  { input: 'cos(pi/4)', expected: '√2/2' },
  { input: 'cos(pi/3)', expected: '1/2' },
  { input: 'cos(pi/2)', expected: '0' },
  { input: 'cos(2pi/3)', expected: '-1/2' },
  { input: 'cos(3pi/4)', expected: '-√2/2' },
  { input: 'cos(5pi/6)', expected: '-√3/2' },
  { input: 'cos(pi)', expected: '-1' },
  { input: 'cos(7pi/6)', expected: '-√3/2' },
  { input: 'cos(5pi/4)', expected: '-√2/2' },
  { input: 'cos(4pi/3)', expected: '-1/2' },
  { input: 'cos(3pi/2)', expected: '0' },
  { input: 'cos(5pi/3)', expected: '1/2' },
  { input: 'cos(7pi/4)', expected: '√2/2' },
  { input: 'cos(11pi/6)', expected: '√3/2' },
  { input: 'cos(2pi)', expected: '1' },

  { input: 'tan(0)', expected: '0' },
  { input: 'tan(pi/6)', expected: '√3/3' },
  { input: 'tan(pi/4)', expected: '1' },
  { input: 'tan(pi/3)', expected: '√3' },
  { input: 'tan(pi/2)', expected: 'undefined' },
  { input: 'tan(2pi/3)', expected: '-√3' },
  { input: 'tan(3pi/4)', expected: '-1' },
  { input: 'tan(5pi/6)', expected: '-√3/3' },
  { input: 'tan(pi)', expected: '0' },
  { input: 'tan(7pi/6)', expected: '√3/3' },
  { input: 'tan(5pi/4)', expected: '1' },
  { input: 'tan(4pi/3)', expected: '√3' },
  { input: 'tan(3pi/2)', expected: 'undefined' },
  { input: 'tan(5pi/3)', expected: '-√3' },
  { input: 'tan(7pi/4)', expected: '-1' },
  { input: 'tan(11pi/6)', expected: '-√3/3' },
  { input: 'tan(2pi)', expected: '0' },

  { input: 'csc(0)', expected: 'undefined' },
  { input: 'csc(pi/6)', expected: '2' },
  { input: 'csc(pi/4)', expected: '√2' },
  { input: 'csc(pi/3)', expected: '2√3/3' },
  { input: 'csc(pi/2)', expected: '1' },
  { input: 'csc(2pi/3)', expected: '2√3/3' },
  { input: 'csc(3pi/4)', expected: '√2' },
  { input: 'csc(5pi/6)', expected: '2' },
  { input: 'csc(pi)', expected: 'undefined' },
  { input: 'csc(7pi/6)', expected: '-2' },
  { input: 'csc(5pi/4)', expected: '-√2' },
  { input: 'csc(4pi/3)', expected: '-2√3/3' },
  { input: 'csc(3pi/2)', expected: '-1' },
  { input: 'csc(5pi/3)', expected: '-2√3/3' },
  { input: 'csc(7pi/4)', expected: '-√2' },
  { input: 'csc(11pi/6)', expected: '-2' },
  { input: 'csc(2pi)', expected: 'undefined' },

  { input: 'sec(0)', expected: '1' },
  { input: 'sec(pi/6)', expected: '2√3/3' },
  { input: 'sec(pi/4)', expected: '√2' },
  { input: 'sec(pi/3)', expected: '2' },
  { input: 'sec(pi/2)', expected: 'undefined' },
  { input: 'sec(2pi/3)', expected: '-2' },
  { input: 'sec(3pi/4)', expected: '-√2' },
  { input: 'sec(5pi/6)', expected: '-2√3/3' },
  { input: 'sec(pi)', expected: '-1' },
  { input: 'sec(7pi/6)', expected: '-2√3/3' },
  { input: 'sec(5pi/4)', expected: '-√2' },
  { input: 'sec(4pi/3)', expected: '-2' },
  { input: 'sec(3pi/2)', expected: 'undefined' },
  { input: 'sec(5pi/3)', expected: '2' },
  { input: 'sec(7pi/4)', expected: '√2' },
  { input: 'sec(11pi/6)', expected: '2√3/3' },
  { input: 'sec(2pi)', expected: '1' },

  { input: 'cot(0)', expected: 'undefined' },
  { input: 'cot(pi/6)', expected: '√3' },
  { input: 'cot(pi/4)', expected: '1' },
  { input: 'cot(pi/3)', expected: '√3/3' },
  { input: 'cot(pi/2)', expected: '0' },
  { input: 'cot(2pi/3)', expected: '-√3/3' },
  { input: 'cot(3pi/4)', expected: '-1' },
  { input: 'cot(5pi/6)', expected: '-√3' },
  { input: 'cot(pi)', expected: 'undefined' },
  { input: 'cot(7pi/6)', expected: '√3' },
  { input: 'cot(5pi/4)', expected: '1' },
  { input: 'cot(4pi/3)', expected: '√3/3' },
  { input: 'cot(3pi/2)', expected: '0' },
  { input: 'cot(5pi/3)', expected: '-√3/3' },
  { input: 'cot(7pi/4)', expected: '-1' },
  { input: 'cot(11pi/6)', expected: '-√3' },
  { input: 'cot(2pi)', expected: 'undefined' },

  { input: 'sin(-pi/2)', expected: '-1' },
  { input: 'cos(-pi/3)', expected: '1/2' },
  { input: 'tan(-pi/4)', expected: '-1' },
  { input: 'csc(-pi/2)', expected: '-1' },
  { input: 'sec(-pi/3)', expected: '2' },
  { input: 'cot(-pi/4)', expected: '-1' },
  { input: 'sin(-pi/6)', expected: '-1/2' },
  { input: 'cos(-pi/6)', expected: '√3/2' },
  { input: 'tan(-pi/6)', expected: '-√3/3' },
  { input: 'sin(-pi)', expected: '0' },
  { input: 'cos(-pi)', expected: '-1' },
  { input: 'tan(-pi)', expected: '0' },

  { input: 'sin(5pi/2)', expected: '1' },
  { input: 'cos(3pi)', expected: '-1' },
  { input: 'tan(5pi/4)', expected: '1' },
  { input: 'sin(13pi/6)', expected: '1/2' },
  { input: 'cos(7pi/3)', expected: '1/2' },

  { input: 'f(theta) = (theta/6)', expected: '≈0.5236', approx: true },
  { input: 'F ( theta ) = ( theta / 6 )', expected: '≈0.5236', approx: true },
  { input: 'f(theta) = sin(theta/6)', expected: '1/2' },
  { input: 'g(theta) = cos(theta/3)', expected: '1/2' },
  { input: 'h(theta) = tan(theta/4)', expected: '1' },
  { input: 'f(theta) = sec(theta/3)', expected: '2' },
  { input: 'f(theta) = csc(theta/6)', expected: '2' },
  { input: 'f(theta) = cot(theta/4)', expected: '1' },
  { input: '(theta/6)', expected: '≈0.5236', approx: true },
  { input: 'theta/6', expected: '≈0.5236', approx: true },
  { input: 'sin(\u2212pi/2)', expected: '-1' },
  { input: '2 sin(pi/3)', expected: '\u221a3' },
  { input: '2sin(pi/3)', expected: '\u221a3' },

  { input: 'csc(1.84)', expected: '≈1.037', approx: true },
  { input: 'sec(3pi/5)', expected: '≈-3.236', approx: true },
  { input: 'cot(4pi/9)', expected: '≈0.176', approx: true },

  // ----- final stress (whitespace, compounds, f(theta), identities) -----
  { input: 'sin((pi/6))', expected: '1/2' },
  { input: 'sin(pi/6)*2', expected: '1' },
  { input: 'sin(pi) + cos(0)', expected: '1' },
  { input: '-sin(pi/4)', expected: '-√2/2' },
  { input: '  sin(  pi/4  )  ', expected: '√2/2' },
  { input: 'f(theta) = sin(theta/2)', expected: '1' },
  { input: '(sin(pi/3))^2 + (cos(pi/3))^2', expected: '1' },
  { input: 'cos(2*pi/3) + sin(pi/6)', expected: '0' },

  { input: 'tan(1.5707)', expected: 'should be a huge number, NOT undefined', edge: true },
  { input: 'tan(pi/2)', expected: 'undefined' },
  { input: 'cot(0)', expected: 'undefined' },
  { input: 'csc(0)', expected: 'undefined' },
  { input: 'sin(2pi)', expected: '0' },
  { input: 'sin(pi)', expected: '0' },
  { input: 'tan(pi)', expected: '0' }
];

function runTests(evalFn) {
  let passed = 0;
  let failed = 0;
  const failures = [];

  for (const test of tests) {
    if (test.edge) {
      console.log(`⚠️  EDGE CASE (skipped): ${test.input} → ${test.expected}`);
      continue;
    }

    const result = evalFn(test.input);

    if (test.approx) {
      const num = parseFloat(result);
      const expectedNum = parseFloat(test.expected.replace('≈', ''));
      if (Math.abs(num - expectedNum) < 0.01) {
        passed++;
      } else {
        failed++;
        failures.push(`❌ ${test.input}: got "${result}", expected "${test.expected}"`);
      }
    } else {
      if (result === test.expected) {
        passed++;
      } else {
        failed++;
        failures.push(`❌ ${test.input}: got "${result}", expected "${test.expected}"`);
      }
    }
  }

  console.log(`\n${'='.repeat(50)}`);
  console.log(`RESULTS: ${passed} passed, ${failed} failed out of ${passed + failed}`);
  console.log(`${'='.repeat(50)}\n`);

  if (failures.length > 0) {
    console.log('FAILURES:');
    failures.forEach((f) => console.log(f));
    process.exitCode = 1;
  } else {
    console.log('✅ ALL TESTS PASSED');
  }
}

runTests(yourEvaluate);
