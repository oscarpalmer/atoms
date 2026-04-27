import {expect, test} from 'vitest';
import {keyedQueue} from '../../src';

test('', () =>
	new Promise<void>(done => {
		const queue = keyedQueue(
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

		expect(queue.active).toEqual([]);
		expect(queue.autostart).toBe(false);
		expect(queue.concurrency).toBe(1);
		expect(queue.empty).toEqual([]);
		expect(queue.full).toEqual([]);
		expect(queue.items).toEqual({});
		expect(queue.keys).toEqual([]);
		expect(queue.maximum).toBe(3);
		expect(queue.paused).toEqual([]);
		expect(queue.queues).toBe(0);

		queue.add('a', [1]).promise.catch(() => {});
		queue.add('a', [2]).promise.catch(() => {});
		queue.add('a', [3]).promise.catch(() => {});

		queue.add('b', [1]).promise.catch(() => {});
		queue.add('b', [2]).promise.catch(() => {});
		queue.add('b', [3]).promise.catch(() => {});

		expect(() => queue.add('a', [4])).toThrow();
		expect(() => queue.add('b', [4])).toThrow();

		expect(queue.active).toEqual([]);
		expect(queue.autostart).toBe(false);
		expect(queue.concurrency).toBe(1);
		expect(queue.empty).toEqual([]);
		expect(queue.items).toEqual({a: 3, b: 3});
		expect(queue.full).toEqual(['a', 'b']);
		expect(queue.keys).toEqual(['a', 'b']);
		expect(queue.maximum).toBe(3);
		expect(queue.paused).toEqual(['a', 'b']);
		expect(queue.queues).toBe(2);

		expect(result).toEqual({});

		queue.resume();

		setTimeout(() => {
			queue.pause('a');
			queue.pause();
		}, 75);

		setTimeout(() => {
			expect(queue.active).toEqual([]);
			expect(queue.autostart).toBe(false);
			expect(queue.concurrency).toBe(1);
			expect(queue.empty).toEqual([]);
			expect(queue.items).toEqual({a: 2, b: 2});
			expect(queue.full).toEqual([]);
			expect(queue.keys).toEqual(['a', 'b']);
			expect(queue.maximum).toBe(3);
			expect(queue.paused).toEqual(['a', 'b']);
			expect(queue.queues).toBe(2);

			expect(result).toEqual({
				a: [1],
				b: [1],
			});

			queue.remove('a', 3);
			queue.remove('b');
			queue.remove('c');

			queue.resume('a');
			queue.resume('b');

			expect(() => queue.get(123 as never)).toThrow();
		}, 125);

		setTimeout(() => {
			expect(queue.active).toEqual([]);
			expect(queue.autostart).toBe(false);
			expect(queue.concurrency).toBe(1);
			expect(queue.empty).toEqual(['a']);
			expect(queue.items).toEqual({a: 0});
			expect(queue.full).toEqual([]);
			expect(queue.keys).toEqual(['a']);
			expect(queue.maximum).toBe(3);
			expect(queue.paused).toEqual([]);
			expect(queue.queues).toBe(1);

			queue.clear();
			queue.remove();

			expect(queue.active).toEqual([]);
			expect(queue.autostart).toBe(false);
			expect(queue.concurrency).toBe(1);
			expect(queue.empty).toEqual([]);
			expect(queue.items).toEqual({});
			expect(queue.full).toEqual([]);
			expect(queue.keys).toEqual([]);
			expect(queue.maximum).toBe(3);
			expect(queue.paused).toEqual([]);
			expect(queue.queues).toBe(0);

			expect(result).toEqual({
				a: [1, 2],
				b: [1],
			});

			done();
		}, 500);
	}));
