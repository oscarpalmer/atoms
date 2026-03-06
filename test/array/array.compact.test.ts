import {expect, test} from 'vitest';
import {compact} from '../../src';
import {arrayFixture} from '../.fixtures/array.fixture';

test('', () => {
	expect(compact(arrayFixture.simple)).toEqual(arrayFixture.simple);

	expect(compact([0, 1, null, 2, undefined, 3, false, 4, '', 5])).toEqual([
		0,
		1,
		2,
		3,
		false,
		4,
		'',
		5,
	]);

	expect(compact([0, 1, null, 2, undefined, 3, false, 4, '', 5], true)).toEqual(
		arrayFixture.simple,
	);

	expect(compact('blah' as never)).toEqual([]);
});
