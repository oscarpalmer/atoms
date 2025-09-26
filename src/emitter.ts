import {noop} from './internal/function';

class Emitter<Value> {
	readonly #state: EmitterState<Value>;

	/**
	 * Is the emitter active?
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
	 * Destroy the emitter
	 */
	destroy(): void {
		finishEmitter(this.#state, false);
	}

	/**
	 * Emit a new value
	 * @param value Value to set and emit
	 * @param finish Finish the emitter after emitting? _(defaults to `false`)_
	 */
	emit(value: Value, finish?: boolean): void {
		this.#on('next', finish ?? false, value);
	}

	/**
	 * Emit an error
	 * @param error Error to emit
	 * @param finish Finish the emitter after emitting? _(defaults to `false`)_
	 */
	error(error: Error, finish?: boolean): void {
		this.#on('error', finish ?? false, error);
	}

	/**
	 * Finish the emitter
	 */
	finish(): void {
		finishEmitter(this.#state, true);
	}

	#on(
		type: keyof Observer<never>,
		finish: boolean,
		value: Error | Value,
	): void {
		if (this.#state.active) {
			if (type === 'next') {
				this.#state.value = value as Value;
			}

			for (const [, observer] of this.#state.observers) {
				observer[type]?.(value as never);
			}

			if (finish === true) {
				finishEmitter(this.#state, true);
			}
		}
	}
}

type EmitterState<Value> = {
	active: boolean;
	observable: Observable<Value>;
	observers: Map<Subscription<Value>, Observer<Value>>;
	value: Value;
};

class Observable<Value> {
	readonly #state: ObservableState<Value>;

	constructor(
		emitter: Emitter<Value>,
		observers: Map<Subscription<Value>, Observer<Value>>,
	) {
		this.#state = {
			emitter,
			observers,
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
	 * @param observer Observer for changes
	 * @returns Subscription to the observable
	 */
	subscribe(observer: Observer<Value>): Subscription<Value>;

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

		observer.next?.(this.#state.emitter.value);

		return instance;
	}
}

type ObservableState<Value> = {
	closed: boolean;
	emitter: Emitter<Value>;
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
		return this.#state.closed || !this.#state.emitter.active;
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
	emitter: Emitter<Value>;
	observers: Map<Subscription<Value>, Observer<Value>>;
};

/**
 * Create a new emitter
 * @param value Initial value
 * @returns Emitter instance
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

		state.observable?.destroy();

		state.observers.clear();
	}
}

function getFunction<Callback>(
	value: Callback,
	defaultValue: Callback,
): Callback {
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

export type {Emitter, Observable, Observer, Subscription};
