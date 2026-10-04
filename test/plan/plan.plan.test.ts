import {expect, test} from 'vite-plus/test';
import {isAsyncGenerator, isAsyncPlan, isGenerator, isPlan, plan} from '../../src';
import {isFixture} from '../.fixtures/is.fixture';
import {getABC, getMessage} from '../.fixtures/plan.fixture';

const {length, values} = isFixture;

test('plan', () => {
	const planned = plan(getABC);

	expect(isAsyncGenerator(planned)).toBe(false);
	expect(isAsyncPlan(planned)).toBe(false);
	expect(isGenerator(planned)).toBe(false);
	expect(isPlan(planned)).toBe(true);

	expect(planned.run()).toBe('abc');

	for (let index = 0; index < length; index += 1) {
		expect(() => plan(values[index] as never)).toThrow();
	}
});

test('plan, async', async () => {
	const planned = plan(getMessage);

	expect(isAsyncGenerator(planned)).toBe(false);
	expect(isAsyncPlan(planned)).toBe(true);
	expect(isGenerator(planned)).toBe(false);
	expect(isPlan(planned)).toBe(false);

	const ran = await planned.run();

	await planned.run().then(result => {
		expect(result).toBe('hello, world!');
	});

	for (let index = 0; index < length; index += 1) {
		expect(() => plan(values[index] as never)).toThrow();
	}
});
