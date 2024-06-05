import {afterAll, expect, test} from 'bun:test';
import {
	isRepeated,
	isTimer,
	isWaited,
	isWhen,
	repeat,
	wait,
	when,
} from '../src/js/timer';

test('start', done => {
	wait(() => {
		expect(true).toEqual(true);
		done();
	}, 125);

	const x = repeat(() => {}, {timeout: 0});

	x.stop();
});

test('stop', done => {
	let value = 0;

	const waited = wait(() => {
		value = 1234;
	}, 250);

	waited.start(); // Double-called to cover active-logic

	wait(() => {
		waited.stop();
		waited.stop(); // Double-called to cover active-logic
	}, 125);

	wait(() => {
		expect(value).toEqual(0);
		done();
	}, 375);
});

test('restart', done => {
	let value = 0;

	const waited = wait(() => {
		value += 1;
	}, 250);

	wait(() => {
		waited.restart();
	}, 125);

	wait(() => {
		expect(value).toEqual(1);
		done();
	}, 375);
});

test('timer: pause & continue', done => {
	const now = Date.now();

	let count = 0;

	const timer = repeat(
		index => {
			if (index < 5) {
				expect(Date.now() - now).toBeLessThan(125);
			} else {
				expect(Date.now() - now).toBeGreaterThan(375);
			}

			count += 1;
		},
		{
			count: 10,
			interval: 25,
		},
	);

	wait(
		() => {
			timer.pause();

			wait(() => {
				timer.continue();

				wait(() => {
					expect(count).toEqual(10);
					done();
				}, 250);
			}, 250);
		},
		{
			interval: 125,
		},
	);
});

test('when', done => {
	let stopped = false;
	let value = 0;

	wait(() => {
		value += 1;
	}, 125);

	when(() => value > 0).then(() => {
		expect(value).toEqual(1);
	});

	const what = when(
		() => {
			expect(what.active).toBe(true);

			return value > 1;
		},
		{
			interval: 125,
		},
	);

	wait(() => {
		what.stop();
	}, 175);

	what.then(null, () => {
		stopped = true;
	});

	when(() => value > 1, {
		timeout: 250,
	}).then(null, () => {
		expect(stopped).toBe(true);
		expect(value).toEqual(1);
		done();
	});
});

test('when: pause & continue', done => {
	let finished = false;

	const what = when(() => finished, {
		count: 100,
		interval: 25,
	});

	what.then(() => {
		expect(finished).toBe(true);
		done();
	});

	wait(
		() => {
			what.pause();

			wait(() => {
				what.continue();

				wait(() => {
					finished = true;
				}, 125);
			}, 250);
		},
		{
			interval: 125,
		},
	);
});

test('afterCallback', done => {
	let finishedStep = 0;
	let finishedValue = 0;
	let stoppedValue = 0;

	const stoppedTimer = repeat(
		() => {
			stoppedValue += 1;
		},
		{
			afterCallback: finished => {
				expect(finished).toBe(false);
				expect(stoppedValue).toEqual(1);
			},
			count: 10,
			interval: 125,
		},
	);

	stoppedTimer.start(); // Double-called to cover active-logic

	wait(() => {
		stoppedTimer.stop();
		stoppedTimer.stop(); // Double-called to cover active-logic
		done();
	}, 150);

	repeat(
		index => {
			finishedStep = index;
			finishedValue += 1;
		},
		{
			afterCallback: finished => {
				expect(finished).toBe(true);
				expect(finishedStep).toEqual(9);
				expect(finishedValue).toEqual(10);
			},
			count: 10,
		},
	);
});

test('errorCallback', done => {
	let error = false;
	let finished: boolean | undefined;

	repeat(() => {}, {
		afterCallback(f) {
			finished = f;
		},
		errorCallback() {
			error = true;
		},
		count: 100,
		interval: 50,
		timeout: 125,
	});

	wait(() => {
		expect(error).toBe(true);
		expect(finished).toBe(false);
		done();
	}, 250);
});

test('is', done => {
	const repeated = repeat(() => {}, {count: 1});
	const waited = wait(() => {});
	const whened = when(() => true);

	expect(isTimer(repeated)).toBe(true);
	expect(isTimer(waited)).toBe(true);
	expect(isTimer(whened)).toBe(false);

	expect(isRepeated(repeated)).toBe(true);
	expect(isRepeated(waited)).toBe(false);
	expect(isRepeated(whened)).toBe(false);

	expect(isWaited(repeated)).toBe(false);
	expect(isWaited(waited)).toBe(true);
	expect(isWaited(whened)).toBe(false);

	expect(isWhen(repeated)).toBe(false);
	expect(isWhen(waited)).toBe(false);
	expect(isWhen(whened)).toBe(true);

	wait(() => {
		expect(repeated.active).toBe(false);
		expect(waited.active).toBe(false);

		done();
	}, 25);
});
