'use strict';

/**
 * Generates test/index.html with all stress-suite output embedded as static HTML.
 * Run at deploy time (npm run build) so /test is plain HTML with every result in the source.
 */

const fs = require('fs');
const path = require('path');
const { spawnSync } = require('child_process');

const ROOT = __dirname;
const OUT_DIR = path.join(ROOT, 'test');
const OUT_FILE = path.join(OUT_DIR, 'index.html');

/** Same coverage as package.json test:* scripts (stress-trig-inequality-tests is pulled in by stress-trig-inequality.js). */
const SUITES = [
  ['stress-test.js', 'Exact evaluate (stress-test.js)'],
  ['stress-asymptote.js', 'Asymptote (asymptote.js)'],
  ['stress-terminal-ray.js', 'Terminal ray (terminal-ray.js)'],
  ['stress-graph-trig.js', 'Graph trig (graph-trig.js)'],
  ['stress-inverse-trig.js', 'Inverse trig (inverse-trig.js)'],
  ['stress-trig-func-inv.js', 'Trig function inverse (trig-func-inverse.js)'],
  ['stress-trig-eq.js', 'Trig equations (trig-equation.js)'],
  ['stress-trig-identity.js', 'Trig identity simplify (trig-identity-simplify.js)'],
  ['stress-sum-diff.js', 'Sum/difference formulas (sum-diff-formulas.js)'],
  ['stress-polar.js', 'Polar conversions (polar-conversions.js)'],
  ['stress-polar-roc.js', 'Polar rate of change (polar-rate-of-change.js)'],
  ['stress-trig-inequality.js', 'Trig inequalities (trig-inequality.js)']
];

function escapeHtml(s) {
  return String(s)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function runSuite(file) {
  const full = path.join(ROOT, file);
  if (!fs.existsSync(full)) {
    return {
      file,
      status: null,
      stdout: '',
      stderr: 'Missing file: ' + file,
      spawnError: new Error('missing file')
    };
  }
  const r = spawnSync(process.execPath, [full], {
    encoding: 'utf8',
    maxBuffer: 20 * 1024 * 1024,
    cwd: ROOT,
    env: process.env
  });
  return {
    file,
    status: r.status,
    stdout: r.stdout || '',
    stderr: r.stderr || '',
    spawnError: r.error || null
  };
}

function main() {
  const generatedAt = new Date().toISOString();
  const sections = [];
  let failedSuites = 0;

  for (const [file, title] of SUITES) {
    const result = runSuite(file);
    const ok = result.spawnError
      ? false
      : result.status === 0;
    if (!ok) failedSuites++;

    let body = '';
    if (result.spawnError) {
      body =
        'SPAWN ERROR: ' +
        result.spawnError.message +
        '\n\n' +
        (result.stderr || '');
    } else {
      body = (result.stdout || '') + (result.stderr ? '\n--- stderr ---\n' + result.stderr : '');
    }
    if (!body.trim()) {
      body = '(no output)';
    }

    const statusLine =
      result.spawnError != null
        ? 'SUITE ERROR'
        : result.status === null
          ? 'UNKNOWN'
          : result.status === 0
            ? 'PASS'
            : 'FAIL (exit ' + result.status + ')';

    sections.push({
      title,
      file,
      statusLine,
      ok,
      body
    });
  }

  const overall =
    failedSuites === 0
      ? 'ALL SUITES PASSED (' + SUITES.length + ' suites)'
      : failedSuites + ' SUITE(S) FAILED out of ' + SUITES.length;

  const parts = [
    '<!DOCTYPE html>',
    '<html lang="en">',
    '<head>',
    '<meta charset="utf-8">',
    '<meta name="viewport" content="width=device-width, initial-scale=1">',
    '<title>Solver stress tests — static report</title>',
    '<style>',
    'body{font-family:ui-monospace,Menlo,Consolas,monospace;margin:1rem;line-height:1.45;}',
    'h1{font-size:1.1rem;}',
    'h2{font-size:1rem;margin-top:1.5rem;border-bottom:1px solid #ccc;padding-bottom:0.25rem;}',
    '.meta{color:#333;}',
    '.pass{color:#064;}',
    '.fail{color:#800;font-weight:bold;}',
    'pre{white-space:pre-wrap;word-break:break-word;background:#f6f6f6;padding:0.75rem;border:1px solid #ddd;}',
    '</style>',
    '</head>',
    '<body>',
    '<h1>Solver stress tests (static HTML)</h1>',
    '<p class="meta">Generated at (UTC): ' + escapeHtml(generatedAt) + '</p>',
    '<p class="' + (failedSuites === 0 ? 'pass' : 'fail') + '">' + escapeHtml(overall) + '</p>',
    '<p class="meta">This file is produced by <code>npm run build</code> on deploy. No client-side JavaScript; all output below is in the HTML source.</p>'
  ];

  for (const s of sections) {
    parts.push('<section>');
    parts.push('<h2>' + escapeHtml(s.title) + '</h2>');
    parts.push('<p><strong>File:</strong> ' + escapeHtml(s.file) + ' — <strong>' + escapeHtml(s.statusLine) + '</strong></p>');
    parts.push('<pre>' + escapeHtml(s.body) + '</pre>');
    parts.push('</section>');
  }

  parts.push('</body>', '</html>', '');

  fs.mkdirSync(OUT_DIR, { recursive: true });
  fs.writeFileSync(OUT_FILE, parts.join('\n'), 'utf8');
  console.log('Wrote ' + path.relative(ROOT, OUT_FILE));
  if (failedSuites > 0) {
    console.warn('build-test-page: ' + failedSuites + ' suite(s) reported failures (embedded in HTML; build still succeeds).');
  }
}

main();
