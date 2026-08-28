import {expect, test} from 'vitest';
import {beacon, equal, isBeacon, isBeaconSubscription, isObservable, isSubscription} from '../src';
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
		expect(value.observable).toBeDefined();
		expect(value.value).toBe(0);

		value.deactivate();

		setTimeout(() => {
			expect(value.active).toBe(false);

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
				error: undefined,
			},
			second: {
				complete: false,
				count: 0,
				error: undefined,
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
		expect(isSubscription(first)).toBe(false);
		expect(isSubscription(first.observable)).toBe(false);

		expect(isBeaconSubscription(one)).toBe(true);
		expect(isBeaconSubscription(two)).toBe(true);
		expect(isBeaconSubscription(three)).toBe(true);
		expect(isBeaconSubscription(first)).toBe(false);
		expect(isBeaconSubscription(first.observable)).toBe(false);

		first.observable.subscribe('blah' as never);

		expect(first.active).toBe(true);
		expect(second.active).toBe(true);
		expect(third.active).toBe(true);

		expect(one.active).toBe(true);
		expect(two.active).toBe(true);
		expect(three.active).toBe(true);

		expect(thirdObservable.active).toBe(true);

		expect(results.first.complete).toBe(false);
		expect(results.first.count).toBe(1);
		expect(results.first.error).toBe(undefined);

		expect(results.second.complete).toBe(false);
		expect(results.second.count).toBe(1);
		expect(results.second.error).toBe(undefined);

		first.emit(1);
		second.error(new Error('test'));

		setTimeout(() => {
			expect(results.first.complete).toBe(false);
			expect(results.first.count).toBe(2);
			expect(results.first.error).toBe(undefined);

			expect(results.second.complete).toBe(false);
			expect(results.second.count).toBe(1);
			expect(results.second.error).toBeInstanceOf(Error);

			first.emit(2, true);
			second.error(new Error('test'), true);

			three.unsubscribe();
			three.unsubscribe();
			three.unsubscribe();
		}, 25);

		setTimeout(() => {
			expect(first.active).toBe(false);
			expect(second.active).toBe(false);

			expect(() => first.observable).toThrow('Cannot retrieve observable from a closed beacon');
			expect(() => second.observable).toThrow('Cannot retrieve observable from a closed beacon');

			expect(one.active).toBe(false);
			expect(two.active).toBe(false);
			expect(three.active).toBe(false);

			expect(results.first.complete).toBe(true);
			expect(results.first.count).toBe(3);
			expect(results.first.error).toBe(undefined);

			expect(results.second.complete).toBe(true);
			expect(results.second.count).toBe(1);
			expect(results.second.error).toBeInstanceOf(Error);
		}, 50);

		setTimeout(() => {
			three = thirdObservable.subscribe({});

			third.deactivate();
		}, 75);

		setTimeout(() => {
			expect(third.active).toBe(false);
			expect(three.active).toBe(false);

			third.emit(1);
			third.error(new Error('test'));
			third.finish();

			expect(thirdObservable.active).toBe(false);

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
