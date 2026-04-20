var { create, all } = require('mathjs');
var { solveTrigInequality, setMath } = require('./trig-inequality.js');

setMath(create(all, {}));

var tests = require('./stress-trig-inequality-tests.js');
var runTests = tests.runTests;

if (require.main === module) {
  runTests(solveTrigInequality);
}
