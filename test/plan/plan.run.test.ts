import {expect, test} from 'vite-plus/test';
import {isAsyncPlan, isPlan, plan, run} from '../../src';
import {isFixture} from '../.fixtures/is.fixture';
import {getABC, getMessage} from '../.fixtures/plan.fixture';

const {length, values} = isFixture;

test('run', () => {
	const planned = plan(getABC);

	expect(isPlan(planned)).toBe(true);

	const ranGenerator = run(getABC);
	const ranPlan = run(planned);

	expect(ranGenerator).toBe('abc');
	expect(ranPlan).toBe('abc');

	for (let index = 0; index < length; index += 1) {
		expect(() => run(values[index] as never)).toThrow();
	}
});

test('run, async', async () => {
	const planned = plan(getMessage);

	expect(isAsyncPlan(planned)).toBe(true);
	expect(isPlan(planned)).toBe(false);

	const ranGenerator = await run(getMessage);
	const ranPlan = await planned.run();

	expect(ranGenerator).toBe('hello, world!');
	expect(ranPlan).toBe('hello, world!');

	for (let index = 0; index < length; index += 1) {
		expect(() => run(values[index] as never)).toThrow();
	}
});
