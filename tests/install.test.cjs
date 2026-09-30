const { test } = require('node:test');
const assert = require('node:assert/strict');
const vm = require('node:vm');
const fs = require('node:fs');
const path = require('node:path');
const script = fs.readFileSync(path.join(__dirname, '..', 'install.js'), 'utf8');
const settle = () => new Promise(resolve => setImmediate(resolve));

function setup(installed = false) {
  const events = {}, nodes = new Map();
  const make = () => ({ listeners: {}, hidden: false, disabled: false, open: false, textContent: '',
    addEventListener(type, fn) { this.listeners[type] = fn; },
    showModal() { this.open = true; }, close() { this.open = false; },
    click() { return this.listeners.click?.({ target: this }); }, focus() {}, select() {} });
  const controls = [make(), make()];
  const query = selector => { if (!nodes.has(selector)) nodes.set(selector, make()); return nodes.get(selector); };
  const display = { matches: installed, addEventListener(type, fn) { events.display = fn; } };
  vm.runInNewContext(script, {
    URL,
    location: { href: 'https://crj.example/index.html', hostname: 'crj.example' },
    navigator: { standalone: false, clipboard: { writeText: async () => {} } },
    document: { querySelector: query, querySelectorAll: () => controls },
    window: { matchMedia: () => display, addEventListener: (type, fn) => { events[type] = fn; } }
  });
  return { events, query, controls };
}

test('without a native event the visible action opens honest manual instructions', () => {
  const { controls, query } = setup(); controls[0].click();
  assert.equal(query('#install-dialog').open, true);
  assert.equal(query('#native-install').hidden, true);
  assert.match(query('#install-message').textContent, /Si tu navegador/);
  assert.equal(query('#local-install-note').hidden, true);
});
test('the native prompt is deferred until a user action, consumed once and does not claim installation early', async () => {
  const { controls, query, events } = setup(); let called = 0, prevented = false;
  events.beforeinstallprompt({ preventDefault() { prevented = true; }, prompt: async () => { called++; }, userChoice: Promise.resolve({ outcome: 'accepted' }) });
  assert.equal(prevented, true); assert.equal(called, 0);
  controls[0].click(); await settle(); assert.equal(called, 1);
  assert.equal(controls[0].disabled, false);
  assert.match(query('#install-message').textContent, /completando/);
  controls[1].click(); await settle(); assert.equal(called, 1);
  events.appinstalled(); assert.equal(controls[0].textContent, 'App instalada'); assert.equal(controls[1].disabled, true);
});
test('dismissal keeps the catalog usable without claiming an installed app', async () => {
  const { controls, query, events } = setup();
  events.beforeinstallprompt({ preventDefault() {}, prompt: async () => {}, userChoice: Promise.resolve({ outcome: 'dismissed' }) });
  controls[0].click(); await settle();
  assert.match(query('#install-message').textContent, /cancelada/);
  assert.equal(controls[0].disabled, false); assert.equal(query('#native-install').hidden, true);
});
test('an unavailable native prompt recovers with manual guidance', async () => {
  const { controls, query, events } = setup();
  events.beforeinstallprompt({ preventDefault() {}, prompt: async () => { throw new Error('unavailable'); } });
  controls[0].click(); await settle();
  assert.match(query('#install-message').textContent, /No se pudo/);
  assert.equal(query('#native-install').disabled, false);
});
test('standalone mode is recognized as installed on startup', () => {
  const { controls } = setup(true);
  assert.ok(controls.every(control => control.disabled && control.textContent === 'App instalada'));
});
