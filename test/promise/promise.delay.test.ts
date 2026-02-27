import {expect, test} from 'vitest';
import {delay} from '../../src';

test('', () =>
	new Promise<void>(done => {
		const start = Date.now();

		const errors: unknown[] = [undefined, undefined, undefined];
		const values: number[][] = [undefined, undefined, undefined] as unknown as number[][];

		void delay(500)
			.then(() => {
				values[0] = [Date.now() - start, 490, 510];
			})
			.catch(error => {
				errors[0] = error;
			});

		void delay(-999)
			.then(() => {
				values[1] = [Date.now() - start, 0, 10];
			})
			.catch(error => {
				errors[1] = error;
			});

		void delay('blah' as never)
			.then(() => {
				values[2] = [Date.now() - start, 0, 10];
			})
			.catch(error => {
				errors[2] = error;
			});

		setTimeout(() => {
			expect(errors).toEqual([undefined, undefined, undefined]);

			for (const value of values) {
				expect(value[0]).toBeGreaterThanOrEqual(value[1]);
				expect(value[0]).toBeLessThanOrEqual(value[2]);
			}

			done();
		}, 1000);
	}));

test('abort', () =>
	new Promise<void>(done => {
		const start = Date.now();

		const errors: unknown[] = [undefined, undefined, undefined, undefined];

		const values: number[][] = [
			undefined,
			undefined,
			undefined,
			undefined,
		] as unknown as number[][];

		void delay({
			signal: AbortSignal.timeout(250),
			time: 500,
		})
			.then(() => {
				values[0] = [Date.now() - start, 240, 260];
			})
			.catch(error => {
				errors[0] = error;
			});

		const first = new AbortController();
		const second = new AbortController();

		void delay({
			signal: first.signal,
			time: 500,
		})
			.then(() => {
				values[1] = [Date.now() - start, 240, 260];
			})
			.catch(error => {
				errors[1] = error;
			});

		second.abort('Already aborted!');

		void delay({
			signal: second.signal,
			time: 500,
		})
			.then(() => {
				values[2] = [Date.now() - start, 240, 260];
			})
			.catch(error => {
				errors[2] = error;
			});

		void delay({
			signal: 'blah' as never,
			time: 500,
		})
			.then(() => {
				values[3] = [Date.now() - start, 490, 510];
			})
			.catch(error => {
				errors[3] = error;
			});

		setTimeout(() => {
			first.abort('Aborted during!');
		}, 250);

		setTimeout(() => {
			expect(errors[0]).toBeInstanceOf(Error);
			expect((errors[0] as Error).name).toBe('TimeoutError');

			expect(errors[1]).toBe('Aborted during!');
			expect(errors[2]).toBe('Already aborted!');
			expect(errors[3]).toBeUndefined();

			expect(values[0]).toBeUndefined();
			expect(values[1]).toBeUndefined();
			expect(values[2]).toBeUndefined();

			expect(values[3][0]).toBeGreaterThanOrEqual(values[3][1]);
			expect(values[3][0]).toBeLessThanOrEqual(values[3][2]);

			done();
		}, 1000);
	}));
