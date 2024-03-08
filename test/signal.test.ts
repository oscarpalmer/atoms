import {expect, test} from 'bun:test';
import {
	computed,
	effect,
	isComputed,
	isEffect,
	isSignal,
	signal,
} from '../src/js/signal';
import {wait} from '../src/js/timer';

test('computed', done => {
	const first = signal(1);
	const second = signal(2);
	const third = computed(() => first.value + second.value);

	expect(third.peek()).toBe(3);

	first.value = 2;

	wait(() => {
		expect(third.value).toBe(4);

		wait(() => {
			third.stop();

			second.value = 3;

			wait(() => {
				expect(third.value).toBe(4);

				third.run();

				wait(() => {
					expect(third.value).toBe(5);

					done();
				});
			});
		});
	});
});

test('effect', done => {
	let value: unknown = undefined;
	const sig = signal(1);

	const fx = effect(() => {
		value = sig.value;
	});

	expect(value).toBe(1);

	sig.value = 2;

	wait(() => {
		expect(value).toBe(2);

		fx.stop();

		sig.value = 3;

		wait(() => {
			expect(value).toBe(2);

			fx.run();

			wait(() => {
				expect(value).toBe(3);

				done();
			});
		});
	});
});

test('is', () => {
	let value = 0;

	const sig = signal(1);
	const com = computed(() => sig.value ** 2);

	const fx = effect(() => {
		value += com.value;
	});

	expect(isComputed(com)).toBe(true);
	expect(isEffect(fx)).toBe(true);
	expect(isSignal(sig)).toBe(true);

	expect(isComputed(sig)).toBe(false);
	expect(isEffect(com)).toBe(false);
	expect(isSignal(fx)).toBe(false);
});

test('signal', done => {
	const sig = signal(1);

	expect(sig.value).toBe(1);
	expect(sig.peek()).toBe(1);
	expect(sig.toJSON()).toBe(1);
	expect(sig.toString()).toBe('1');

	let value: unknown = undefined;

	effect(() => {
		value = sig.value;
	});

	expect(value).toBe(1);

	sig.stop();

	sig.value = 2;

	wait(() => {
		expect(value).toBe(1);

		sig.run();

		wait(() => {
			expect(value).toBe(2);

			done();
		});
	});
});
