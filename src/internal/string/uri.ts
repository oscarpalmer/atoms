function tryCallback<T, U>(value: T, callback: (value: T) => U): U {
	try {
		return callback(value);
	} catch {
		return value as never;
	}
}

export function tryDecode(value: string): string {
	return tryCallback(value, decodeURIComponent);
}

export function tryEncode(value: boolean | number | string): unknown {
	return tryCallback(value, encodeURIComponent);
}
