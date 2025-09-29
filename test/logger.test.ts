/** biome-ignore-all lint/style/noMagicNumbers: Testing */
import {expect, test} from 'vitest';
import {logger} from '../src/logger';

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

	let time = logger.time('test');

	expect(time).toBeTypeOf('object');
	expect(time.log).toBeTypeOf('function');
	expect(time.stop).toBeTypeOf('function');

	time.log();
	time.stop();

	logger.enabled = false;

	time = logger.time('test');

	expect(time).toBeTypeOf('object');
	expect(time.log).toBeTypeOf('function');
	expect(time.stop).toBeTypeOf('function');

	time.log();
	time.stop();
});
