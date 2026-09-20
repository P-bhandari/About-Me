import { readFileSync } from 'node:fs';
import vm from 'node:vm';
import assert from 'node:assert/strict';
import test from 'node:test';
import ts from 'typescript';

const source = readFileSync(new URL('../components/portfolio-experience.tsx', import.meta.url), 'utf8');
const visitSource = source.slice(source.indexOf('  async function visit('), source.indexOf('\n  function trackPointer'));
const compiled = ts.transpileModule(visitSource, { compilerOptions: { target: ts.ScriptTarget.ES2022 } }).outputText;
function harness(reducedMotion, start, compact = false) {
  const calls = [];
  const context = {
    moving: false, reducedMotion, compact, soundEnabled: false,
    setMoving: v => calls.push(['moving', v]), setFocus: () => {}, setTrail: () => {}, setArrival: () => {}, setTransitioning: () => {},
    sound: () => {}, currentPlayer: { current: { x: 0, y: 0 } },
    curvedTravel: () => ({ x: [], y: [], path: '' }), motionTiming: { travel: 1.2 }, cinematicEase: [],
    playerControls: { start: options => { calls.push(['animate', options.transition.duration]); return start(); }, stop: () => calls.push(['stop']) },
    document: { querySelector: href => ({ scrollIntoView: options => calls.push(['navigate', href, options.behavior]) }) },
    window: { location: { assign: href => calls.push(['external', href]) }, history: { replaceState: (_state, _title, href) => calls.push(['hash', href]) }, setTimeout: callback => setTimeout(callback, 1), clearTimeout, setInterval, clearInterval },
  };
  vm.createContext(context); vm.runInContext(compiled, context);
  return { visit: context.visit, calls };
}
const apps = { href: '#work', label: 'Apps', x: 51, y: 20 };
test('reduced motion navigates immediately without starting animation', async () => {
  const { visit, calls } = harness(true, () => { throw new Error('Must not animate'); });
  await visit(apps);
  assert.deepEqual(calls, [['navigate', '#work', 'auto'], ['hash', '#work']]);
});
test('failed animation still navigates and unlocks the controls', async () => {
  const { visit, calls } = harness(false, () => Promise.reject(new Error('Animation unavailable')));
  await visit(apps);
  assert.ok(calls.some(c => c[0] === 'navigate' && c[1] === '#work'));
  assert.ok(calls.some(c => c[0] === 'moving' && c[1] === false));
});
test('stalled animation has a bounded fallback', async () => {
  const { visit, calls } = harness(false, () => new Promise(() => {}));
  await visit(apps);
  assert.ok(calls.some(c => c[0] === 'navigate' && c[1] === '#work'));
  assert.ok(calls.some(c => c[0] === 'stop'));
});
test('phone travel takes 600ms while desktop keeps its existing timing', async () => {
  for (const compact of [true, false]) {
    const { visit, calls } = harness(false, () => Promise.resolve(), compact);
    await visit(apps);
    assert.ok(calls.some(c => c[0] === 'animate' && c[1] === (compact ? 0.6 : 1.2)));
    assert.ok(calls.some(c => c[0] === 'navigate' && c[1] === '#work'));
  }
});
test('external profile destinations navigate in both motion modes', async () => {
  for (const reducedMotion of [true, false]) {
    const { visit, calls } = harness(reducedMotion, () => Promise.resolve(), true);
    await visit({ ...apps, external: true, href: 'https://www.linkedin.com/in/piyush-bhandari95/' });
    assert.ok(calls.some(c => c[0] === 'external' && c[1] === 'https://www.linkedin.com/in/piyush-bhandari95/'));
  }
});
