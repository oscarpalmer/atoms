import {expect, test} from 'bun:test';
import {cloneProxy, proxy, subscribe, unsubscribe} from '../src/js/proxy';
import {wait} from '../src/js/timer';

type Basic = {
	second?: Basic;
} & FakeProxy;

type FakeProxy = {
	$?: {
		owner: unknown;
		subscribers: unknown;
		subscribed: unknown;
		clone: () => void;
		off: () => void;
		on: () => void;
	};
};

type Subscriptions = {
	array: number[];
	value: unknown;
};

test('basic', () => {
	const first = proxy<Basic>({});

	expect(first).toBeInstanceOf(Object);
	expect(first.$).toBeInstanceOf(Object);
	expect(first.$?.owner).toBe(first);
	expect(first.$?.subscribers).toBeInstanceOf(Map);
	expect(first.$?.subscribed).toBe(false);

	expect(
		[first.$?.clone, first.$?.off, first.$?.on].every(
			f => typeof f === 'function',
		),
	).toBe(true);

	const second = proxy({});

	expect(second).not.toBe(first);
	expect(cloneProxy(first)).not.toBe(first);

	first.second = second;

	expect(first.second).not.toBe(second);
	expect(first.second.$?.owner).toBe(first.$?.owner);
});

test('subscriptions', done => {
	const proxied = proxy<Subscriptions>({
		array: [],
		value: undefined,
	});

	let arrayCount = 0;
	let valueCount = 0;

	function onArrayChange(to: number[], from: number[]) {
		expect(to.length).not.toEqual(from.length);
		expect(proxied.array).toEqual(to);

		arrayCount += 1;
	}

	function onValueChange(to: unknown, from: unknown) {
		expect(to).not.toEqual(from);
		expect(proxied.value).toEqual(to);

		valueCount += 1;
	}

	subscribe(proxied, 'array', onArrayChange);
	subscribe(proxied, 'value', onValueChange);

	proxied.array.push(1);

	proxied.value = 1;

	wait(() => {
		unsubscribe(proxied, 'array', onArrayChange);
		unsubscribe(proxied, 'value', onValueChange);
	}, 125);

	wait(() => {
		proxied.array.push(2);

		proxied.value = 2;
	}, 250);

	wait(() => {
		expect(arrayCount).toBe(1);
		expect(valueCount).toBe(1);

		done();
	}, 375);
});
