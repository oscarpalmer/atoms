import {queue} from './queue';

type InternalEffect = {
	_active: boolean;
	_callback: () => void;
	_reactives: Set<InternalReactive>;
};

type InternalReactive = {
	_active: boolean;
	_effects: Set<InternalEffect>;
	_value: unknown;
};

/**
 * The base class for reactive values
 */
abstract class Reactive<T = unknown> {
	protected _active = true;
	protected _effects = new Set<InternalEffect>();
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
class Computed<T> extends Reactive<T> {
	private readonly _effect: Effect;

	/**
	 * @inheritdoc
	 */
	get value(): T {
		return getValue(this as never) as T;
	}

	constructor(callback: () => T) {
		super();

		this._effect = effect(() => setValue(this as never, callback(), false));
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
	private readonly _reactives = new Set<InternalReactive>();

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

		const index = effects.push(this as never) - 1;

		this._callback();

		effects.splice(index, 1);
	}

	/**
	 * Stops the effect, if it's running
	 */
	stop(): void {
		if (!this._active) {
			return;
		}

		this._active = false;

		for (const value of this._reactives) {
			value._effects.delete(this as never);
		}

		this._reactives.clear();
	}
}

/**
 * A reactive value
 */
class Signal<T> extends Reactive<T> {
	/**
	 * @inheritdoc
	 */
	get value(): T {
		return getValue(this as never) as T;
	}

	/**
	 * Sets the value
	 */
	set value(value: T) {
		setValue(this as never, value, false);
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

		setValue(this as never, this._value, true);
	}

	/**
	 * @inheritdoc
	 */
	stop(): void {
		this._active = false;
	}
}

const effects: InternalEffect[] = [];

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

function getValue(reactive: InternalReactive): unknown {
	const effect = effects[effects.length - 1];

	if (effect !== undefined) {
		reactive._effects.add(effect);
		effect._reactives.add(reactive);
	}

	return reactive._value;
}

/**
 * Is the value a computed, reactive value?
 */
export function isComputed(value: unknown): value is Computed<unknown> {
	return value instanceof Computed;
}

/**
 * Is the value a reactive effect?
 */
export function isEffect(value: unknown): value is Effect {
	return value instanceof Effect;
}

/**
 * Is the value a reactive value?
 */
export function isReactive(value: unknown): value is Reactive<unknown> {
	return value instanceof Reactive;
}

/**
 * Is the value a reactive value?
 */
export function isSignal(value: unknown): value is Signal<unknown> {
	return value instanceof Signal;
}

function setValue<T>(reactive: InternalReactive, value: T, run: boolean): void {
	if (!run && Object.is(value, reactive._value)) {
		return;
	}

	reactive._value = value;

	if (reactive._active) {
		for (const effect of reactive._effects) {
			queue(effect._callback);
		}
	}
}

/**
 * Creates a reactive value
 */
export function signal<T>(value: T): Signal<T> {
	return new Signal(value);
}

export type {Computed, Effect, Reactive, Signal};
