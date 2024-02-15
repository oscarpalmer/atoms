import {describe, expect, test} from 'bun:test';
import {repeat, wait} from '../src/js/timer';

describe('Methods', () => {
	test('Should be able to start', done => {
		wait(() => {
			expect(true).toEqual(true);
			done();
		}, 125);
	});

	test('Should be able to stop', done => {
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

	test('Should be able to restart', done => {
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
});

describe('Repetition', () => {
	describe('Methods', () => {
		test('Should be able to handle after-callbacks with proper finished-state', done => {
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
	});
});
