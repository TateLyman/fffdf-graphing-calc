'use strict';

const { polarRateOfChange, setMath } = require('./polar-rate-of-change.js');
const { create, all } = require('mathjs');
setMath(create(all, {}));

// STRESS TEST - Polar Rate of Change / Table Questions

const tests = [
  {
    type: 'increasing_decreasing',
    input: {
      interval: '[0, pi/4]',
      values: [
        { theta: 0, r: 0 },
        { theta: 'pi/8', r: -1.41 },
        { theta: 'pi/4', r: -2 }
      ]
    },
    note: 'WORKSHEET PROBLEM 46a',
    answer: 'decreasing',
    reason: 'f goes from 0 to -2 on this interval'
  },
  {
    type: 'distance_from_pole',
    input: {
      interval: '[pi/4, pi/2]',
      values: [
        { theta: 'pi/4', r: -2 },
        { theta: '3pi/8', r: -1.41 },
        { theta: 'pi/2', r: 0 }
      ]
    },
    note: 'WORKSHEET PROBLEM 46b',
    answer: 'decreasing',
    reason: '|r| goes from 2 to 0, distance from pole decreasing'
  },
  {
    type: 'aroc',
    input: { theta1: 'pi/8', r1: -1.41, theta2: '3pi/8', r2: -1.41 },
    note: 'WORKSHEET PROBLEM 46c',
    aroc: '0',
    arocDecimal: 0,
    steps: [
      'AROC = (r₂ - r₁) / (θ₂ - θ₁)',
      '= (-1.41 - (-1.41)) / (3π/8 - π/8)',
      '= 0 / (π/4)',
      '= 0'
    ]
  },
  {
    type: 'estimate',
    input: { theta1: 'pi/8', r1: -1.41, aroc: 0, estimateAt: 'pi/4' },
    note: 'WORKSHEET PROBLEM 46d',
    estimate: '-1.41',
    estimateDecimal: -1.41,
    steps: [
      'f(π/4) ≈ f(π/8) + AROC · (π/4 - π/8)',
      '= -1.41 + 0 · (π/8)',
      '= -1.41'
    ]
  },
  {
    type: 'aroc',
    input: { theta1: 0, r1: 0, theta2: 'pi/2', r2: 4 },
    aroc: '8/π',
    arocDecimal: 2.5465,
    steps: [
      'AROC = (4 - 0) / (π/2 - 0)',
      '= 4 / (π/2)',
      '= 8/π',
      '≈ 2.546'
    ]
  },
  {
    type: 'aroc',
    input: { theta1: 'pi/4', r1: 2, theta2: 'pi/2', r2: 5 },
    aroc: '12/π',
    arocDecimal: 3.8197,
    steps: [
      'AROC = (5 - 2) / (π/2 - π/4)',
      '= 3 / (π/4)',
      '= 12/π',
      '≈ 3.820'
    ]
  },
  {
    type: 'aroc',
    input: { theta1: 0, r1: 3, theta2: 'pi', r2: -1 },
    aroc: '-4/π',
    arocDecimal: -1.2732,
    steps: [
      'AROC = (-1 - 3) / (π - 0)',
      '= -4/π',
      '≈ -1.273'
    ]
  },
  {
    type: 'aroc',
    input: { theta1: 'pi/6', r1: 1, theta2: 'pi/3', r2: 1 },
    aroc: '0',
    arocDecimal: 0,
    note: 'constant function — AROC = 0'
  },
  {
    type: 'increasing_decreasing',
    input: {
      interval: '[0, pi/2]',
      values: [
        { theta: 0, r: 1 },
        { theta: 'pi/4', r: 3 },
        { theta: 'pi/2', r: 6 }
      ]
    },
    answer: 'increasing',
    reason: 'r goes from 1 to 6'
  },
  {
    type: 'increasing_decreasing',
    input: {
      interval: '[0, pi]',
      values: [
        { theta: 0, r: 5 },
        { theta: 'pi/2', r: 2 },
        { theta: 'pi', r: -1 }
      ]
    },
    answer: 'decreasing',
    reason: 'r goes from 5 to -1'
  },
  {
    type: 'increasing_decreasing',
    input: {
      interval: '[0, pi/4]',
      values: [
        { theta: 0, r: 2 },
        { theta: 'pi/8', r: 2 },
        { theta: 'pi/4', r: 2 }
      ]
    },
    answer: 'constant',
    reason: 'r stays at 2'
  },
  {
    type: 'distance_from_pole',
    input: {
      interval: '[0, pi/2]',
      values: [
        { theta: 0, r: -5 },
        { theta: 'pi/4', r: -3 },
        { theta: 'pi/2', r: -1 }
      ]
    },
    answer: 'decreasing',
    reason: '|r| goes from 5 to 1 — getting closer to pole'
  },
  {
    type: 'distance_from_pole',
    input: {
      interval: '[0, pi/2]',
      values: [
        { theta: 0, r: -1 },
        { theta: 'pi/4', r: -3 },
        { theta: 'pi/2', r: -5 }
      ]
    },
    answer: 'increasing',
    reason: '|r| goes from 1 to 5 — getting farther from pole'
  },
  {
    type: 'distance_from_pole',
    input: {
      interval: '[0, pi/2]',
      values: [
        { theta: 0, r: 3 },
        { theta: 'pi/4', r: -3 },
        { theta: 'pi/2', r: 3 }
      ]
    },
    answer: 'constant',
    reason: '|r| stays at 3',
    note: 'r changes sign but distance stays same'
  },
  {
    type: 'estimate',
    input: { theta1: 0, r1: 2, aroc: 3, estimateAt: 'pi/4' },
    estimateDecimal: 4.356,
    steps: [
      'f(π/4) ≈ f(0) + AROC·(π/4 - 0)',
      '= 2 + 3·(π/4)',
      '≈ 2 + 2.356',
      '≈ 4.356'
    ]
  },
  {
    type: 'estimate',
    input: { theta1: 'pi/2', r1: 0, aroc: -2, estimateAt: '3pi/4' },
    estimateDecimal: -1.5708,
    steps: [
      'f(3π/4) ≈ f(π/2) + AROC·(3π/4 - π/2)',
      '= 0 + (-2)·(π/4)',
      '≈ -1.571'
    ]
  },
  {
    type: 'aroc',
    input: { theta1: 'pi/4', r1: 3, theta2: 'pi/4', r2: 5 },
    note: 'same theta — undefined AROC (division by zero)',
    aroc: 'undefined',
    arocDecimal: null
  },
  {
    type: 'aroc',
    input: { theta1: 0, r1: -3, theta2: 'pi/2', r2: -3 },
    note: 'same r value — AROC = 0',
    aroc: '0',
    arocDecimal: 0
  }
];

function runTests(yourRateOfChangeFunction) {
  let passed = 0;
  let failed = 0;
  const failures = [];

  const TOLERANCE = 0.01;

  for (const test of tests) {
    const result = yourRateOfChangeFunction(test.type, test.input);
    let allOk = true;

    if (test.type === 'aroc') {
      if (test.arocDecimal === null) {
        if (result.aroc !== 'undefined') {
          allOk = false;
          failures.push(`❌ "${JSON.stringify(test.input)}" expected undefined AROC`);
        }
      } else {
        if (Math.abs(parseFloat(result.arocDecimal) - test.arocDecimal) > TOLERANCE) {
          allOk = false;
          failures.push(
            `❌ AROC "${JSON.stringify(test.input)}": got ${result.arocDecimal}, expected ${test.arocDecimal}${test.note ? ' (' + test.note + ')' : ''}`
          );
        }
      }
    }

    if (test.type === 'estimate') {
      if (Math.abs(parseFloat(result.estimateDecimal) - test.estimateDecimal) > TOLERANCE) {
        allOk = false;
        failures.push(
          `❌ Estimate "${JSON.stringify(test.input)}": got ${result.estimateDecimal}, expected ${test.estimateDecimal}${test.note ? ' (' + test.note + ')' : ''}`
        );
      }
    }

    if (test.type === 'increasing_decreasing' || test.type === 'distance_from_pole') {
      if (result.answer !== test.answer) {
        allOk = false;
        failures.push(
          `❌ [${test.type}] got "${result.answer}", expected "${test.answer}"${test.note ? ' (' + test.note + ')' : ''}`
        );
      }
    }

    if (allOk) passed++;
    else failed++;
  }

  console.log(`\n${'='.repeat(50)}`);
  console.log(`RATE OF CHANGE TESTS: ${passed} passed, ${failed} failed out of ${passed + failed}`);
  console.log(`${'='.repeat(50)}\n`);

  if (failures.length > 0) {
    console.log('FAILURES:');
    failures.forEach((f) => console.log(f));
  } else {
    console.log('✅ ALL TESTS PASSED');
  }
}

if (require.main === module) {
  runTests(polarRateOfChange);
}

module.exports = { tests, runTests };
