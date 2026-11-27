import {expect, test} from 'vite-plus/test';
import {queue} from '../../src';
import {queueFixture} from '../.fixtures/queue.fixture';

const {asynchronous} = queueFixture;

test('properties', () =>
	new Promise<void>(done => {
		const queued = queue(asynchronous, {
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

test('queue.toJSON', () => {
	function roundTrip(value: unknown): unknown {
		return JSON.parse(JSON.stringify(value));
	}

	const paused = queue(asynchronous, {autostart: false, maximum: 2});

	expect(roundTrip(paused)).toStrictEqual({
		active: false,
		empty: true,
		full: false,
		paused: true,
		size: 0,
	});

	void paused.add(['First']);
	void paused.add(['Second']);

	expect(roundTrip(paused)).toStrictEqual({
		active: false,
		empty: false,
		full: true,
		paused: true,
		size: 2,
	});

	// A never-settling callback keeps the queue active
	const running = queue(() => new Promise<void>(() => {}));

	void running.add([]);

	expect(roundTrip(running)).toStrictEqual({
		active: true,
		empty: true,
		full: false,
		paused: false,
		size: 0,
	});
});
