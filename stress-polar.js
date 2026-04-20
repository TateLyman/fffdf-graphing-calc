'use strict';

const { polarConvert } = require('./polar-conversions.js');

// STRESS TEST - Polar Coordinates & Conversions
// (formulas in polar-conversions.js header)

const tests = [
  {
    type: 'polar_to_rect',
    input: '(4, 5pi/6)',
    note: 'WORKSHEET PROBLEM 30',
    x: '-2√3',
    y: '2',
    rectangular: '(-2√3, 2)',
    xDecimal: '-3.4641',
    yDecimal: '2'
  },
  {
    type: 'polar_to_rect',
    input: '(1, pi/4)',
    x: '√2/2',
    y: '√2/2',
    rectangular: '(√2/2, √2/2)'
  },
  {
    type: 'polar_to_rect',
    input: '(2, pi/3)',
    x: '1',
    y: '√3',
    rectangular: '(1, √3)'
  },
  {
    type: 'polar_to_rect',
    input: '(3, pi)',
    x: '-3',
    y: '0',
    rectangular: '(-3, 0)'
  },
  {
    type: 'polar_to_rect',
    input: '(2, 3pi/2)',
    x: '0',
    y: '-2',
    rectangular: '(0, -2)'
  },
  {
    type: 'polar_to_rect',
    input: '(6, 7pi/6)',
    x: '-3√3',
    y: '-3',
    rectangular: '(-3√3, -3)'
  },
  {
    type: 'polar_to_rect',
    input: '(-3, 2pi/3)',
    note: 'WORKSHEET PROBLEM 29 — negative r',
    x: '3/2',
    y: '-3√3/2',
    rectangular: '(3/2, -3√3/2)'
  },
  {
    type: 'rect_to_polar',
    input: '(2, -4)',
    note: 'WORKSHEET PROBLEM 31',
    r: '2√5',
    rDecimal: '4.4721',
    theta: 'arctan(-2) + 2π',
    thetaDecimal: '5.1760',
    quadrant: 'Q4',
    polar: '(2√5, 5.176)'
  },
  {
    type: 'rect_to_polar',
    input: '(1, 1)',
    r: '√2',
    theta: 'π/4',
    thetaExact: 'π/4',
    quadrant: 'Q1',
    polar: '(√2, π/4)'
  },
  {
    type: 'rect_to_polar',
    input: '(-1, √3)',
    r: '2',
    theta: '2π/3',
    thetaExact: '2π/3',
    quadrant: 'Q2',
    polar: '(2, 2π/3)'
  },
  {
    type: 'rect_to_polar',
    input: '(-√3, -1)',
    r: '2',
    theta: '7π/6',
    thetaExact: '7π/6',
    quadrant: 'Q3',
    polar: '(2, 7π/6)'
  },
  {
    type: 'rect_to_polar',
    input: '(0, 3)',
    r: '3',
    theta: 'π/2',
    thetaExact: 'π/2',
    quadrant: 'positive y-axis',
    polar: '(3, π/2)'
  },
  {
    type: 'rect_to_polar',
    input: '(0, -5)',
    r: '5',
    theta: '3π/2',
    thetaExact: '3π/2',
    quadrant: 'negative y-axis',
    polar: '(5, 3π/2)'
  },
  {
    type: 'rect_to_polar',
    input: '(-4, 0)',
    r: '4',
    theta: 'π',
    thetaExact: 'π',
    quadrant: 'negative x-axis',
    polar: '(4, π)'
  },
  {
    type: 'complex_rect_to_polar',
    input: '-3 - 5i',
    note: 'WORKSHEET PROBLEM 32',
    modulus: '√34',
    modulusDecimal: '5.831',
    argument: 'arctan(5/3) + π',
    argumentDecimal: '4.171',
    polar: '√34[cos(4.171) + i·sin(4.171)]'
  },
  {
    type: 'complex_rect_to_polar',
    input: '1 + i',
    modulus: '√2',
    modulusDecimal: '1.4142',
    argument: 'π/4',
    argumentDecimal: '0.7854',
    polar: '√2[cos(π/4) + i·sin(π/4)]'
  },
  {
    type: 'complex_rect_to_polar',
    input: '-1 + √3·i',
    modulus: '2',
    argument: '2π/3',
    argumentDecimal: '2.0944',
    polar: '2[cos(2π/3) + i·sin(2π/3)]'
  },
  {
    type: 'complex_rect_to_polar',
    input: '3 - 3i',
    modulus: '3√2',
    argument: '7π/4',
    argumentDecimal: '5.4978',
    polar: '3√2[cos(7π/4) + i·sin(7π/4)]'
  },
  {
    type: 'complex_rect_to_polar',
    input: '-2 - 2i',
    modulus: '2√2',
    argument: '5π/4',
    argumentDecimal: '3.9270',
    polar: '2√2[cos(5π/4) + i·sin(5π/4)]'
  },
  {
    type: 'complex_polar_to_rect',
    input: '6[cos(3pi/4) + i·sin(3pi/4)]',
    note: 'WORKSHEET PROBLEM 33',
    real: '-3√2',
    imaginary: '3√2',
    rectangular: '-3√2 + 3√2·i'
  },
  {
    type: 'complex_polar_to_rect',
    input: '2[cos(pi/3) + i·sin(pi/3)]',
    real: '1',
    imaginary: '√3',
    rectangular: '1 + √3·i'
  },
  {
    type: 'complex_polar_to_rect',
    input: '4[cos(pi) + i·sin(pi)]',
    real: '-4',
    imaginary: '0',
    rectangular: '-4'
  },
  {
    type: 'complex_polar_to_rect',
    input: '3[cos(3pi/2) + i·sin(3pi/2)]',
    real: '0',
    imaginary: '-3',
    rectangular: '-3i'
  },
  {
    type: 'complex_polar_to_rect',
    input: '√2[cos(pi/4) + i·sin(pi/4)]',
    real: '1',
    imaginary: '1',
    rectangular: '1 + i'
  },
  {
    type: 'rect_to_polar',
    input: '(0, 0)',
    note: 'origin — r = 0, θ undefined',
    r: '0',
    theta: 'undefined',
    polar: '(0, undefined)'
  },
  {
    type: 'polar_to_rect',
    input: '(0, pi/4)',
    note: 'r = 0 — always origin',
    x: '0',
    y: '0',
    rectangular: '(0, 0)'
  },
  {
    type: 'rect_to_polar',
    input: '(3, 0)',
    r: '3',
    theta: '0',
    thetaExact: '0',
    quadrant: 'positive x-axis',
    polar: '(3, 0)'
  }
];

function runTests(yourPolarFunction) {
  let passed = 0;
  let failed = 0;
  const failures = [];

  const normalize = (s) => String(s).replace(/\s+/g, '').toLowerCase();

  for (const test of tests) {
    const result = yourPolarFunction(test.type, test.input);
    let allOk = true;

    const checks = {
      polar_to_rect: ['x', 'y', 'rectangular'],
      rect_to_polar: ['r', 'theta'],
      complex_rect_to_polar: ['modulus', 'argument'],
      complex_polar_to_rect: ['real', 'imaginary', 'rectangular']
    };

    for (const prop of checks[test.type] || []) {
      if (test[prop] !== undefined && normalize(result[prop]) !== normalize(test[prop])) {
        allOk = false;
        failures.push(
          `❌ [${test.type}] "${test.input}" ${prop}: got "${result[prop]}", expected "${test[prop]}"${
            test.note ? ' (' + test.note + ')' : ''
          }`
        );
      }
    }

    if (allOk) passed++;
    else failed++;
  }

  console.log(`\n${'='.repeat(50)}`);
  console.log(`POLAR TESTS: ${passed} passed, ${failed} failed out of ${passed + failed}`);
  console.log(`${'='.repeat(50)}\n`);

  if (failures.length > 0) {
    console.log('FAILURES:');
    failures.forEach((f) => console.log(f));
  } else {
    console.log('✅ ALL TESTS PASSED');
  }
}

if (require.main === module) {
  runTests(polarConvert);
}

module.exports = { tests, runTests };
