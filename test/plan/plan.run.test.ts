import {expect, test} from 'vite-plus/test';
import {asyncRun, isAsyncPlan, isPlan, plan, run} from '../../src';
import {isFixture} from '../.fixtures/is.fixture';
import {getABC, getMessage} from '../.fixtures/plan.fixture';

const {length, values} = isFixture;

test('run', () => {
	const planned = plan(getABC);

	expect(isPlan(planned)).toBe(true);

	const ranGenerator = run(getABC);

	expect(ranGenerator).toBe('abc');

	let ranPlan = run(planned);

	expect(ranPlan).toBe('abc');

	ranPlan = planned.run();

	expect(ranPlan).toBe('abc');

	for (let index = 0; index < length; index += 1) {
		expect(() => run(values[index] as never)).toThrow();
	}
});

test('run, async', async () => {
	const planned = plan(getMessage);

	expect(isAsyncPlan(planned)).toBe(true);
	expect(isPlan(planned)).toBe(false);

	const ranGenerator = await run.async(getMessage);

	expect(ranGenerator).toBe('hello, world!');

	let ranPlan = await asyncRun(planned);

	expect(ranPlan).toBe('hello, world!');

	ranPlan = await planned.run();

	expect(ranPlan).toBe('hello, world!');

	for (let index = 0; index < length; index += 1) {
		expect(() => asyncRun(values[index] as never)).toThrow();
	}
});
