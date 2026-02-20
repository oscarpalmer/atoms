import {expect, test} from 'vitest';
import {queue} from '../src/queue';

const asyncCallback = async (value: number) =>
	new Promise<number>(resolve => {
		setTimeout(() => resolve(value), 100);
	});

const syncCallback = async (value: number) => value;

test('abort', () => new Promise<void>(done => {
	const queued = queue(asyncCallback);

	const names = [
		'First!',
		'Second!',
		'Third!',
		'Fourth!',
		'Fifth!',
	];

	const signals = Array.from({length: 5}, () => new AbortController());

	const errors: unknown[] = [];
	const values: number[] = [];

	signals[0].abort(names[0]);

	expect(() => queued.add([0], signals[0].signal)).toThrow(names[0]);

	for (let index = 1; index < 5; index += 1) {
		void queued
			.add([index], signals[index].signal)
			.promise.then(value => {
				values.push(value ** 2);
			})
			.catch(error => {
				errors.push(error);
			});
	}

	setTimeout(() => {
		signals[1].abort(names[1]);
		signals[2].abort(names[2]);

		queued.pause();
	}, 50);

	setTimeout(() => {
		signals[3].abort(names[3]);

		queued.resume();
	}, 100);

	setTimeout(() => {
		signals[4].abort(names[4]);
	}, 150);

	setTimeout(() => {
		expect(errors).toEqual(names.slice(1));
		expect(values).toEqual([]);

		done();
	}, 600);
}));

test('basic: synchronous', () =>
	new Promise<void>(done => {
		const queued = queue(syncCallback);

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

test('basic: asynchronous', () =>
	new Promise<void>(done => {
		const queued = queue(asyncCallback);

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

test('callback', () => {
	expect(() => queue('blah' as never)).toThrow('A Queue requires a callback function');
});

test('clear', () =>
	new Promise<void>(done => {
		const queued = queue(asyncCallback, {
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

test('option: autostart off', () =>
	new Promise<void>(done => {
		const queued = queue(asyncCallback, {autostart: false});

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
			expect(values).toEqual([]);
			expect(last).toBeUndefined();

			queued.resume();
			queued.resume();
		}, 500);

		setTimeout(() => {
			expect(values).toEqual([0, 1, 2, 3, 4]);
			expect(last - now).toBeGreaterThanOrEqual(490 + 500);
			expect(last - now).toBeLessThan(510 + 500);

			done();
		}, 1100);
	}));

test('option: concurrency', () =>
	new Promise<void>(done => {
		const queued = queue(asyncCallback, {concurrency: 100});

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
			expect(last - now).toBeGreaterThanOrEqual(90);
			expect(last - now).toBeLessThan(110);

			done();
		}, 150);
	}));

test('option: maximum size', () => {
	const queued = queue(syncCallback, {
		autostart: false,
		maximum: 2,
	});

	queued.add([0]);
	queued.add([1]);

	expect(() => queued.add([2])).toThrow('Queue has reached its maximum size');
});

test('properties', () =>
	new Promise<void>(done => {
		const queued = queue(asyncCallback, {
			autostart: false,
			maximum: 2,
		});

		expect(queued.active).toBe(false);
		expect(queued.empty).toBe(true);
		expect(queued.full).toBe(false);
		expect(queued.paused).toBe(true);
		expect(queued.size).toBe(0);

		queued.add([0]);

		expect(queued.active).toBe(false);
		expect(queued.empty).toBe(false);
		expect(queued.full).toBe(false);
		expect(queued.paused).toBe(true);
		expect(queued.size).toBe(1);

		queued.add([1]);

		expect(queued.active).toBe(false);
		expect(queued.empty).toBe(false);
		expect(queued.full).toBe(true);
		expect(queued.paused).toBe(true);
		expect(queued.size).toBe(2);

		queued.resume();

		setTimeout(() => {
			expect(queued.active).toBe(true);
			expect(queued.empty).toBe(false);
			expect(queued.full).toBe(false);
			expect(queued.paused).toBe(false);
			expect(queued.size).toBe(1);

			queued.pause();
		}, 50);

		setTimeout(() => {
			expect(queued.active).toBe(false);
			expect(queued.empty).toBe(false);
			expect(queued.full).toBe(false);
			expect(queued.paused).toBe(true);
			expect(queued.size).toBe(1);

			queued.resume();
		}, 100);

		setTimeout(() => {
			expect(queued.active).toBe(true);
			expect(queued.empty).toBe(true);
			expect(queued.full).toBe(false);
			expect(queued.paused).toBe(false);
			expect(queued.size).toBe(0);
		}, 200);

		setTimeout(() => {
			expect(queued.active).toBe(false);
			expect(queued.empty).toBe(true);
			expect(queued.full).toBe(false);
			expect(queued.paused).toBe(false);
			expect(queued.size).toBe(0);

			done();
		}, 300);
	}));

test('remove', () =>
	new Promise<void>(done => {
		const queued = queue(syncCallback, {
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
