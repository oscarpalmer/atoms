import {expect, test} from 'vitest';
import {queue} from '../../src';
import {queueFixture} from '../.fixtures/queue.fixture';

const {asynchronous, synchronous} = queueFixture;

test('autostart', () =>
	new Promise<void>(done => {
		const queued = queue(asynchronous, {autostart: false});

		const now = Date.now();
		const values: number[] = [];

		let last: number;

		for (let index = 0; index < 5; index += 1) {
			void queued.add([index]).promise.then(({value}) => {
				values.push(value);

				last = Date.now();
			});
		}

		expect(queued.autostart).toBe(false);
		expect(values).toEqual([]);

		expect(queue(asynchronous, {autostart: true}).autostart).toBe(true);
		expect(queue(asynchronous, {autostart: 'blah' as never}).autostart).toBe(true);

		setTimeout(() => {
			expect(values).toEqual([]);
			expect(last).toBeUndefined();

			queued.resume();
			queued.resume();
		}, 500);

		setTimeout(() => {
			expect(values).toEqual([0, 1, 2, 3, 4]);
			expect(last - now).toBeGreaterThanOrEqual(450 + 500);
			expect(last - now).toBeLessThan(550 + 500);

			done();
		}, 1100);
	}));

test('callback', () => {
	expect(() => queue('blah' as never)).toThrow('A Queue requires a callback function');
});

test('concurrency', () =>
	new Promise<void>(done => {
		const queued = queue(asynchronous, {concurrency: 100});

		const now = Date.now();
		const values: number[] = [];

		let last: number;

		for (let index = 0; index < 5; index += 1) {
			void queued.add([index]).promise.then(({value}) => {
				values.push(value);

				last = Date.now();
			});
		}

		expect(queued.concurrency).toBe(100);
		expect(values).toEqual([]);

		expect(queue(asynchronous, {concurrency: 0}).concurrency).toBe(1);
		expect(queue(asynchronous, {concurrency: -1}).concurrency).toBe(1);
		expect(queue(asynchronous, {concurrency: 'blah' as never}).concurrency).toBe(1);

		setTimeout(() => {
			expect(values).toEqual([0, 1, 2, 3, 4]);
			expect(last - now).toBeGreaterThanOrEqual(50);
			expect(last - now).toBeLessThan(150);

			done();
		}, 150);
	}));

test('maximum size', () => {
	const queued = queue(synchronous, {
		autostart: false,
		maximum: 2,
	});

	void queued.add([0]).promise.catch(() => {});
	void queued.add([1]).promise.catch(() => {});

	expect(queued.maximum).toBe(2);
	expect(() => queued.add([2])).toThrow('Queue has reached its maximum size');

	expect(queue(synchronous, {maximum: -99}).maximum).toBe(0);
	expect(queue(synchronous, {maximum: 'blah' as never}).maximum).toBe(0);

	queued.clear();
});
