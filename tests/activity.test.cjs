const { test } = require('node:test');
const assert = require('node:assert/strict');
const { readFileSync } = require('node:fs');
const vm = require('node:vm');
const source = readFileSync(require('node:path').join(__dirname, '../activity.js'), 'utf8');

// A minimal DOM boundary keeps failure/data-integrity tests independent of a browser.
class Element {
  constructor(tag = 'div') { this.tag = tag; this.children = []; this.textContent = ''; }
  append(...children) { this.children.push(...children); }
  replaceChildren(...children) { this.children = children; }
}

async function render(profile, events) {
  const elements = Object.fromEntries(['#github-activity', '#activity-status', '#activity-list', '#repos', '#followers'].map(id => [id, new Element()]));
  elements['#repos'].textContent = elements['#followers'].textContent = '—';
  const context = {
    document: { querySelector: selector => elements[selector] ?? null, createElement: tag => new Element(tag) },
    window: {},
    AbortSignal,
    Intl,
    fetch: async url => {
      const value = url.includes('/events/') ? events : profile;
      if (value instanceof Error) throw value;
      return { ok: true, json: async () => value };
    },
  };
  vm.runInNewContext(source, context);
  await new Promise(resolve => setImmediate(resolve));
  return elements;
}

test('network failure keeps honest unavailable counts and a useful profile fallback', async () => {
  const result = await render(new Error('offline'), new Error('offline'));
  assert.equal(result['#repos'].textContent, '—');
  assert.equal(result['#activity-status'].textContent, 'Unavailable');
  assert.match(result['#activity-list'].children[0].textContent, /full contribution history/);
});

test('empty public event history is explained without inventing activity', async () => {
  const result = await render({ public_repos: 0, followers: 0 }, []);
  assert.equal(result['#repos'].textContent, 0);
  assert.match(result['#activity-list'].children[0].textContent, /No recent public events/);
});

test('malformed external repositories and dates cannot become links', async () => {
  const result = await render(null, [
    null,
    { type: 'PushEvent', repo: { name: 'javascript:alert(1)' }, created_at: '2026-10-01' },
    { type: 'PushEvent', repo: { name: 'owner/repo' }, created_at: 'invalid' },
  ]);
  assert.equal(result['#activity-list'].children.length, 1);
  assert.match(result['#activity-list'].children[0].textContent, /No recent public events/);
});

test('real public events produce safe repository links and UTC dates', async () => {
  const result = await render({ public_repos: 9, followers: 5 }, [{ type: 'WatchEvent', repo: { name: 'owner/repository' }, created_at: '2026-10-04T07:53:28Z' }]);
  const [label, link, time] = result['#activity-list'].children[0].children;
  assert.equal(label.textContent, 'Starred');
  assert.equal(link.href, 'https://github.com/owner/repository');
  assert.equal(link.rel, 'noopener noreferrer');
  assert.match(time.textContent, /2026/);
});
