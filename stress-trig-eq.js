/**
 * Stress tests for trig equation solver (see trig-equation.js).
 */
const { create, all } = require('mathjs');
const { trigEquationSolve, setMath } = require('./trig-equation.js');

setMath(create(all));

const tests = [
  {
    input: '2sin(x) + 5 = 4',
    note: 'WORKSHEET PROBLEM 12',
    interval: '[0, 2pi]',
    type: 'exact',
    solutions: ['7π/6', '11π/6']
  },
  {
    input: 'cos^2(x) + cos(x) = 0',
    note: 'WORKSHEET PROBLEM 13',
    interval: '[0, 2pi]',
    type: 'exact',
    solutions: ['π/2', 'π', '3π/2']
  },
  {
    input: '5 + 5sin^2(x) = 8',
    note: 'WORKSHEET PROBLEM 14',
    interval: 'all',
    type: 'approximate',
    solutions: ['x ≈ 0.886 + πn', 'x ≈ -0.886 + πn']
  },
  {
    input: 'tan^2(x) - 3tan(x) = 18',
    note: 'WORKSHEET PROBLEM 15',
    interval: 'all',
    type: 'approximate',
    solutions: ['x ≈ 1.406 + πn', 'x ≈ -1.249 + πn']
  },
  { input: 'sin(x) = 0', interval: '[0, 2pi]', type: 'exact', solutions: ['0', 'π', '2π'] },
  { input: 'sin(x) = 1', interval: '[0, 2pi]', type: 'exact', solutions: ['π/2'] },
  { input: 'sin(x) = -1', interval: '[0, 2pi]', type: 'exact', solutions: ['3π/2'] },
  { input: 'sin(x) = 1/2', interval: '[0, 2pi]', type: 'exact', solutions: ['π/6', '5π/6'] },
  { input: 'sin(x) = -1/2', interval: '[0, 2pi]', type: 'exact', solutions: ['7π/6', '11π/6'] },
  { input: 'sin(x) = sqrt(2)/2', interval: '[0, 2pi]', type: 'exact', solutions: ['π/4', '3π/4'] },
  { input: 'sin(x) = sqrt(3)/2', interval: '[0, 2pi]', type: 'exact', solutions: ['π/3', '2π/3'] },
  { input: '2sin(x) = sqrt(3)', interval: '[0, 2pi]', type: 'exact', solutions: ['π/3', '2π/3'] },
  { input: 'cos(x) = 0', interval: '[0, 2pi]', type: 'exact', solutions: ['π/2', '3π/2'] },
  { input: 'cos(x) = 1', interval: '[0, 2pi]', type: 'exact', solutions: ['0', '2π'] },
  { input: 'cos(x) = -1', interval: '[0, 2pi]', type: 'exact', solutions: ['π'] },
  { input: 'cos(x) = 1/2', interval: '[0, 2pi]', type: 'exact', solutions: ['π/3', '5π/3'] },
  { input: 'cos(x) = -1/2', interval: '[0, 2pi]', type: 'exact', solutions: ['2π/3', '4π/3'] },
  { input: 'cos(x) = sqrt(2)/2', interval: '[0, 2pi]', type: 'exact', solutions: ['π/4', '7π/4'] },
  { input: 'cos(x) = -sqrt(3)/2', interval: '[0, 2pi]', type: 'exact', solutions: ['5π/6', '7π/6'] },
  { input: 'tan(x) = 0', interval: '[0, 2pi]', type: 'exact', solutions: ['0', 'π', '2π'] },
  { input: 'tan(x) = 1', interval: '[0, 2pi]', type: 'exact', solutions: ['π/4', '5π/4'] },
  { input: 'tan(x) = -1', interval: '[0, 2pi]', type: 'exact', solutions: ['3π/4', '7π/4'] },
  { input: 'tan(x) = sqrt(3)', interval: '[0, 2pi]', type: 'exact', solutions: ['π/3', '4π/3'] },
  { input: 'tan(x) = -sqrt(3)', interval: '[0, 2pi]', type: 'exact', solutions: ['2π/3', '5π/3'] },
  { input: 'tan(x) = sqrt(3)/3', interval: '[0, 2pi]', type: 'exact', solutions: ['π/6', '7π/6'] },
  { input: 'sin^2(x) - sin(x) = 0', interval: '[0, 2pi]', type: 'exact', solutions: ['0', 'π/2', 'π', '2π'] },
  { input: '2cos^2(x) - cos(x) - 1 = 0', interval: '[0, 2pi]', type: 'exact', solutions: ['0', '2π/3', '4π/3', '2π'] },
  { input: '2sin^2(x) + sin(x) - 1 = 0', interval: '[0, 2pi]', type: 'exact', solutions: ['π/6', '5π/6', '3π/2'] },
  { input: 'tan^2(x) - 1 = 0', interval: '[0, 2pi]', type: 'exact', solutions: ['π/4', '3π/4', '5π/4', '7π/4'] },
  {
    input: 'sin^2(x) + cos(x) + 1 = 0',
    interval: '[0, 2pi]',
    type: 'exact',
    solutions: ['π']
  },
  { input: 'sin(x) = 2', interval: '[0, 2pi]', type: 'exact', solutions: [] },
  { input: 'cos(x) = -2', interval: '[0, 2pi]', type: 'exact', solutions: [] },
  { input: 'sin(x) = 0 and cos(x) = 0', interval: '[0, 2pi]', type: 'exact', solutions: [] }
];

function runTests(yourSolveFunction) {
  let passed = 0;
  let failed = 0;
  const failures = [];

  for (const test of tests) {
    const result = yourSolveFunction(test.input, test.interval);

    const normalize = (arr) => [...arr].sort().join(',');

    if (test.type === 'exact') {
      const gotNorm = normalize(result.solutions || []);
      const expNorm = normalize(test.solutions);
      if (gotNorm === expNorm) {
        passed++;
      } else {
        failed++;
        failures.push(
          `❌ "${test.input}": got [${gotNorm}], expected [${expNorm}]${test.note ? ' (' + test.note + ')' : ''}`
        );
      }
    } else {
      const gotNorm = normalize(result.solutions || []);
      const expNorm = normalize(test.solutions);
      if (gotNorm === expNorm) {
        passed++;
      } else {
        failed++;
        failures.push(
          `❌ "${test.input}": got [${gotNorm}], expected [${expNorm}]${test.note ? ' (' + test.note + ')' : ''}`
        );
      }
    }
  }

  console.log(`\n${'='.repeat(50)}`);
  console.log(`EQUATION TESTS: ${passed} passed, ${failed} failed out of ${passed + failed}`);
  console.log(`${'='.repeat(50)}\n`);

  if (failures.length > 0) {
    console.log('FAILURES:');
    failures.forEach((f) => console.log(f));
    process.exitCode = 1;
  } else {
    console.log('✅ ALL TESTS PASSED');
  }
}

runTests(trigEquationSolve);

module.exports = { tests, runTests };
