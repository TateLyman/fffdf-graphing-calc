'use strict';

const { create, all } = require('mathjs');
const math = create(all, {});
const { setMath, terminalRayPointSlope } = require('./terminal-ray.js');
setMath(math);

const tests = [
  { input: '0', point: '(1, 0)', slope: '0' },
  { input: 'pi/6', point: '(√3/2, 1/2)', slope: '√3/3' },
  { input: 'pi/4', point: '(√2/2, √2/2)', slope: '1' },
  { input: 'pi/3', point: '(1/2, √3/2)', slope: '√3' },
  { input: 'pi/2', point: '(0, 1)', slope: 'undefined' },
  { input: '2pi/3', point: '(-1/2, √3/2)', slope: '-√3' },
  { input: '3pi/4', point: '(-√2/2, √2/2)', slope: '-1' },
  { input: '5pi/6', point: '(-√3/2, 1/2)', slope: '-√3/3' },
  { input: 'pi', point: '(-1, 0)', slope: '0' },
  { input: '7pi/6', point: '(-√3/2, -1/2)', slope: '√3/3' },
  { input: '5pi/4', point: '(-√2/2, -√2/2)', slope: '1' },
  { input: '4pi/3', point: '(-1/2, -√3/2)', slope: '√3' },
  { input: '3pi/2', point: '(0, -1)', slope: 'undefined' },
  { input: '5pi/3', point: '(1/2, -√3/2)', slope: '-√3' },
  { input: '7pi/4', point: '(√2/2, -√2/2)', slope: '-1' },
  { input: '11pi/6', point: '(√3/2, -1/2)', slope: '-√3/3' },
  { input: '2pi', point: '(1, 0)', slope: '0' },
  { input: '-pi/6', point: '(√3/2, -1/2)', slope: '-√3/3' },
  { input: '-pi/4', point: '(√2/2, -√2/2)', slope: '-1' },
  { input: '-pi/3', point: '(1/2, -√3/2)', slope: '-√3' },
  { input: '-pi/2', point: '(0, -1)', slope: 'undefined' },
  { input: '-3pi/4', point: '(-√2/2, -√2/2)', slope: '1' },
  { input: '-pi', point: '(-1, 0)', slope: '0' },
  { input: '-3pi/2', point: '(0, 1)', slope: 'undefined' },
  { input: '9pi/4', point: '(√2/2, √2/2)', slope: '1' },
  { input: '5pi/2', point: '(0, 1)', slope: 'undefined' },
  { input: '7pi/3', point: '(1/2, √3/2)', slope: '√3' },
  { input: 'theta + pi/4', point: '(-√2/2, -√2/2)', slope: '1' },
  { input: 'θ + pi/4', point: '(-√2/2, -√2/2)', slope: '1' },
  { input: '3pi', point: '(-1, 0)', slope: '0' },
  { input: 'pi/2', point: '(0, 1)', slope: 'undefined' },
  { input: '3pi/2', point: '(0, -1)', slope: 'undefined' },
  { input: '-pi/2', point: '(0, -1)', slope: 'undefined' }
];

function runTests(fn) {
  let passed = 0;
  let failed = 0;
  const failures = [];

  for (const test of tests) {
    const result = fn(test.input);
    const slopeOk = result.slope === test.slope;
    const pointOk = result.point === test.point;
    if (slopeOk && pointOk) {
      passed++;
    } else {
      failed++;
      let msg = '❌ θ=' + test.input + ':';
      if (!slopeOk) msg += ' slope got "' + result.slope + '", expected "' + test.slope + '"';
      if (!pointOk) msg += ' point got "' + result.point + '", expected "' + test.point + '"';
      failures.push(msg);
    }
  }

  console.log('\n' + '='.repeat(50));
  console.log('TERMINAL RAY TESTS: ' + passed + ' passed, ' + failed + ' failed out of ' + (passed + failed));
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
  runTests(terminalRayPointSlope);
}

module.exports = { tests, runTests };
