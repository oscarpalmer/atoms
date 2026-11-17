import {expect, test} from 'vite-plus/test';
import {error, isError, isOk, isResult, ok, run} from '../../src';

test('error', () => {
	const basic = error('basic');

	expect(isError(basic)).toBe(true);
	expect(isOk(basic)).toBe(false);
	expect(isResult(basic)).toBe(true);
	expect(error.is(basic)).toBe(true);
	expect(ok.is(basic)).toBe(false);
	expect(basic.error).toBe('basic');
	expect(basic.ok).toBe(false);
	expect((basic as any).original).toBeUndefined();
	expect((basic as any).value).toBeUndefined();
});

test('error.and & ok.and', async () => {
	const e = error('failure');
	const v = ok('success');

	const next = ok(456);
	const nope = error('nope');

	const eAnd = e.and(123);
	const vAnd = v.and(123);

	expect(eAnd).toBe(e);
	expect(vAnd.ok && vAnd.value).toBe(123);

	expect(e.and(next)).toBe(e);
	expect(v.and(next)).toBe(next);
	expect(v.and(nope)).toBe(nope);

	let called = 0;

	const eCallback = e.and(() => {
		called += 1;

		return 789;
	});

	const vCallback = v.and(value => {
		called += 1;

		return `${value}!`;
	});

	expect(called).toBe(1);
	expect(eCallback).toBe(e);
	expect(vCallback.ok && vCallback.value).toBe('success!');

	expect(v.and(() => next)).toBe(next);
	expect(v.and(() => nope)).toBe(nope);

	const ePromise = e.and(Promise.resolve(123));
	const vPromise = v.and(Promise.resolve(123));

	expect(ePromise).toBe(e);
	expect(vPromise).toBeInstanceOf(Promise);

	const vPromised = await vPromise;

	expect(vPromised.ok && vPromised.value).toBe(123);

	const vAsync = await v.and(async value => `${value}?`);

	expect(vAsync.ok && vAsync.value).toBe('success?');

	expect(await v.and(Promise.resolve(next))).toBe(next);
	expect(await v.and(async () => nope)).toBe(nope);

	expect(e.and(Promise.reject(new Error('ignored')))).toBe(e);

	await expect(v.and(Promise.reject(new Error('rejected')))).rejects.toThrow('rejected');
});

test('error.isError & ok.isError', () => {
	const e = error('failure');
	const v = ok('success');

	expect(e.isError()).toBe(true);
	expect(v.isError()).toBe(false);

	expect(e.isError(value => value === 'failure')).toBe(true);
	expect(e.isError(value => value === 'success')).toBe(false);
	expect(v.isError(() => true)).toBe(false);
});

test('error.isOk & ok.isOk', () => {
	const e = error('failure');
	const v = ok('success');

	expect(e.isOk()).toBe(false);
	expect(v.isOk()).toBe(true);

	expect(v.isOk(value => value === 'success')).toBe(true);
	expect(v.isOk(value => value === 'failure')).toBe(false);
	expect(e.isOk(() => true)).toBe(false);
});

test('error.iterator & ok.iterator', async () => {
	const e = error('failure');
	const v = ok('success');

	const eIterator = e[Symbol.iterator]();
	const vIterator = v[Symbol.iterator]();

	const eFirst = eIterator.next();
	const eSecond = eIterator.next();
	const vFirst = vIterator.next();

	expect(eFirst.done).toBe(false);
	expect(eFirst.value).toBe(e);
	expect(eSecond.done).toBe(true);
	expect(eSecond.value).toBeUndefined();

	expect(vFirst.done).toBe(true);
	expect(vFirst.value).toBe('success');

	const eAsyncIterator = e[Symbol.asyncIterator]();
	const vAsyncIterator = ok(Promise.resolve('promised'))[Symbol.asyncIterator]();

	const eAsyncFirst = await eAsyncIterator.next();
	const eAsyncSecond = await eAsyncIterator.next();
	const vAsyncFirst = await vAsyncIterator.next();

	expect(eAsyncFirst.done).toBe(false);
	expect(eAsyncFirst.value).toBe(e);
	expect(eAsyncSecond.done).toBe(true);
	expect(eAsyncSecond.value).toBeUndefined();

	expect(vAsyncFirst.done).toBe(true);
	expect(vAsyncFirst.value).toBe('promised');

	expect(
		run(function* () {
			const value = yield* v;

			return `${value}!`;
		}),
	).toBe('success!');

	await expect(
		run.async(async function* () {
			const value = yield* ok(Promise.resolve('promised'));

			return `${value}!`;
		}),
	).resolves.toBe('promised!');
});

test('error.map & ok.map', async () => {
	const e = error('failure');
	const v = ok('success');

	let called = 0;

	const eMapped = e.map(() => {
		called += 1;

		return 123;
	});

	const vMapped = v.map(value => {
		called += 1;

		return value.length;
	});

	expect(called).toBe(1);
	expect(eMapped).toBe(e);
	expect(vMapped.ok && vMapped.value).toBe(7);

	const nope = error('nope');
	const nested = v.map(() => nope);

	expect(nested.ok && nested.value).toBe(nope);

	const plain = v.map(123 as never);

	expect(plain.ok && plain.value).toBe(123);

	const vPromise = v.map(async value => value.toUpperCase());

	expect(vPromise).toBeInstanceOf(Promise);

	const vPromised = await vPromise;

	expect(vPromised.ok && vPromised.value).toBe('SUCCESS');

	expect(e.map(async () => 123)).toBe(e);
	expect(e.map(Promise.reject(new Error('ignored')) as never)).toBe(e);

	await expect(
		v.map(async () => {
			throw new Error('rejected');
		}),
	).rejects.toThrow('rejected');
});

test('error.mapError & ok.mapError', async () => {
	const e = error('failure');
	const v = ok('success');

	let called = 0;

	const eMapped = e.mapError(value => {
		called += 1;

		return value.length;
	});

	const vMapped = v.mapError(() => {
		called += 1;

		return 123;
	});

	expect(called).toBe(1);
	expect(eMapped.ok).toBe(false);
	expect(eMapped.error).toBe(7);
	expect(vMapped).toBe(v);

	const next = ok('next');
	const nested = e.mapError(() => next);

	expect(nested.ok).toBe(false);
	expect(nested.error).toBe(next);

	const plain = e.mapError(123 as never);

	expect(plain.ok).toBe(false);
	expect(plain.error).toBe(123);

	const ePromise = e.mapError(async value => value.toUpperCase());

	expect(ePromise).toBeInstanceOf(Promise);

	const ePromised = await ePromise;

	expect(ePromised.ok).toBe(false);
	expect(ePromised.error).toBe('FAILURE');

	expect(v.mapError(async () => 123)).toBe(v);
	expect(v.mapError(Promise.reject(new Error('ignored')) as never)).toBe(v);

	await expect(
		e.mapError(async () => {
			throw new Error('rejected');
		}),
	).rejects.toThrow('rejected');
});

test('error.match & ok.match', async () => {
	const e = error('failure');
	const v = ok('success');

	const handler = {
		error(value: string) {
			return `${value}!`;
		},
		ok(value: string) {
			return `${value}?`;
		},
	};

	expect(e.match(handler)).toBe('failure!');
	expect(v.match(handler)).toBe('success?');

	expect(e.match(handler.ok, handler.error)).toBe('failure!');
	expect(v.match(handler.ok, handler.error)).toBe('success?');

	const eAsync = e.match(
		() => 0,
		async value => value.length,
	);

	const vAsync = v.match(
		async value => value.length,
		() => 0,
	);

	expect(eAsync).toBeInstanceOf(Promise);
	expect(vAsync).toBeInstanceOf(Promise);

	expect(await eAsync).toBe(7);
	expect(await vAsync).toBe(7);

	expect(() => e.match('blah' as never, 'blah' as never)).toThrow(TypeError);
	expect(() => v.match('blah' as never, 'blah' as never)).toThrow(TypeError);
});

test('error.or & ok.or', async () => {
	const e = error('failure');
	const v = ok('success');

	const next = ok(456);
	const nope = error('nope');

	const eOr = e.or(123);
	const vOr = v.or(123);

	expect(eOr.ok && eOr.value).toBe(123);
	expect(vOr).toBe(v);

	expect(e.or(next)).toBe(next);
	expect(e.or(nope)).toBe(nope);
	expect(v.or(next)).toBe(v);

	let called = 0;

	const eCallback = e.or(value => {
		called += 1;

		return `${value}!`;
	});

	const vCallback = v.or(() => {
		called += 1;

		return 789;
	});

	expect(called).toBe(1);
	expect(eCallback.ok && eCallback.value).toBe('failure!');
	expect(vCallback).toBe(v);

	expect(e.or(() => next)).toBe(next);
	expect(e.or(() => nope)).toBe(nope);

	const ePromise = e.or(Promise.resolve(123));
	const vPromise = v.or(Promise.resolve(123));

	expect(ePromise).toBeInstanceOf(Promise);
	expect(vPromise).toBe(v);

	const ePromised = await ePromise;

	expect(ePromised.ok && ePromised.value).toBe(123);

	const eAsync = await e.or(async value => `${value}?`);

	expect(eAsync.ok && eAsync.value).toBe('failure?');

	expect(await e.or(Promise.resolve(next))).toBe(next);
	expect(await e.or(async () => nope)).toBe(nope);

	expect(v.or(Promise.reject(new Error('ignored')))).toBe(v);

	await expect(e.or(Promise.reject(new Error('rejected')))).rejects.toThrow('rejected');
});

test('error.unwrap & ok.unwrap', () => {
	const e = error('failure');
	const v = ok('success');

	expect(v.unwrap()).toBe('success');
	expect(v.unwrap('fallback')).toBe('success');
	expect(v.unwrap(() => 'fallback')).toBe('success');

	expect(e.unwrap('fallback')).toBe('fallback');
	expect(e.unwrap(value => `${value}!`)).toBe('failure!');
	expect(e.unwrap(undefined)).toBeUndefined();

	expect(() => e.unwrap()).toThrow();

	const original = new Error('original');

	let thrown: unknown;

	try {
		e.unwrap();
	} catch (caught) {
		thrown = caught;
	}

	expect(thrown).toBeInstanceOf(Error);
	expect((thrown as Error).cause).toBe('failure');

	try {
		error(original).unwrap();
	} catch (caught) {
		thrown = caught;
	}

	expect(thrown).toBe(original);
});

test('ok', () => {
	const item = ok('success');

	expect(isOk(item)).toBe(true);
	expect(isError(item)).toBe(false);
	expect(isResult(item)).toBe(true);
	expect(ok.is(item)).toBe(true);
	expect(error.is(item)).toBe(false);
	expect(item.ok).toBe(true);
	expect(item.value).toBe('success');
});
