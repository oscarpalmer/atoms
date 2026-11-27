import {expect, test} from 'vite-plus/test';
import {keyedQueue, queue} from '../../src';

test('queue, keyed', () =>
	new Promise<void>(done => {
		expect(queue.keyed).toBe(keyedQueue);

		const keyed = keyedQueue(
			(key: string, value: number) =>
				new Promise<void>(resolve => {
					setTimeout(() => {
						result[key] ??= [];

						result[key].push(value);

						resolve();
					}, 100);
				}),
			{
				autostart: false,
				concurrency: 1,
				maximum: 3,
			},
		);

		expect(() => keyedQueue('blah' as never)).toThrow();

		const result: Record<string, number[]> = {};

		expect(keyed.active).toEqual([]);
		expect(keyed.autostart).toBe(false);
		expect(keyed.concurrency).toBe(1);
		expect(keyed.empty).toEqual([]);
		expect(keyed.full).toEqual([]);
		expect(keyed.items).toEqual({});
		expect(keyed.keys).toEqual([]);
		expect(keyed.maximum).toBe(3);
		expect(keyed.paused).toEqual([]);
		expect(keyed.queues).toBe(0);

		keyed.add('a', [1]).promise.catch(() => {});
		keyed.add('a', [2]).promise.catch(() => {});
		keyed.add('a', [3]).promise.catch(() => {});

		keyed.add('b', [1]).promise.catch(() => {});
		keyed.add('b', [2]).promise.catch(() => {});
		keyed.add('b', [3]).promise.catch(() => {});

		expect(() => keyed.add('a', [4])).toThrow();
		expect(() => keyed.add('b', [4])).toThrow();

		expect(keyed.active).toEqual([]);
		expect(keyed.autostart).toBe(false);
		expect(keyed.concurrency).toBe(1);
		expect(keyed.empty).toEqual([]);
		expect(keyed.items).toEqual({a: 3, b: 3});
		expect(keyed.full).toEqual(['a', 'b']);
		expect(keyed.keys).toEqual(['a', 'b']);
		expect(keyed.maximum).toBe(3);
		expect(keyed.paused).toEqual(['a', 'b']);
		expect(keyed.queues).toBe(2);

		expect(result).toEqual({});

		keyed.resume();

		setTimeout(() => {
			keyed.pause('a');
			keyed.pause();
		}, 75);

		setTimeout(() => {
			expect(keyed.active).toEqual([]);
			expect(keyed.autostart).toBe(false);
			expect(keyed.concurrency).toBe(1);
			expect(keyed.empty).toEqual([]);
			expect(keyed.items).toEqual({a: 2, b: 2});
			expect(keyed.full).toEqual([]);
			expect(keyed.keys).toEqual(['a', 'b']);
			expect(keyed.maximum).toBe(3);
			expect(keyed.paused).toEqual(['a', 'b']);
			expect(keyed.queues).toBe(2);

			expect(result).toEqual({
				a: [1],
				b: [1],
			});

			keyed.remove('a', 3);
			keyed.remove('b');
			keyed.remove('c');

			keyed.resume('a');
			keyed.resume('b');

			expect(() => keyed.get(123 as never)).toThrow();
		}, 125);

		setTimeout(() => {
			expect(keyed.active).toEqual([]);
			expect(keyed.autostart).toBe(false);
			expect(keyed.concurrency).toBe(1);
			expect(keyed.empty).toEqual(['a']);
			expect(keyed.items).toEqual({a: 0});
			expect(keyed.full).toEqual([]);
			expect(keyed.keys).toEqual(['a']);
			expect(keyed.maximum).toBe(3);
			expect(keyed.paused).toEqual([]);
			expect(keyed.queues).toBe(1);

			keyed.clear();
			keyed.remove();

			expect(keyed.active).toEqual([]);
			expect(keyed.autostart).toBe(false);
			expect(keyed.concurrency).toBe(1);
			expect(keyed.empty).toEqual([]);
			expect(keyed.items).toEqual({});
			expect(keyed.full).toEqual([]);
			expect(keyed.keys).toEqual([]);
			expect(keyed.maximum).toBe(3);
			expect(keyed.paused).toEqual([]);
			expect(keyed.queues).toBe(0);

			expect(result).toEqual({
				a: [1, 2],
				b: [1],
			});

			done();
		}, 500);
	}));

test('keyedQueue.toJSON', () => {
	function roundTrip(value: unknown): unknown {
		return JSON.parse(JSON.stringify(value));
	}

	const keyed = keyedQueue(async (_: string) => {}, {autostart: false, maximum: 1});

	expect(roundTrip(keyed)).toStrictEqual({
		active: [],
		empty: [],
		full: [],
		items: {},
		keys: [],
		paused: [],
		queues: 0,
	});

	void keyed.add('first', []);

	expect(roundTrip(keyed)).toStrictEqual({
		active: [],
		empty: [],
		full: ['first'],
		items: {first: 1},
		keys: ['first'],
		paused: ['first'],
		queues: 1,
	});
});
