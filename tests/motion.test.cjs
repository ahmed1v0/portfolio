const { test } = require('node:test');
const assert = require('node:assert/strict');
const { readFileSync } = require('node:fs');
const vm = require('node:vm');
const source = readFileSync(require('node:path').join(__dirname, '../motion.js'), 'utf8');

test('reduced motion prevents effects and switching the preference cleans up observers', () => {
  const classes = new Set();
  const listeners = {};
  let observers = 0;
  let disconnected = 0;
  const reduced = { matches: true, addEventListener: (_, callback) => { listeners.reduced = callback; } };
  const pointer = { matches: false, addEventListener: (_, callback) => { listeners.pointer = callback; } };
  const element = { classList: { add() {}, remove() {} } };
  const context = {
    matchMedia: query => query.includes('reduced-motion') ? reduced : pointer,
    document: {
      documentElement: { classList: { add: name => classes.add(name), remove: name => classes.delete(name) } },
      querySelectorAll: selector => selector === '[data-depth]' ? [] : [element],
    },
    window: { IntersectionObserver: true },
    IntersectionObserver: class {
      constructor() { observers++; }
      observe() {}
      disconnect() { disconnected++; }
    },
    AbortController,
    addEventListener: (event, callback) => { listeners[event] = callback; },
  };
  vm.runInNewContext(source, context);
  assert.equal(observers, 0);
  assert.equal(classes.size, 0);
  reduced.matches = false;
  listeners.reduced();
  assert.equal(observers, 1);
  assert.equal(classes.has('motion-ready'), true);
  reduced.matches = true;
  listeners.reduced();
  assert.equal(disconnected, 1);
  assert.equal(classes.has('motion-ready'), false);
});
