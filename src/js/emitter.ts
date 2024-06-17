export type Emitter<Value> = {
	/**
	 * Is the emitter active?
	 */
	readonly active: boolean;
	/**
	 * The observable that can be subscribed to
	 */
	readonly observable: Observable<Value>;
	/**
	 * The current value
	 */
	readonly value: Value;
	/**
	 * Destroys the emitter
	 */
	destroy(): void;
	/**
	 * Emits a new value _(and optionally finishes the emitter)_
	 */
	emit(value: Value, finish?: boolean): void;
	/**
	 * Emits an error _(and optionally finishes the emitter)_
	 */
	error(error: Error, finish?: boolean): void;
	/**
	 * Finishes the emitter
	 */
	finish(): void;
};

export type Observable<Value> = {
	/**
	 * Subscribes to value changes
	 */
	subscribe(observer: Observer<Value>): Subscription;
	/**
	 * Subscribes to value changes
	 */
	subscribe(
		onNext: (value: Value) => void,
		onError?: (error: Error) => void,
		onComplete?: () => void,
	): Subscription;
};

export type Observer<Value> = {
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

export type Subscription = {
	/**
	 * Is the subscription closed?
	 */
	readonly closed: boolean;
	/**
	 * Unsubscribes from the observable
	 */
	unsubscribe(): void;
};

function createObserable<Value>(
	emitter: Emitter<Value>,
	observers: Map<Subscription, Observer<Value>>,
): Observable<Value> {
	const instance = Object.create({
		subscribe(first, second, third) {
			return createSubscription(
				emitter,
				observers,
				getObserver(first, second, third),
			);
		},
	} as Observable<Value>);

	return instance;
}

function createSubscription<Value>(
	emitter: Emitter<Value>,
	observers: Map<Subscription, Observer<Value>>,
	observer: Observer<Value>,
): Subscription {
	let closed = false;

	const instance = Object.create({
		unsubscribe() {
			if (!closed) {
				closed = true;

				observers.delete(instance);
			}
		},
	} as Subscription);

	Object.defineProperty(instance, 'closed', {
		get() {
			return closed || !emitter.active;
		},
	});

	observers.set(instance, observer);

	observer.next?.(emitter.value);

	return instance;
}

function getObserver<Value>(
	first: Observer<Value> | ((value: Value) => void),
	second?: (error: Error) => void,
	third?: () => void,
): Observer<Value> {
	let observer: Observer<Value>;

	if (typeof first === 'object') {
		observer = first;
	} else {
		observer = {
			error: second,
			next: first,
			complete: third,
		};
	}

	return observer;
}

/**
 * Creates a new emitter
 */
export function emitter<Value>(value: Value): Emitter<Value> {
	let active = true;
	let stored = value;

	function finish(emit: boolean): void {
		if (active) {
			active = false;

			for (const [subscription, observer] of observers) {
				if (emit) {
					observer.complete?.();
				}

				subscription.unsubscribe();
			}
		}
	}

	const observers = new Map<Subscription, Observer<Value>>();

	const instance = Object.create({
		destroy() {
			finish(false);
		},
		emit(value: Value, complete?: boolean) {
			if (active) {
				stored = value;

				for (const [, observer] of observers) {
					observer.next?.(value);
				}

				if (complete === true) {
					finish(true);
				}
			}
		},
		error(error: Error, complete?: boolean) {
			if (active) {
				for (const [, observer] of observers) {
					observer.error?.(error);
				}

				if (complete === true) {
					finish(true);
				}
			}
		},
		finish() {
			finish(true);
		},
	} as Emitter<Value>);

	const observable = createObserable<Value>(instance, observers);

	Object.defineProperties(instance, {
		active: {
			get() {
				return active;
			},
		},
		observable: {
			get() {
				return observable;
			},
		},
		value: {
			get() {
				return stored;
			},
		},
	});

	return instance;
}
