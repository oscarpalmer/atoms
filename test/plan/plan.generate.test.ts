import {expect, test} from 'vite-plus/test';
import {error, run} from '../../src';
import {getThrown} from '../.fixtures/plan.fixture';

test('generate: error values that are nullish still throw', () => {
	function* undefinedError() {
		yield error(undefined);

		return 'unreachable';
	}

	function* recoveredUndefined() {
		try {
			yield error(undefined);
		} catch {
			return 'recovered';
		}

		return 'unreachable';
	}

	expect(getThrown(() => run(undefinedError))).toBeUndefined();
	expect(run(recoveredUndefined)).toBe('recovered');
});

test('generate: recovery from yielded error', () => {
	const steps: unknown[] = [];

	function* recoverAndReturn() {
		try {
			yield new Error('first');
		} catch (thrown) {
			steps.push(thrown);

			return 'returned';
		}

		return 'unreachable';
	}

	function* recoverAndYield() {
		try {
			yield new Error('first');
		} catch (thrown) {
			steps.push(thrown);

			const received = yield 'recovery';

			steps.push(received);
		}

		return 'finished';
	}

	function* recoverFromResult() {
		try {
			yield error('result error');
		} catch (thrown) {
			steps.push(thrown);
		}

		return 'finished';
	}

	expect(run(recoverAndReturn)).toBe('returned');
	expect(steps).toEqual([new Error('first')]);

	steps.length = 0;

	expect(run(recoverAndYield)).toBe('finished');
	expect(steps).toEqual([new Error('first'), 'recovery']);

	steps.length = 0;

	expect(run(recoverFromResult)).toBe('finished');
	expect(steps).toEqual(['result error']);
});

test('generate: recovery then new failure', () => {
	function* recoverThenThrow() {
		try {
			yield new Error('first');
		} catch {
			throw new Error('second');
		}
	}

	function* recoverThenYieldError() {
		try {
			yield new Error('first');
		} catch {
			yield new Error('second');
		}

		return 'unreachable';
	}

	expect(getThrown(() => run(recoverThenThrow))).toEqual(new Error('second'));
	expect(getThrown(() => run(recoverThenYieldError))).toEqual(new Error('second'));
});

test('generate: returned error after recovery still rejects', () => {
	function* recoverThenReturnError() {
		try {
			yield new Error('first');
		} catch {
			return new Error('returned');
		}
	}

	expect(getThrown(() => run(recoverThenReturnError))).toEqual(new Error('returned'));
});

test('generate: cleanup', () => {
	const steps: string[] = [];

	function* finallyOnError() {
		try {
			yield new Error('failed');
		} finally {
			steps.push('finally');
		}
	}

	function* finallyYields() {
		try {
			yield new Error('failed');
		} finally {
			steps.push('cleanup start');

			yield 'cleanup step';

			steps.push('cleanup end');
		}
	}

	function* finallyThrows() {
		try {
			yield new Error('original');
		} finally {
			throw new Error('cleanup');
		}
	}

	expect(getThrown(() => run(finallyOnError))).toEqual(new Error('failed'));
	expect(steps).toEqual(['finally']);

	steps.length = 0;

	expect(getThrown(() => run(finallyYields))).toEqual(new Error('failed'));
	expect(steps).toEqual(['cleanup start', 'cleanup end']);

	// A throwing `finally` replaces the error inside the generator itself,
	// so this is the generator's own behaviour, not the runner's.
	expect(getThrown(() => run(finallyThrows))).toEqual(new Error('cleanup'));
});

test('generate: success path is unchanged', () => {
	const steps: unknown[] = [];

	function* passesValuesBack() {
		const first = yield 'one';
		const second = yield 'two';

		steps.push(first, second);

		return 'done';
	}

	expect(run(passesValuesBack)).toBe('done');
	expect(steps).toEqual(['one', 'two']);
});

test('asyncGenerate: error values that are nullish still throw', async () => {
	async function* undefinedError() {
		yield error(undefined);

		return 'unreachable';
	}

	async function* recoveredUndefined() {
		try {
			yield error(undefined);
		} catch {
			return 'recovered';
		}

		return 'unreachable';
	}

	await expect(run(undefinedError)).rejects.toBeUndefined();
	await expect(run(recoveredUndefined)).resolves.toBe('recovered');
});

test('asyncGenerate: recovery from yielded error', async () => {
	const steps: unknown[] = [];

	async function* recoverAndReturn() {
		try {
			yield new Error('first');
		} catch (thrown) {
			steps.push(thrown);

			return 'returned';
		}

		return 'unreachable';
	}

	async function* recoverAndYield() {
		try {
			yield new Error('first');
		} catch (thrown) {
			steps.push(thrown);

			const received = yield 'recovery';

			steps.push(received);
		}

		return 'finished';
	}

	async function* recoverFromResult() {
		try {
			yield error('result error');
		} catch (thrown) {
			steps.push(thrown);
		}

		return 'finished';
	}

	await expect(run(recoverAndReturn)).resolves.toBe('returned');
	expect(steps).toEqual([new Error('first')]);

	steps.length = 0;

	await expect(run(recoverAndYield)).resolves.toBe('finished');
	expect(steps).toEqual([new Error('first'), 'recovery']);

	steps.length = 0;

	await expect(run(recoverFromResult)).resolves.toBe('finished');
	expect(steps).toEqual(['result error']);
});

test('asyncGenerate: recovery then new failure', async () => {
	async function* recoverThenThrow() {
		try {
			yield new Error('first');
		} catch {
			throw new Error('second');
		}
	}

	async function* recoverThenYieldError() {
		try {
			yield new Error('first');
		} catch {
			yield new Error('second');
		}

		return 'unreachable';
	}

	async function* recoverThenReturnError() {
		try {
			yield new Error('first');
		} catch {
			return new Error('returned');
		}
	}

	await expect(run(recoverThenThrow)).rejects.toEqual(new Error('second'));
	await expect(run(recoverThenYieldError)).rejects.toEqual(new Error('second'));
	await expect(run(recoverThenReturnError)).rejects.toEqual(new Error('returned'));
});

test('asyncGenerate: cleanup after error', async () => {
	const steps: string[] = [];

	async function* finallyYields() {
		try {
			yield new Error('failed');
		} finally {
			steps.push('cleanup start');

			yield 'cleanup step';

			steps.push('cleanup end');
		}
	}

	await expect(run(finallyYields)).rejects.toEqual(new Error('failed'));
	expect(steps).toEqual(['cleanup start', 'cleanup end']);
});

test('asyncGenerate: abort', async () => {
	const steps: string[] = [];

	async function* finallyOnAbort() {
		try {
			yield 'one';
			yield 'two';
			yield 'three';
		} finally {
			steps.push('finally');
		}
	}

	async function* finallyYieldsOnAbort() {
		try {
			yield 'one';
			yield 'two';
		} finally {
			steps.push('cleanup start');

			yield 'cleanup step';

			steps.push('cleanup end');
		}
	}

	async function* ignoresAbort() {
		let count = 0;

		try {
			while (true) {
				try {
					yield count++;
				} catch {
					steps.push('caught');
				}
			}
		} finally {
			steps.push('finally start');

			yield 'cleanup step';
			yield 'another cleanup step';

			steps.push('finally end');
		}
	}

	async function* slow() {
		yield new Promise(resolve => setTimeout(resolve, 20));
		yield new Promise(resolve => setTimeout(resolve, 20));
		yield 'unreachable';
	}

	for (const [generator, expected] of [
		[finallyOnAbort, ['finally']],
		// The abort is thrown into the generator once; a `yield` in the `finally` it triggers is not resumed
		[finallyYieldsOnAbort, ['cleanup start']],
		// A generator that survives the abort is closed, and its `finally` is drained
		[ignoresAbort, ['caught', 'finally start', 'finally end']],
	] as const) {
		steps.length = 0;

		const controller = new AbortController();
		const promise = run(generator as never, [], controller.signal);

		controller.abort(new Error('aborted'));

		await expect(promise).rejects.toEqual(new Error('aborted'));
		expect(steps).toEqual(expected);
	}

	const controller = new AbortController();
	const promise = run(slow, [], controller.signal);

	setTimeout(() => controller.abort('late abort'), 10);

	await expect(promise).rejects.toBe('late abort');

	const aborted = new AbortController();

	aborted.abort('already aborted');

	await expect(run(slow, [], aborted.signal)).rejects.toBe('already aborted');
});
