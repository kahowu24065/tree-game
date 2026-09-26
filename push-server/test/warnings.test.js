import { test } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import { diffLevels, levelsFromWarnsum, messageFor } from '../src/warnings.js';

const fx = (n) => JSON.parse(fs.readFileSync(new URL(`./fixtures/${n}.json`, import.meta.url), 'utf8'));
const NONE = levelsFromWarnsum(fx('none'));
const AMBER = levelsFromWarnsum(fx('amber-t3'));
const BLACK = levelsFromWarnsum(fx('black-t8'));

test('levels: irrelevant warnings and CANCEL are ignored', () => {
  assert.deepEqual(NONE, { heat: 0, rain: 0, typhoon: 0, cold: 0 });
  assert.deepEqual(AMBER, { heat: 0, rain: 1, typhoon: 2, cold: 0 });
  assert.deepEqual(BLACK, { heat: 0, rain: 3, typhoon: 3, cold: 1 });
});

test('first run records state without notifying', () => {
  assert.deepEqual(diffLevels(null, BLACK), []);
});

test('issue and upgrade notify; same level does not', () => {
  assert.deepEqual(diffLevels(NONE, AMBER), [{ category: 'rain', level: 1 }, { category: 'typhoon', level: 2 }]);
  assert.deepEqual(diffLevels(AMBER, BLACK), [{ category: 'rain', level: 3 }, { category: 'typhoon', level: 3 }, { category: 'cold', level: 1 }]);
  assert.deepEqual(diffLevels(BLACK, BLACK), []);
});

test('downgrade / cancel is silent, re-issue after cancel notifies again', () => {
  assert.deepEqual(diffLevels(BLACK, AMBER), []);
  assert.deepEqual(diffLevels(BLACK, NONE), []);
  assert.deepEqual(diffLevels(NONE, BLACK).map((d) => d.category), ['rain', 'typhoon', 'cold']);
});

test('messages use game wording', () => {
  assert.equal(messageFor({ category: 'heat', level: 1 }).title, '酷熱天氣警告生效！');
  assert.match(messageFor({ category: 'heat', level: 1 }).body, /額外澆水/);
  assert.match(messageFor({ category: 'rain', level: 3 }).title, /黑色暴雨/);
  assert.match(messageFor({ category: 'rain', level: 3 }).body, /疏水/);
  assert.match(messageFor({ category: 'typhoon', level: 3 }).body, /加固/);
  assert.match(messageFor({ category: 'cold', level: 1 }).body, /保暖/);
});
