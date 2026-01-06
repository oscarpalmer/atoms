import {expect, test} from 'vitest';
import {logger} from '../src/logger';
import {noop} from '../src/internal/function';

test('log', () => {
	logger.log('test');

	expect(logger.enabled).toBe(true);

	logger.debug('debug');
	logger.dir({test: 'dir'});
	logger.error('error');
	logger.info('info');
	logger.log('log');
	logger.table([{test: 'table'}]);
	logger.trace('trace');
	logger.warn('warn');

	logger.enabled = false;

	expect(logger.enabled).toBe(false);

	expect(logger.debug).toBeTypeOf('function');
	expect(logger.dir).toBeTypeOf('function');
	expect(logger.error).toBeTypeOf('function');
	expect(logger.info).toBeTypeOf('function');
	expect(logger.log).toBeTypeOf('function');
	expect(logger.table).toBeTypeOf('function');
	expect(logger.trace).toBeTypeOf('function');
	expect(logger.warn).toBeTypeOf('function');

	logger.enabled = 123 as never;

	expect(logger.enabled).toBe(false);

	logger.enabled = true;

	expect(logger.enabled).toBe(true);

	logger.enabled = 123 as never;

	expect(logger.enabled).toBe(true);
});

test('log.time', () => {
	logger.enabled = true;

	const one = logger.time('test');

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

	const two = logger.time('test');

	expect(two).toBeTypeOf('object');
	expect(two.active).toBe(true);
	expect(two.log).not.toBe(noop);

	logger.enabled = false;

	expect(two.active).toBe(false);
	expect(two.log).toBe(noop);
	expect(two.stop).toBe(noop);

	logger.enabled = true;

	expect(two.active).toBe(true);
	expect(two.log).not.toBe(noop);

	const stopper_3 = two.stop;
	const stopper_4 = two.stop;

	expect(stopper_3).not.toBe(noop);
	expect(stopper_4).toBe(noop);

	stopper_3();

	expect(two.active).toBe(false);
	expect(two.log).toBe(noop);

	logger.enabled = false;

	const three = logger.time('test');

	expect(three.active).toBe(false);
	expect(three.log).toBe(noop);
	expect(three.stop).toBe(noop);

	logger.enabled = true;

	expect(three.active).toBe(false);
	expect(three.log).toBe(noop);
	expect(three.stop).toBe(noop);
});
