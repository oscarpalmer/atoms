import {expect, test} from 'bun:test';
import {isRepeated, isTimer, isWaited, repeat, wait} from '../src/js/timer';

test('start', done => {
	wait(() => {
		expect(true).toEqual(true);
		done();
	}, 125);
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

test('is', done => {
	const repeated = repeat(() => {}, {count: 1});
	const waited = wait(() => {});

	expect(isTimer(repeated)).toBe(true);
	expect(isTimer(waited)).toBe(true);

	expect(isRepeated(repeated)).toBe(true);
	expect(isRepeated(waited)).toBe(false);

	expect(isWaited(repeated)).toBe(false);
	expect(isWaited(waited)).toBe(true);

	wait(() => {
		expect(repeated.active).toBe(false);
		expect(waited.active).toBe(false);

		done();
	}, 125);
});
