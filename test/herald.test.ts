import {expect, test} from 'vitest';
import {herald, isHeraldEvents, isHerald, isHeraldSubscription, isSubscription} from '../src';

type Events = {
	bar: () => void;
	baz: () => void;
	foo: (id: number, name: string) => void;
	'hello-world': () => void;
	sig: () => void;
};

test('', () => {
	function onFoo(id: number, name: string): void {
		values.foo.push({id, name});
	}

	const values = {
		bar: [] as number[],
		baz: [] as number[],
		foo: [] as {id: number; name: string}[],
		'hello-world': [] as number[],
		sig: [] as number[],
	};

	const harold = herald<Events>({
		names: ['bar', 'baz', 'foo', 'hello-world', 'sig'],
	});

	expect(isHerald(harold)).toBe(true);
	expect(isHerald(harold.events)).toBe(false);

	expect(isHeraldEvents(harold.events)).toBe(true);
	expect(isHeraldEvents(harold)).toBe(false);

	expect(values).toEqual({
		bar: [],
		baz: [],
		foo: [],
		'hello-world': [],
		sig: [],
	});

	const bar = harold.subscribe('bar', () => {
		values.bar.push(1);
	});

	const baz = harold.subscribe('baz', () => {
		values.baz.push(1);
	});

	const fooOne = harold.subscribe('foo', onFoo);
	const fooTwo = harold.subscribe('foo', onFoo);

	harold.events['hello-world'](() => {
		values['hello-world'].push(1);
	});

	const controller = new AbortController();

	const sig = harold.events.sig(() => {
		values.sig.push(1);
	}, controller.signal);

	expect(isSubscription(bar)).toBe(true);
	expect(isSubscription(baz)).toBe(true);
	expect(isSubscription(fooOne)).toBe(true);
	expect(isSubscription(fooTwo)).toBe(true);
	expect(isSubscription(sig)).toBe(true);
	expect(isSubscription(harold)).toBe(false);

	expect(isHeraldSubscription(bar)).toBe(true);
	expect(isHeraldSubscription(baz)).toBe(true);
	expect(isHeraldSubscription(fooOne)).toBe(true);
	expect(isHeraldSubscription(fooTwo)).toBe(true);
	expect(isHeraldSubscription(sig)).toBe(true);
	expect(isHeraldSubscription(harold)).toBe(false);

	expect(fooOne).toBe(fooTwo);

	expect(values).toEqual({
		bar: [],
		baz: [],
		foo: [],
		'hello-world': [],
		sig: [],
	});

	harold.emit('bar');
	harold.emit('baz');
	harold.emit('foo', 1, 'one');
	harold.emit('hello-world');
	harold.emit('sig');

	expect(values).toEqual({
		bar: [1],
		baz: [1],
		foo: [{id: 1, name: 'one'}],
		'hello-world': [1],
		sig: [1],
	});

	bar.unsubscribe();
	controller.abort();

	harold.emit('bar');
	harold.emit('baz');
	harold.emit('foo', 2, 'two');
	harold.emit('hello-world');
	harold.emit('sig');

	expect(values).toEqual({
		bar: [1],
		baz: [1, 1],
		foo: [
			{id: 1, name: 'one'},
			{id: 2, name: 'two'},
		],
		'hello-world': [1, 1],
		sig: [1],
	});

	harold.clear();

	harold.emit('bar');
	harold.emit('baz');
	harold.emit('foo', 3, 'three');
	harold.emit('hello-world');
	harold.emit('sig');

	expect(values).toEqual({
		bar: [1],
		baz: [1, 1],
		foo: [
			{id: 1, name: 'one'},
			{id: 2, name: 'two'},
		],
		'hello-world': [1, 1],
		sig: [1],
	});

	expect(() => {
		harold.subscribe('nope' as never, (() => {}) as never);
	}).toThrow();

	expect(() => {
		herald(123 as never);
	}).toThrow();

	expect(() => {
		herald({
			names: ['hello, world!'],
			property: 123 as never,
		});
	}).toThrow();

	expect(() => {
		herald({
			names: ['hello, world!'],
			property: {
				key: 123 as never,
			},
		});
	}).toThrow();

	expect(() => {
		herald({
			names: ['hello, world!'],
			property: {
				key: 'ok',
				value: 123 as never,
			},
		});
	}).toThrow();

	expect(() => {
		herald({
			names: ['hello, world!'],
			onCreate: 123 as never,
		});
	}).toThrow();
});
