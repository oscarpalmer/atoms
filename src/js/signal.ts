type Effect = () => void;
type Value = Computed<unknown> | Signal<unknown>;

class Computed<T> {
	get value(): T {
		return _getter(this);
	}

	constructor(callback: () => T) {
		effect(() => {
			_setter(this, callback());
		});
	}
}

class Signal<T> {
	get value(): T {
		return _getter(this);
	}

	set value(value: T) {
		_setter(this, value);
	}

	constructor(value: T) {
		this.value = value;
	}
}

const effects = new WeakMap<Value, Set<Effect>>();

const frames = new WeakMap<Value, number>();

const running: Effect[] = [];

const values = new WeakMap<Value, unknown>();

function _getter<T>(instance: Value): T {
	const last = running[running.length - 1];

	if (last !== undefined) {
		let instanceEffects = effects.get(instance);

		if (instanceEffects === undefined) {
			instanceEffects = new Set();

			effects.set(instance, instanceEffects);
		}

		instanceEffects.add(last);
	}

	return values.get(instance) as T;
}

function _setter<T>(instance: Value, value: T): void {
	if (Object.is(value, values.get(instance))) {
		return;
	}

	values.set(instance, value);

	cancelAnimationFrame(frames.get(instance) as never);

	frames.set(
		instance,
		requestAnimationFrame(() => {
			const instanceEffects = effects.get(instance) ?? new Set();

			for (const effect of instanceEffects) {
				effect();
			}

			frames.delete(instance);
		}),
	);
}

export function computed<T>(callback: () => T): Computed<T> {
	return new Computed(callback);
}

export function effect(callback: Effect): void {
	running.push(callback);

	callback();

	running.splice(running.indexOf(callback), 1);
}

export function signal<T>(value: T): Signal<T> {
	return new Signal(value);
}
