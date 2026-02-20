import {expect, test} from 'vitest';
import {queue} from '../../src/queue';
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
