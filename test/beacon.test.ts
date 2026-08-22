import {expect, test} from 'vitest';
import {beacon, equal, isBeacon, isObservable, isSubscription} from '../src';
import {isFixture} from './.fixtures/is.fixture';

const {length, values} = isFixture;

test('beacon', () =>
	new Promise<void>(done => {
		const value = beacon(0);

		expect(isBeacon(value)).toBe(true);
		expect(isObservable(value)).toBe(false);
		expect(isSubscription(value)).toBe(false);

		for (let index = 0; index < length; index += 1) {
			const value = values[index];

			expect(isBeacon(value)).toBe(false);
			expect(isObservable(value)).toBe(false);
			expect(isSubscription(value)).toBe(false);
		}

		expect(value.active).toBe(true);
		expect(value.closed).toBe(false);
		expect(value.observable).toBeDefined();
		expect(value.value).toBe(0);

		value.close();

		setTimeout(() => {
			expect(value.active).toBe(false);
			expect(value.closed).toBe(true);

			expect(() => value.observable).toThrow('Cannot retrieve observable from a closed beacon');

			setTimeout(done);
		});
	}));

test('observable + subscription', () =>
	new Promise<void>(done => {
		const first = beacon(0);
		const second = beacon(0);
		const third = beacon(0);

		const results = {
			first: {
				complete: false,
				count: 0,
				error: null,
			},
			second: {
				complete: false,
				count: 0,
				error: null,
			},
		};

		const one = first.observable.subscribe({
			complete() {
				results.first.complete = true;
			},
			next() {
				results.first.count += 1;
			},
			error(error) {
				results.first.error = error as never;
			},
		});

		const two = second.observable.subscribe(
			() => {
				results.second.count += 1;
			},
			error => {
				results.second.error = error as never;
			},
			() => {
				results.second.complete = true;
			},
		);

		const thirdObservable = third.observable;

		expect(isObservable(thirdObservable)).toBe(true);

		let three = thirdObservable.subscribe({});

		expect(isSubscription(one)).toBe(true);
		expect(isSubscription(two)).toBe(true);
		expect(isSubscription(three)).toBe(true);

		first.observable.subscribe('blah' as never);

		expect(first.active).toBe(true);
		expect(first.closed).toBe(false);
		expect(second.active).toBe(true);
		expect(second.closed).toBe(false);
		expect(third.active).toBe(true);
		expect(third.closed).toBe(false);

		expect(one.active).toBe(true);
		expect(one.closed).toBe(false);
		expect(two.active).toBe(true);
		expect(two.closed).toBe(false);
		expect(three.active).toBe(true);
		expect(three.closed).toBe(false);

		expect(thirdObservable.active).toBe(true);
		expect(thirdObservable.closed).toBe(false);

		expect(results.first.complete).toBe(false);
		expect(results.first.count).toBe(1);
		expect(results.first.error).toBe(null);

		expect(results.second.complete).toBe(false);
		expect(results.second.count).toBe(1);
		expect(results.second.error).toBe(null);

		first.emit(1);
		second.error(new Error('test'));

		setTimeout(() => {
			expect(results.first.complete).toBe(false);
			expect(results.first.count).toBe(2);
			expect(results.first.error).toBe(null);

			expect(results.second.complete).toBe(false);
			expect(results.second.count).toBe(1);
			expect(results.second.error).toBeInstanceOf(Error);

			first.emit(2, true);
			second.error(new Error('test'), true);

			three.unsubscribe();
			three.unsubscribe();
			three.close();
		}, 25);

		setTimeout(() => {
			expect(first.active).toBe(false);
			expect(first.closed).toBe(true);
			expect(second.active).toBe(false);
			expect(second.closed).toBe(true);

			expect(() => first.observable).toThrow('Cannot retrieve observable from a closed beacon');
			expect(() => second.observable).toThrow('Cannot retrieve observable from a closed beacon');

			expect(one.active).toBe(false);
			expect(one.closed).toBe(true);
			expect(two.active).toBe(false);
			expect(two.closed).toBe(true);
			expect(three.active).toBe(false);
			expect(three.closed).toBe(true);

			expect(results.first.complete).toBe(true);
			expect(results.first.count).toBe(3);
			expect(results.first.error).toBe(null);

			expect(results.second.complete).toBe(true);
			expect(results.second.count).toBe(1);
			expect(results.second.error).toBeInstanceOf(Error);
		}, 50);

		setTimeout(() => {
			three = thirdObservable.subscribe({});

			third.close();
		}, 75);

		setTimeout(() => {
			expect(third.active).toBe(false);
			expect(third.closed).toBe(true);
			expect(three.active).toBe(false);
			expect(three.closed).toBe(true);

			third.emit(1);
			third.error(new Error('test'));
			third.finish();

			expect(thirdObservable.active).toBe(false);
			expect(thirdObservable.closed).toBe(true);

			expect(() => thirdObservable.subscribe({})).toThrow(
				'Cannot subscribe to a closed observable',
			);

			setTimeout(done, 25);
		}, 100);
	}));

test('options', () => {
	const counts = {
		first: 0,
		second: 0,
	};

	const beacons = {
		first: beacon<number[]>([], {
			equal: 'blah' as never,
		}),
		second: beacon<number[]>([], {
			equal,
		}),
	};

	beacons.first.observable.subscribe(() => {
		counts.first += 1;
	});

	beacons.second.observable.subscribe(() => {
		counts.second += 1;
	});

	expect(counts.first).toBe(1);
	expect(counts.second).toBe(1);

	beacons.first.emit([1, 2, 3]);
	beacons.second.emit([1, 2, 3]);

	expect(counts.first).toBe(2);
	expect(counts.second).toBe(2);

	beacons.first.emit([1, 2, 3]);
	beacons.second.emit([1, 2, 3]);

	expect(counts.first).toBe(3);
	expect(counts.second).toBe(2);
});
