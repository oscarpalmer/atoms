export type Emitter<Value> = {
	readonly active: boolean;
	readonly observable: Observable<Value>;
	readonly value: Value;
	destroy(): void;
	error(error: Error): void;
	finish(): void;
	next(value: Value): void;
};

export type Observable<Value> = {
	subscribe(observer: Observer<Value>): Subscription;
	subscribe(
		onNext: (value: Value) => void,
		onError?: (error: Error) => void,
		onComplete?: () => void,
	): Subscription;
};

export type Observer<Value> = {
	complete?: () => void;
	error?: (error: Error) => void;
	next?: (value: Value) => void;
};

export type Subscription = {
	closed: boolean;
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
		error(error: Error) {
			if (active) {
				for (const [, observer] of observers) {
					observer.error?.(error);
				}
			}
		},
		finish() {
			finish(true);
		},
		next(value: Value) {
			if (active) {
				stored = value;

				for (const [, observer] of observers) {
					observer.next?.(value);
				}
			}
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
