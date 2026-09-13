import { test } from 'node:test';
import assert from 'node:assert/strict';
import { quadTransform } from '../src/components/experience/display-projection';

test('the DOM screen follows all four corners of a perspective dashboard', () => {
  const corners = [
    [320, 300],
    [610, 274],
    [615, 440],
    [325, 478],
  ] as const;
  const css = quadTransform(corners, 1000, 480)!;
  const m = css.slice('matrix3d('.length, -1).split(',').map(Number);
  [
    [0, 0],
    [1000, 0],
    [1000, 480],
    [0, 480],
  ].forEach(([x, y], i) => {
    const w = m[3] * x + m[7] * y + m[15];
    assert.ok(Math.abs((m[0] * x + m[4] * y + m[12]) / w - corners[i][0]) < 1e-6);
    assert.ok(Math.abs((m[1] * x + m[5] * y + m[13]) / w - corners[i][1]) < 1e-6);
  });
});

test('a zero-area projection is hidden rather than producing invalid CSS', () => {
  assert.equal(
    quadTransform(
      [
        [1, 1],
        [1, 1],
        [1, 1],
        [1, 1],
      ],
      1000,
      480,
    ),
    null,
  );
  assert.equal(quadTransform([], 1000, 480), null);
});
