// STRESS TEST - Trig Inequalities (see user spec)

const tests = [
  {
    input: '4sin(x) + 1 <= -1',
    note: 'WORKSHEET PROBLEM 47',
    interval: '[0, 2pi]',
    isolated: 'sin(x) <= -1/2',
    boundaryAngles: ['7π/6', '11π/6'],
    solution: '7π/6 ≤ x ≤ 11π/6',
    answer: 'A',
    steps: []
  },
  {
    input: 'sin(x) >= 1/2',
    interval: '[0, 2pi]',
    isolated: 'sin(x) >= 1/2',
    boundaryAngles: ['π/6', '5π/6'],
    solution: 'π/6 ≤ x ≤ 5π/6',
    steps: []
  },
  {
    input: 'sin(x) <= 1/2',
    interval: '[0, 2pi]',
    isolated: 'sin(x) <= 1/2',
    boundaryAngles: ['π/6', '5π/6'],
    solution: '0 ≤ x ≤ π/6 or 5π/6 ≤ x ≤ 2π',
    steps: []
  },
  {
    input: 'sin(x) >= sqrt(2)/2',
    interval: '[0, 2pi]',
    isolated: 'sin(x) >= √2/2',
    boundaryAngles: ['π/4', '3π/4'],
    solution: 'π/4 ≤ x ≤ 3π/4'
  },
  {
    input: 'sin(x) <= -sqrt(3)/2',
    interval: '[0, 2pi]',
    isolated: 'sin(x) <= -√3/2',
    boundaryAngles: ['4π/3', '5π/3'],
    solution: '4π/3 ≤ x ≤ 5π/3'
  },
  {
    input: '2sin(x) + 1 >= 0',
    interval: '[0, 2pi]',
    isolated: 'sin(x) >= -1/2',
    boundaryAngles: ['7π/6', '11π/6'],
    solution: '0 ≤ x ≤ 7π/6 or 11π/6 ≤ x ≤ 2π'
  },
  {
    input: 'sin(x) >= 1',
    interval: '[0, 2pi]',
    isolated: 'sin(x) >= 1',
    boundaryAngles: ['π/2'],
    solution: 'x = π/2',
    note: 'sin only equals 1 at one point'
  },
  {
    input: 'sin(x) >= 2',
    interval: '[0, 2pi]',
    isolated: 'sin(x) >= 2',
    boundaryAngles: [],
    solution: 'no solution',
    note: 'sin never exceeds 1'
  },
  {
    input: 'sin(x) <= -1',
    interval: '[0, 2pi]',
    isolated: 'sin(x) <= -1',
    boundaryAngles: ['3π/2'],
    solution: 'x = 3π/2',
    note: 'sin only equals -1 at one point'
  },
  {
    input: 'cos(x) >= 1/2',
    interval: '[0, 2pi]',
    isolated: 'cos(x) >= 1/2',
    boundaryAngles: ['π/3', '5π/3'],
    solution: '0 ≤ x ≤ π/3 or 5π/3 ≤ x ≤ 2π'
  },
  {
    input: 'cos(x) <= -1/2',
    interval: '[0, 2pi]',
    isolated: 'cos(x) <= -1/2',
    boundaryAngles: ['2π/3', '4π/3'],
    solution: '2π/3 ≤ x ≤ 4π/3'
  },
  {
    input: 'cos(x) >= sqrt(3)/2',
    interval: '[0, 2pi]',
    isolated: 'cos(x) >= √3/2',
    boundaryAngles: ['π/6', '11π/6'],
    solution: '0 ≤ x ≤ π/6 or 11π/6 ≤ x ≤ 2π'
  },
  {
    input: '2cos(x) - 1 <= 0',
    interval: '[0, 2pi]',
    isolated: 'cos(x) <= 1/2',
    boundaryAngles: ['π/3', '5π/3'],
    solution: 'π/3 ≤ x ≤ 5π/3'
  },
  {
    input: 'cos(x) >= 0',
    interval: '[0, 2pi]',
    isolated: 'cos(x) >= 0',
    boundaryAngles: ['π/2', '3π/2'],
    solution: '0 ≤ x ≤ π/2 or 3π/2 ≤ x ≤ 2π'
  },
  {
    input: 'cos(x) <= 0',
    interval: '[0, 2pi]',
    isolated: 'cos(x) <= 0',
    boundaryAngles: ['π/2', '3π/2'],
    solution: 'π/2 ≤ x ≤ 3π/2'
  },
  {
    input: 'tan(x) >= 1',
    interval: '[0, 2pi]',
    isolated: 'tan(x) >= 1',
    boundaryAngles: ['π/4', '5π/4'],
    solution: 'π/4 ≤ x < π/2 or 5π/4 ≤ x < 3π/2',
    note: 'open at asymptotes'
  },
  {
    input: 'tan(x) <= 0',
    interval: '[0, 2pi]',
    isolated: 'tan(x) <= 0',
    boundaryAngles: ['0', 'π', '2π'],
    solution: 'π/2 < x ≤ π or 3π/2 < x ≤ 2π',
    note: 'open at asymptotes'
  },
  {
    input: '4sin(x) + 1 <= -1',
    interval: '[0, 2pi]',
    note: 'WORKSHEET PROBLEM 47 — multiple choice check',
    multipleChoice: {
      A: '7π/6 ≤ x ≤ 11π/6',
      B: '4π/3 ≤ x ≤ 5π/3',
      C: '0 ≤ x ≤ 7π/6 and 11π/6 ≤ x ≤ 2π',
      D: '0 ≤ x ≤ 4π/3 and 5π/3 ≤ x ≤ 2π'
    },
    correctAnswer: 'A',
    solution: '7π/6 ≤ x ≤ 11π/6'
  },
  {
    input: 'sin(x) >= -1',
    interval: '[0, 2pi]',
    isolated: 'sin(x) >= -1',
    solution: '0 ≤ x ≤ 2π',
    note: 'always true — sin is always >= -1'
  },
  {
    input: 'cos(x) <= 1',
    interval: '[0, 2pi]',
    isolated: 'cos(x) <= 1',
    solution: '0 ≤ x ≤ 2π',
    note: 'always true — cos is always <= 1'
  },
  {
    input: 'sin(x) >= 0 and sin(x) <= 1',
    interval: '[0, 2pi]',
    solution: '0 ≤ x ≤ π',
    note: 'compound inequality'
  }
];

function normalize(s) {
  return s.replace(/\s+/g, '').toLowerCase();
}

function runTests(yourInequalityFunction) {
  let passed = 0;
  let failed = 0;
  const failures = [];

  for (const test of tests) {
    const result = yourInequalityFunction(test.input, test.interval, test.multipleChoice);
    let allOk = true;

    if (normalize(result.solution) !== normalize(test.solution)) {
      allOk = false;
      failures.push(
        `❌ "${test.input}": got "${result.solution}", expected "${test.solution}"${test.note ? ' (' + test.note + ')' : ''}`
      );
    }

    if (test.correctAnswer && result.correctAnswer !== test.correctAnswer) {
      allOk = false;
      failures.push(
        `❌ "${test.input}" MC answer: got "${result.correctAnswer}", expected "${test.correctAnswer}"`
      );
    }

    if (allOk) passed++;
    else failed++;
  }

  console.log(`\n${'='.repeat(50)}`);
  console.log(`INEQUALITY TESTS: ${passed} passed, ${failed} failed out of ${passed + failed}`);
  console.log(`${'='.repeat(50)}\n`);

  if (failures.length > 0) {
    console.log('FAILURES:');
    failures.forEach(function (f) {
      console.log(f);
    });
  } else {
    console.log('✅ ALL TESTS PASSED');
  }
}

module.exports = { tests, runTests };
