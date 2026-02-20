import {expect, test} from 'vitest';
import {getArrayCallbacks} from '../../src/internal/array/callbacks';

test('', () => {
	const withBoolean = getArrayCallbacks(null, true);
	expect(withBoolean?.keyed).toBeUndefined();

	const withDotNotation = getArrayCallbacks(null, 'prop.nested');
	expect(withDotNotation?.keyed).toBeUndefined();

	const withFunction = getArrayCallbacks(() => true);
	expect(typeof withFunction?.bool).toBe('function');

	const withNumber = getArrayCallbacks(null, 123);
	expect(typeof withNumber?.keyed).toBe('function');

	const withObject = getArrayCallbacks(null, {});
	expect(withObject?.keyed).toBeUndefined();

	const withNull = getArrayCallbacks(null, null);
	expect(withNull?.keyed).toBeUndefined();

	const withString = getArrayCallbacks(null, 'id');
	expect(typeof withString?.keyed).toBe('function');

	const withUndefined = getArrayCallbacks(null, undefined);
	expect(withUndefined?.keyed).toBeUndefined();
});
