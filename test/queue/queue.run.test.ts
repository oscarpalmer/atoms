import {expect, test} from 'vitest';
import {queue} from '../../src/queue';
import {queueFixture} from '../.fixtures/queue.fixture';

const {asynchronous, synchronous} = queueFixture;

test('asynchronous', () =>
	new Promise<void>(done => {
		const queued = queue(asynchronous);

		const now = Date.now();
		const values: number[] = [];

		let last: number;

		for (let index = 0; index < 5; index += 1) {
			void queued.add([index]).promise.then(value => {
				values.push(value);

				last = Date.now();
			});
		}

		expect(values).toEqual([]);

		setTimeout(() => {
			expect(values).toEqual([0, 1, 2, 3, 4]);
			expect(last - now).toBeGreaterThanOrEqual(490);
			expect(last - now).toBeLessThan(510);

			done();
		}, 600);
	}));

test('clear', () =>
	new Promise<void>(done => {
		const queued = queue(asynchronous, {
			autostart: false,
			concurrency: 5,
		});

		let errors = 0;
		let successes = 0;

		for (let index = 0; index < 5; index += 1) {
			void queued.add([index]).promise.then(
				() => {
					successes += 1;
				},
				error => {
					expect(error).toBeInstanceOf(Error);
					expect(error.message).toBe('Queue was cleared');

					errors += 1;
				},
			);
		}

		expect(errors).toBe(0);
		expect(successes).toBe(0);
		expect(queued.size).toBe(5);

		queued.clear();

		setTimeout(() => {
			expect(errors).toBe(5);
			expect(successes).toBe(0);
			expect(queued.size).toBe(0);

			done();
		}, 200);
	}));

test('error', () =>
	new Promise<void>(done => {
		const queued = queue(() => {
			throw new Error('Test');
		});

		let failed: boolean;
		let successful: boolean;

		void queued.add([]).promise.then(
			() => {
				failed = false;
				successful = true;
			},
			error => {
				expect(error).toBeInstanceOf(Error);
				expect(error.message).toBe('Test');

				failed = true;
				successful = false;
			},
		);

		setTimeout(() => {
			expect(failed).toBe(true);
			expect(successful).toBe(false);

			done();
		}, 100);
	}));

test('synchronous', () =>
	new Promise<void>(done => {
		const queued = queue(synchronous);

		const now = Date.now();
		const values: number[] = [];

		let last: number;

		for (let index = 0; index < 5; index += 1) {
			void queued.add([index]).promise.then(value => {
				values.push(value);

				last = Date.now();
			});
		}

		expect(values).toEqual([]);

		setTimeout(() => {
			expect(values).toEqual([0, 1, 2, 3, 4]);
			expect(last - now).toBeGreaterThanOrEqual(0);
			expect(last - now).toBeLessThan(10);

			done();
		}, 1000);
	}));

test('remove', () =>
	new Promise<void>(done => {
		const queued = queue(synchronous, {
			autostart: false,
		});

		let failed: boolean;
		let successful: boolean;

		const {id, promise} = queued.add([0]);

		promise.then(
			() => {
				failed = false;
				successful = true;
			},
			error => {
				expect(error).toBeInstanceOf(Error);
				expect(error.message).toBe('Item removed from queue');

				failed = true;
				successful = false;
			},
		);

		expect(queued.size).toBe(1);

		queued.remove(String(id) as never);

		expect(queued.size).toBe(1);

		queued.remove(id);

		expect(queued.size).toBe(0);

		setTimeout(() => {
			expect(failed).toBe(true);
			expect(successful).toBe(false);

			done();
		}, 100);
	}));
