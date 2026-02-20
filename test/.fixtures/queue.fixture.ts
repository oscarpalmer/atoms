const asynchronous = async (value: number) =>
	new Promise<number>(resolve => {
		setTimeout(() => resolve(value), 100);
	});

const synchronous = async (value: number) => value;

export const queueFixture = {
	asynchronous,
	synchronous,
};
