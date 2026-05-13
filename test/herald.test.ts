import {expect, test} from 'vitest';
import {herald} from '../src';

type Events = {
	foo: (id: number, name: string) => void;
	bar: () => void;
	baz: () => void;
};

test('', () => {
	const announcer = herald<Events>(['bar', 'baz', 'foo']);
	const {events} = announcer;

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

	const unsubscribeFooOne = events.subscribe('foo', onFooA);

	const unsubscribeNoopOne = events.subscribe('foo', 123 as never);
	const unsubscribeNoopTwo = events.subscribe('xyz' as never, onBarOne as never);

	expect(typeof unsubscribeNoopOne).toBe('function');
	expect(typeof unsubscribeNoopTwo).toBe('function');

	events.subscribe('foo', onFooB);
	events.subscribe('bar', onBarOne);
	events.subscribe('bar', onBarTwo);

	announcer.events.subscribe('baz', () => {
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

	announcer.emit('foo', 1, 'Alice');
	announcer.emit('bar');
	announcer.emit('baz');

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

	announcer.emit('foo', 2, 'Bob');
	announcer.emit('bar');
	announcer.emit('baz');

	expect(count).toEqual({
		bar: [2, 2],
		baz: 2,
		foo: [1, 2],
	});

	expect(result).toEqual({
		a: '#1: Alice',
		b: '#2: Bob',
	});

	events.unsubscribe('foo', onFooB);

	events.unsubscribe('foo', 123 as never);
	events.unsubscribe('xyz' as never, onBarOne as never);

	announcer.emit('foo', 3, 'Charlie');
	announcer.emit('bar');
	announcer.emit('baz');

	expect(count).toEqual({
		bar: [3, 3],
		baz: 3,
		foo: [1, 2],
	});

	expect(result).toEqual({
		a: '#1: Alice',
		b: '#2: Bob',
	});

	events.unsubscribe('bar', onBarOne);
	events.unsubscribe('bar');
	events.unsubscribe('bar');

	announcer.emit('foo', 4, 'Dave');
	announcer.emit('bar');
	announcer.emit('baz');

	expect(count).toEqual({
		bar: [3, 3],
		baz: 4,
		foo: [1, 2],
	});

	expect(result).toEqual({
		a: '#1: Alice',
		b: '#2: Bob',
	});

	announcer.clear();

	announcer.emit('foo', 5, 'Eve');
	announcer.emit('bar');
	announcer.emit('baz');

	expect(count).toEqual({
		bar: [3, 3],
		baz: 4,
		foo: [1, 2],
	});

	expect(result).toEqual({
		a: '#1: Alice',
		b: '#2: Bob',
	});

	expect(() => herald([])).toThrow();
	expect(() => herald([123 as never])).toThrow();
	expect(() => herald(123 as never)).toThrow();
});
