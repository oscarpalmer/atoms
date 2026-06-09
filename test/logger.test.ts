import {expect, test} from 'vitest';
import {Logger, noop} from '../src';

test('log', () => {
	Logger.log('test');

	expect(Logger.enabled).toBe(true);

	Logger.debug('debug');
	Logger.dir({test: 'dir'});
	Logger.error('error');
	Logger.info('info');
	Logger.log('log');
	Logger.table([{test: 'table'}]);
	Logger.trace('trace');
	Logger.warn('warn');

	Logger.enabled = false;

	expect(Logger.enabled).toBe(false);

	expect(Logger.debug).toBeTypeOf('function');
	expect(Logger.dir).toBeTypeOf('function');
	expect(Logger.error).toBeTypeOf('function');
	expect(Logger.info).toBeTypeOf('function');
	expect(Logger.log).toBeTypeOf('function');
	expect(Logger.table).toBeTypeOf('function');
	expect(Logger.trace).toBeTypeOf('function');
	expect(Logger.warn).toBeTypeOf('function');

	Logger.enabled = 123 as never;

	expect(Logger.enabled).toBe(false);

	Logger.enabled = true;

	expect(Logger.enabled).toBe(true);

	Logger.enabled = 123 as never;

	expect(Logger.enabled).toBe(true);
});

test('Logger.time', () => {
	Logger.enabled = true;

	const one = Logger.time('test');

	expect(one).toBeTypeOf('object');
	expect(one.active).toBe(true);
	expect(one.log).not.toBe(noop);

	one.log();

	const stopper_1 = one.stop;
	const stopper_2 = one.stop;

	expect(stopper_1).not.toBe(noop);
	expect(stopper_2).toBe(noop);

	stopper_1();

	expect(one.active).toBe(false);
	expect(one.log).toBe(noop);

	const two = Logger.time('test');

	expect(two).toBeTypeOf('object');
	expect(two.active).toBe(true);
	expect(two.log).not.toBe(noop);

	Logger.enabled = false;

	expect(two.active).toBe(false);
	expect(two.log).toBe(noop);
	expect(two.stop).toBe(noop);

	Logger.enabled = true;

	expect(two.active).toBe(true);
	expect(two.log).not.toBe(noop);

	const stopper_3 = two.stop;
	const stopper_4 = two.stop;

	expect(stopper_3).not.toBe(noop);
	expect(stopper_4).toBe(noop);

	stopper_3();

	expect(two.active).toBe(false);
	expect(two.log).toBe(noop);

	Logger.enabled = false;

	const three = Logger.time('test');

	expect(three.active).toBe(false);
	expect(three.log).toBe(noop);
	expect(three.stop).toBe(noop);

	Logger.enabled = true;

	expect(three.active).toBe(false);
	expect(three.log).toBe(noop);
	expect(three.stop).toBe(noop);
});
