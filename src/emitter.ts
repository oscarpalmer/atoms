import {noop} from './function';

class Emitter<Value> {
	private declare readonly state: EmitterState<Value>;

	/**
	 * Is the emitter active?
	 */
	get active() {
		return this.state.active;
	}

	/**
	 * The observable that can be subscribed to
	 */
	get observable() {
		return this.state.observable;
	}

	/**
	 * The current value
	 */
	get value() {
		return this.state.value;
	}

	constructor(value: Value) {
		const observers = new Map<Subscription<Value>, Observer<Value>>();

		this.state = {
			observers,
			value,
			active: true,
			observable: new Observable(this, observers),
		};
	}

	/**
	 * Destroy the emitter
	 */
	destroy(): void {
		finishEmitter(this.state, false);
	}

	/**
	 * Emit a new value _(and optionally finishes the emitter)_
	 */
	emit(value: Value, finish?: boolean): void {
		if (this.state.active) {
			this.state.value = value;

			for (const [, observer] of this.state.observers) {
				observer.next?.(value);
			}

			if (finish === true) {
				finishEmitter(this.state, true);
			}
		}
	}

	/**
	 * Emit an error _(and optionally finishes the emitter)_
	 */
	error(error: Error, finish?: boolean): void {
		if (this.state.active) {
			for (const [, observer] of this.state.observers) {
				observer.error?.(error);
			}

			if (finish === true) {
				finishEmitter(this.state, true);
			}
		}
	}

	/**
	 * Finish the emitter
	 */
	finish(): void {
		finishEmitter(this.state, true);
	}
}

type EmitterState<Value> = {
	active: boolean;
	observable: Observable<Value>;
	observers: Map<Subscription<Value>, Observer<Value>>;
	value: Value;
};

class Observable<Value> {
	private declare readonly state: ObservableState<Value>;

	constructor(
		emitter: Emitter<Value>,
		observers: Map<Subscription<Value>, Observer<Value>>,
	) {
		this.state = {
			emitter,
			observers,
		};
	}

	/**
	 * Subscribe to value changes
	 */
	subscribe(observer: Observer<Value>): Subscription<Value>;

	/**
	 * Subscribe to value changes
	 */
	subscribe(
		onNext: (value: Value) => void,
		onError?: (error: Error) => void,
		onComplete?: () => void,
	): Subscription<Value>;

	subscribe(
		first: Observer<Value> | ((value: Value) => void),
		second?: (error: Error) => void,
		third?: () => void,
	): Subscription<Value> {
		const observer = getObserver(first, second, third);
		const instance = new Subscription(this.state);

		this.state.observers.set(instance, observer);

		observer.next?.(this.state.emitter.value);

		return instance;
	}
}

type ObservableState<Value> = {
	emitter: Emitter<Value>;
	observers: Map<Subscription<Value>, Observer<Value>>;
};

type Observer<Value> = {
	/**
	 * Callback for when the observable is complete
	 */
	complete?: () => void;
	/**
	 * Callback for when the observable has an error
	 */
	error?: (error: Error) => void;
	/**
	 * Callback for when the observable has a new value
	 */
	next?: (value: Value) => void;
};

class Subscription<Value> {
	private declare readonly state: SubscriptionState<Value>;

	constructor(state: ObservableState<Value>) {
		this.state = {
			...state,
			closed: false,
		};
	}

	/**
	 * Is the subscription closed?
	 */
	get closed() {
		return this.state.closed || !(this.state.emitter?.active ?? false);
	}

	/**
	 * Destroy the subscription
	 */
	destroy(): void {
		this.unsubscribe();

		this.state.emitter = undefined as never;
		this.state.observers = undefined as never;
	}

	/**
	 * Unsubscribe from its observable
	 */
	unsubscribe(): void {
		if (!this.state.closed) {
			this.state.closed = true;

			this.state.observers?.delete(this);
		}
	}
}

type SubscriptionState<Value> = {
	closed: boolean;
	emitter: Emitter<Value>;
	observers: Map<Subscription<Value>, Observer<Value>>;
};

const properties: Array<keyof Observer<never>> = ['complete', 'error', 'next'];

/**
 * Create a new emitter
 */
export function emitter<Value>(value: Value): Emitter<Value> {
	return new Emitter(value);
}

function finishEmitter<Value>(state: EmitterState<Value>, emit: boolean): void {
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

		state.observers.clear();

		state.observable = undefined as never;
		state.observers = undefined as never;
		state.value = undefined as never;
	}
}

function getObserver<Value>(
	first: Observer<Value> | ((value: Value) => void),
	second?: (error: Error) => void,
	third?: () => void,
): Observer<Value> {
	let observer: Observer<Value> = {
		next: noop,
	};

	if (typeof first === 'object') {
		observer =
			first !== null &&
			properties.every(property => {
				const value = first[property];

				return value == null || typeof value === 'function';
			})
				? first
				: observer;
	} else if (typeof first === 'function') {
		observer = {
			error: typeof second === 'function' ? second : noop,
			next: first,
			complete: typeof third === 'function' ? third : undefined,
		};
	}

	return observer;
}

export type {Emitter, Observable, Observer, Subscription};
