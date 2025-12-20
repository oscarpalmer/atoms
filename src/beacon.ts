import {noop} from './internal/function';

class Beacon<Value> {
	readonly #state: BeaconState<Value>;

	/**
	 * Is the beacon active?
	 */
	get active(): boolean {
		return this.#state.active;
	}

	/**
	 * The observable that can be subscribed to
	 */
	get observable(): Observable<Value> {
		return this.#state.observable;
	}

	/**
	 * The current value
	 */
	get value(): Value {
		return this.#state.value;
	}

	constructor(value: Value) {
		const observers = new Map<Subscription<Value>, Observer<Value>>();

		this.#state = {
			observers,
			value,
			active: true,
			observable: new Observable(this, observers),
		};
	}

	/**
	 * Destroy the beacon
	 */
	destroy(): void {
		finishBeacon(this.#state, false);
	}

	/**
	 * Emit a new value
	 * @param value Value to set and emit
	 * @param finish Finish the beacon after emitting? _(defaults to `false`)_
	 */
	emit(value: Value, finish?: boolean): void {
		this.#on('next', finish ?? false, value);
	}

	/**
	 * Emit an error
	 * @param error Error to emit
	 * @param finish Finish the beacon after emitting? _(defaults to `false`)_
	 */
	error(error: Error, finish?: boolean): void {
		this.#on('error', finish ?? false, error);
	}

	/**
	 * Finish the beacon
	 */
	finish(): void {
		finishBeacon(this.#state, true);
	}

	#on(type: keyof Observer<never>, finish: boolean, value: Error | Value): void {
		if (this.#state.active) {
			if (type === 'next') {
				this.#state.value = value as Value;
			}

			for (const [, observer] of this.#state.observers) {
				observer[type]?.(value as never);
			}

			if (finish === true) {
				finishBeacon(this.#state, true);
			}
		}
	}
}

type BeaconState<Value> = {
	active: boolean;
	observable: Observable<Value>;
	observers: Map<Subscription<Value>, Observer<Value>>;
	value: Value;
};

class Observable<Value> {
	readonly #state: ObservableState<Value>;

	constructor(emitter: Beacon<Value>, observers: Map<Subscription<Value>, Observer<Value>>) {
		this.#state = {
			observers,
			beacon: emitter,
			closed: false,
		};
	}

	/**
	 * Destroy the observable
	 */
	destroy(): void {
		this.#state.closed = true;
	}

	/**
	 * Subscribe to value changes
	 * @param onNext Callback for when the observable receives a new value
	 * @param onError Callback for when the observable receives an error
	 * @param onComplete Callback for when the observable is completed
	 * @returns Subscription to the observable
	 */
	subscribe(
		onNext: (value: Value) => void,
		onError?: (error: Error) => void,
		onComplete?: () => void,
	): Subscription<Value>;

	/**
	 * Subscribe to value changes
	 * @param observer Observer for changes
	 * @returns Subscription to the observable
	 */
	subscribe(observer: Observer<Value>): Subscription<Value>;

	subscribe(
		first: Observer<Value> | ((value: Value) => void),
		second?: (error: Error) => void,
		third?: () => void,
	): Subscription<Value> {
		if (this.#state.closed) {
			throw new Error('Cannot subscribe to a destroyed observable');
		}

		const observer = getObserver(first, second, third);
		const instance = new Subscription(this.#state);

		this.#state.observers.set(instance, observer);

		observer.next?.(this.#state.beacon.value);

		return instance;
	}
}

type ObservableState<Value> = {
	beacon: Beacon<Value>;
	closed: boolean;
	observers: Map<Subscription<Value>, Observer<Value>>;
};

type Observer<Value> = {
	/**
	 * Callback for when the observable is completed
	 */
	complete?: () => void;
	/**
	 * Callback for when the observable receives an error
	 */
	error?: (error: Error) => void;
	/**
	 * Callback for when the observable receives a new value
	 */
	next?: (value: Value) => void;
};

class Subscription<Value> {
	readonly #state: SubscriptionState<Value>;

	constructor(state: ObservableState<Value>) {
		this.#state = {
			...state,
			closed: false,
		};
	}

	/**
	 * Is the subscription closed?
	 */
	get closed(): boolean {
		return this.#state.closed || !this.#state.beacon.active;
	}

	/**
	 * Destroy the subscription
	 */
	destroy(): void {
		if (!this.#state.closed) {
			this.unsubscribe();
		}
	}

	/**
	 * Unsubscribe from its observable
	 */
	unsubscribe(): void {
		if (!this.#state.closed) {
			this.#state.closed = true;

			this.#state.observers.delete(this);
		}
	}
}

type SubscriptionState<Value> = {
	closed: boolean;
	beacon: Beacon<Value>;
	observers: Map<Subscription<Value>, Observer<Value>>;
};

/**
 * Create a new beacon
 * @param value Initial value
 * @returns Beacon instance
 */
export function beacon<Value>(value: Value): Beacon<Value> {
	return new Beacon(value);
}

function finishBeacon<Value>(state: BeaconState<Value>, emit: boolean): void {
	if (state.active) {
		state.active = false;

		const entries = [...state.observers.entries()];
		const {length} = entries;

		for (let index = 0; index < length; index += 1) {
			const [subscription, observer] = entries[index];

			if (emit) {
				observer.complete?.();
			}

			subscription.destroy();
		}

		state.observable?.destroy();

		state.observers.clear();
	}
}

function getFunction<Callback>(value: Callback, defaultValue: Callback): Callback {
	return typeof value === 'function' ? value : defaultValue;
}

function getObserver<Value>(
	first: Observer<Value> | ((value: Value) => void),
	second?: (error: Error) => void,
	third?: () => void,
): Observer<Value> {
	let observer: Observer<Value> = {
		next: noop,
	};

	if (typeof first === 'function') {
		observer = {
			error: getFunction(second, noop),
			next: getFunction(first, noop),
			complete: getFunction(third, noop),
		};
	} else if (typeof first === 'object') {
		observer.complete = getFunction(first?.complete, noop);
		observer.error = getFunction(first?.error, noop);
		observer.next = getFunction(first?.next, noop);
	}

	return observer;
}

export type {Beacon, Observable, Observer, Subscription};
