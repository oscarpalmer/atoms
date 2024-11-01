import {expect, test} from 'vitest';
import {logger} from '../src/logger';

test('log', () => {
	logger.log('test');

	expect(logger.enabled).toBe(true);

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
});

test('log.time', () => {
	logger.enabled = true;

	const time = logger.time('test');

	expect(time).toBeTypeOf('object');
	expect(time.log).toBeTypeOf('function');
	expect(time.stop).toBeTypeOf('function');

	time.log();
	time.stop();
});
