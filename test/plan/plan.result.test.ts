import {expect, test} from 'vite-plus/test';
import {asyncAttemptRun, isAsyncPlan, isPlan, plan, attemptRun, isOk, Ok} from '../../src';
import {isFixture} from '../.fixtures/is.fixture';
import {getABC, getMessage} from '../.fixtures/plan.fixture';

const {length, values} = isFixture;

test('attempt', () => {
	const planned = plan(getABC);

	expect(isPlan(planned)).toBe(true);

	const attemptedGenerator = attemptRun(getABC);

	expect(isOk(attemptedGenerator)).toBe(true);
	expect((attemptedGenerator as Ok<string>).value).toBe('abc');

	let attemptedPlan = attemptRun(planned);

	expect(isOk(attemptedPlan)).toBe(true);
	expect((attemptedPlan as Ok<string>).value).toBe('abc');

	attemptedPlan = planned.attempt();

	expect(isOk(attemptedPlan)).toBe(true);
	expect((attemptedPlan as Ok<string>).value).toBe('abc');

	for (let index = 0; index < length; index += 1) {
		expect(() => attemptRun(values[index] as never)).toThrow();
	}
});

test('attempt, async', async () => {
	const planned = plan(getMessage);

	expect(isAsyncPlan(planned)).toBe(true);
	expect(isPlan(planned)).toBe(false);

	const attemptedGenerator = await asyncAttemptRun(getMessage);

	expect(isOk(attemptedGenerator)).toBe(true);
	expect((attemptedGenerator as Ok<string>).value).toBe('hello, world!');

	let attemptedPlan = await asyncAttemptRun(planned);

	expect(isOk(attemptedPlan)).toBe(true);
	expect((attemptedPlan as Ok<string>).value).toBe('hello, world!');

	attemptedPlan = await planned.attempt();

	expect(isOk(attemptedPlan)).toBe(true);
	expect((attemptedPlan as Ok<string>).value).toBe('hello, world!');

	for (let index = 0; index < length; index += 1) {
		expect(() => asyncAttemptRun(values[index] as never)).toThrow();
	}
});
