import {expect, test} from 'vitest';
import {kalas} from '../src';

type Party = {
	foo: (id: number, name: string) => void;
	bar: () => void;
	baz: () => void;
};

test('', () => {
	const party = kalas<Party>(['bar', 'baz', 'foo']);

	const count = {
		bar: [0, 0],
		baz: 0,
		foo: [0, 0],
	};

	const result = {
		a: undefined as unknown as string,
		b: undefined as unknown as string,
	};

	const onFooA = (id: number, name: string) => {
		count.foo[0] += 1;

		result.a = `#${id}: ${name}`;
	};

	const onFooB = (id: number, name: string) => {
		count.foo[1] += 1;

		result.b = `#${id}: ${name}`;
	};

	const onBarOne = () => {
		count.bar[0] += 1;
	};

	const onBarTwo = () => {
		count.bar[1] += 1;
	};

	const unsubscribeFooOne = party.events.subscribe('foo', onFooA);

	const unsubscribeNoopOne = party.events.subscribe('foo', 123 as never);
	const unsubscribeNoopTwo = party.events.subscribe('xyz' as never, onBarOne as never);

	expect(typeof unsubscribeNoopOne).toBe('function');
	expect(typeof unsubscribeNoopTwo).toBe('function');

	party.events.subscribe('foo', onFooB);
	party.events.subscribe('bar', onBarOne);
	party.events.subscribe('bar', onBarTwo);

	party.events.subscribe('baz', () => {
		count.baz += 1;
	});

	expect(count).toEqual({
		bar: [0, 0],
		baz: 0,
		foo: [0, 0],
	});

	expect(result).toEqual({
		a: undefined,
		b: undefined,
	});

	party.emit('foo', 1, 'Alice');
	party.emit('bar');
	party.emit('baz');

	expect(count).toEqual({
		bar: [1, 1],
		baz: 1,
		foo: [1, 1],
	});

	expect(result).toEqual({
		a: '#1: Alice',
		b: '#1: Alice',
	});

	unsubscribeFooOne();

	party.emit('foo', 2, 'Bob');
	party.emit('bar');
	party.emit('baz');

	expect(count).toEqual({
		bar: [2, 2],
		baz: 2,
		foo: [1, 2],
	});

	expect(result).toEqual({
		a: '#1: Alice',
		b: '#2: Bob',
	});

	party.events.unsubscribe('foo', onFooB);

	party.events.unsubscribe('foo', 123 as never);
	party.events.unsubscribe('xyz' as never, onBarOne as never);

	party.emit('foo', 3, 'Charlie');
	party.emit('bar');
	party.emit('baz');

	expect(count).toEqual({
		bar: [3, 3],
		baz: 3,
		foo: [1, 2],
	});

	expect(result).toEqual({
		a: '#1: Alice',
		b: '#2: Bob',
	});

	party.events.unsubscribe('bar', onBarOne);
	party.events.unsubscribe('bar');
	party.events.unsubscribe('bar');

	party.emit('foo', 4, 'Dave');
	party.emit('bar');
	party.emit('baz');

	expect(count).toEqual({
		bar: [3, 3],
		baz: 4,
		foo: [1, 2],
	});

	expect(result).toEqual({
		a: '#1: Alice',
		b: '#2: Bob',
	});

	party.clear();

	party.emit('foo', 5, 'Eve');
	party.emit('bar');
	party.emit('baz');

	expect(count).toEqual({
		bar: [3, 3],
		baz: 4,
		foo: [1, 2],
	});

	expect(result).toEqual({
		a: '#1: Alice',
		b: '#2: Bob',
	});

	expect(() => kalas([])).toThrow();
	expect(() => kalas([123 as never])).toThrow();
	expect(() => kalas(123 as never)).toThrow();
});
