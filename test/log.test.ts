import {expect, test} from 'bun:test';
import {log} from '../src/js/log';

test('log', () => {
	expect(log).toBeFunction();

	log('test');

	expect(log.enabled).toBeTrue();

	log.enabled = false;

	expect(log.enabled).toBeFalse();

	expect(log.debug).toBeFunction();
	expect(log.dir).toBeFunction();
	expect(log.error).toBeFunction();
	expect(log.info).toBeFunction();
	expect(log.table).toBeFunction();
	expect(log.trace).toBeFunction();
	expect(log.warn).toBeFunction();
});

test('log.time', () => {
	log.enabled = true;

	const time = log.time('test');

	expect(time).toBeObject();
	expect(time.log).toBeFunction();
	expect(time.stop).toBeFunction();

	time.log();
	time.stop();
});
