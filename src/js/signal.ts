type InternalEffect = {
	_callback: () => void;
	_values: Set<InternalValue>;
};

type InternalValue = {
	_active: boolean;
	_effects: Set<InternalEffect>;
	_frame: number | undefined;
	_value: unknown;
};

abstract class Value<T = unknown> {
	protected _active = true;
	protected _effects = new Set<InternalEffect>();
	protected _frame: number | undefined;
	protected declare _value: T;

	/**
	 * The current value
	 */
	abstract get value(): T;

	/**
	 * The current value, returned without triggering computations or effects
	 */
	peek(): T {
		return this._value;
	}

	/**
	 * Allows reactivity for value, if it was stopped
	 */
	abstract run(): void;

	/**
	 * Stops reactivity for value, if it's running
	 */
	abstract stop(): void;

	/**
	 * Returns the JSON representation of the value
	 */
	toJSON(): T {
		return this.value;
	}

	/**
	 * Returns the string representation of the value
	 */
	toString(): string {
		return String(this.value);
	}
}

/**
 * A computed, reactive value
 */
class Computed<T> extends Value<T> {
	private readonly _effect: Effect;

	/**
	 * @inheritdoc
	 */
	get value(): T {
		return _getter(this as never) as T;
	}

	constructor(callback: () => T) {
		super();

		this._effect = effect(() => {
			_setter(this as never, callback(), false);
		});
	}

	/**
	 * @inheritdoc
	 */
	run(): void {
		this._effect.run();
	}

	/**
	 * @inheritdoc
	 */
	stop(): void {
		this._effect.stop();
	}
}

/**
 * A reactive effect
 */
class Effect {
	private _active = false;
	private readonly _values = new Set<InternalValue>();

	constructor(private readonly _callback: () => void) {
		this.run();
	}

	/**
	 * Starts and runs the effect, if it was stopped
	 */
	run(): void {
		if (this._active) {
			return;
		}

		this._active = true;

		const index = running.push(this as never) - 1;

		this._callback();

		running.splice(index, 1);
	}

	/**
	 * Stops the effect, if it's running
	 */
	stop(): void {
		if (!this._active) {
			return;
		}

		this._active = false;

		for (const value of this._values) {
			value._effects.delete(this as never);
		}

		this._values.clear();
	}
}

/**
 * A reactive value
 */
class Signal<T> extends Value<T> {
	/**
	 * @inheritdoc
	 */
	get value(): T {
		return _getter(this as never) as T;
	}

	/**
	 * Sets the value
	 */
	set value(value: T) {
		_setter(this as never, value, false);
	}

	constructor(protected readonly _value: T) {
		super();
	}

	/**
	 * @inheritdoc
	 */
	run(): void {
		if (this._active) {
			return;
		}

		this._active = true;

		_setter(this as never, this._value, true);
	}

	/**
	 * @inheritdoc
	 */
	stop(): void {
		this._active = false;
	}
}

const running: InternalEffect[] = [];

function _getter(instance: InternalValue): unknown {
	const last = running[running.length - 1];

	if (last !== undefined) {
		instance._effects.add(last);
		last._values.add(instance);
	}

	return instance._value;
}

function _setter<T>(instance: InternalValue, value: T, run: boolean): void {
	if (!run && Object.is(value, instance._value)) {
		return;
	}

	instance._value = value;

	cancelAnimationFrame(instance._frame as never);

	if (!instance._active) {
		return;
	}

	instance._frame = requestAnimationFrame(() => {
		for (const effect of instance._effects) {
			effect._callback();
		}

		instance._frame = undefined;
	});
}

/**
 * Creates a computed, reactive value
 */
export function computed<T>(callback: () => T): Computed<T> {
	return new Computed(callback);
}

/**
 * Creates a reactive effect
 */
export function effect(callback: () => void): Effect {
	return new Effect(callback);
}

/**
 * Creates a reactive value
 */
export function signal<T>(value: T): Signal<T> {
	return new Signal(value);
}
