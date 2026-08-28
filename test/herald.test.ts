import {expect, test} from 'vitest';
import {herald, isEvents, isHerald, isHeraldSubscription, isSubscription} from '../src';
import {isFixture} from './.fixtures/is.fixture';

const {length, values} = isFixture;

type Events = {
	bar: () => void;
	baz: () => void;
	foo: (id: number, name: string) => void;
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
		sig: [] as number[],
	};

	const harold = herald<Events>({
		names: ['bar', 'baz', 'foo', 'sig'],
	});

	expect(isHerald(harold)).toBe(true);
	expect(isHerald(harold.events)).toBe(false);

	expect(isEvents(harold.events)).toBe(true);
	expect(isEvents(harold)).toBe(false);

	expect(values).toEqual({
		bar: [],
		baz: [],
		foo: [],
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

	const controller = new AbortController();

	const sig = harold.events.subscribe(
		'sig',
		() => {
			values.sig.push(1);
		},
		controller.signal,
	);

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
		sig: [],
	});

	harold.emit('bar');
	harold.emit('baz');
	harold.emit('foo', 1, 'one');
	harold.emit('sig');

	expect(values).toEqual({
		bar: [1],
		baz: [1],
		foo: [{id: 1, name: 'one'}],
		sig: [1],
	});

	bar.unsubscribe();
	controller.abort();

	harold.emit('bar');
	harold.emit('baz');
	harold.emit('foo', 2, 'two');
	harold.emit('sig');

	expect(values).toEqual({
		bar: [1],
		baz: [1, 1],
		foo: [
			{id: 1, name: 'one'},
			{id: 2, name: 'two'},
		],
		sig: [1],
	});

	harold.clear();

	harold.emit('bar');
	harold.emit('baz');
	harold.emit('foo', 3, 'three');
	harold.emit('sig');

	expect(values).toEqual({
		bar: [1],
		baz: [1, 1],
		foo: [
			{id: 1, name: 'one'},
			{id: 2, name: 'two'},
		],
		sig: [1],
	});

	expect(() => {
		harold.subscribe('nope' as never, (() => {}) as never);
	}).toThrow();

	expect(() => {
		herald(123 as never);
	}).toThrow();
});
