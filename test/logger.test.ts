import {expect, test} from 'bun:test';
import {logger} from '../src/js/logger';

test('log', () => {
	logger.log('test');

	expect(logger.enabled).toBeTrue();

	logger.enabled = false;

	expect(logger.enabled).toBeFalse();

	expect(logger.debug).toBeFunction();
	expect(logger.dir).toBeFunction();
	expect(logger.error).toBeFunction();
	expect(logger.info).toBeFunction();
	expect(logger.log).toBeFunction();
	expect(logger.table).toBeFunction();
	expect(logger.trace).toBeFunction();
	expect(logger.warn).toBeFunction();
});

test('log.time', () => {
	logger.enabled = true;

	const time = logger.time('test');

	expect(time).toBeObject();
	expect(time.log).toBeFunction();
	expect(time.stop).toBeFunction();

	time.log();
	time.stop();
});
