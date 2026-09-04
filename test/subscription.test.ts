import {expect, test} from 'vitest';
import {isSubscriptions, isSubscription, subscriptions} from '../src';

test('', () => {
	const simple = subscriptions({keys: 123 as never});
	const keyed = subscriptions({keys: true});
	const specific = subscriptions({keys: new Set(['a', 'b'])});
	const defaulted = subscriptions();

	expect(isSubscriptions(simple)).toBe(true);
	expect(isSubscriptions(keyed)).toBe(true);
	expect(isSubscriptions(specific)).toBe(true);
	expect(isSubscriptions(defaulted)).toBe(true);

	let active = true;

	const simpleOne = simple.create({
		isActive: 123 as never,
		key: [1, 2, 3] as never,
		signal: 123 as never,
		value: 'simpleOne',
	});

	expect(() =>
		simple.create({
			key: 'two',
			value: 'simpleTwo',
		}),
	).toThrow();

	const keyedOne = keyed.create({
		isActive: () => active,
		key: 'one',
		value: 'keyedOne',
	});

	const specificOne = specific.create({
		key: 'a',
		value: 'specificOne',
	});

	expect(isSubscription(simpleOne[0])).toBe(true);
	expect(isSubscription(keyedOne[0])).toBe(true);
	expect(isSubscription(specificOne[0])).toBe(true);

	expect([simpleOne[1], keyedOne[1], specificOne[1]]).toEqual([false, false, false]);

	expect([simpleOne[0].active, keyedOne[0].active, specificOne[0].active]).toEqual([
		true,
		true,
		true,
	]);

	expect(() => specific.create({key: 'c', value: 'specificTwo'})).toThrow();
	expect(() => specific.create({key: 'c'} as never)).toThrow();
	expect(() => specific.create(123 as never)).toThrow();

	expect(simple.items.any.size).toBe(1);
	expect(simple.items.keyed?.size).toBeUndefined();

	expect(simple.values.from.any.size).toBe(1);
	expect(simple.values.from.keyed?.size).toBeUndefined();
	expect(simple.values.to.any.size).toBe(1);
	expect(simple.values.to.keyed?.size).toBeUndefined();

	expect(keyed.items.any.size).toBe(0);
	expect(keyed.items.keyed?.size).toBe(1);

	expect(keyed.values.from.any.size).toBe(0);
	expect(keyed.values.from.keyed?.size).toBe(1);
	expect(keyed.values.to.any.size).toBe(0);
	expect(keyed.values.to.keyed?.size).toBe(1);

	expect(specific.items.any.size).toBe(0);
	expect(specific.items.keyed?.size).toBe(1);

	expect(specific.values.from.any.size).toBe(0);
	expect(specific.values.from.keyed?.size).toBe(1);
	expect(specific.values.to.any.size).toBe(0);
	expect(specific.values.to.keyed?.size).toBe(1);

	const simpleOneDuplicate = simple.create({
		value: 'simpleOne',
	});

	expect(simpleOneDuplicate[1]).toBe(true);
	expect(simpleOneDuplicate[0]).toBe(simpleOne[0]);

	active = false;

	expect([simpleOne[0].active, keyedOne[0].active, specificOne[0].active]).toEqual([
		true,
		false,
		true,
	]);

	keyedOne[0].unsubscribe();
	keyedOne[0].unsubscribe();

	simple.clear();
	keyed.clear();
	specific.clear();

	expect(simple.items.any.size).toBe(0);
	expect(keyed.items.keyed?.size).toBe(0);
	expect(specific.items.keyed?.size).toBe(0);
});
