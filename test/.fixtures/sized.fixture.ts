function joinMap(map: Map<unknown, unknown>): string {
	return [...map.entries()].map(([key, value]) => `${key}:${value}`).join('; ');
}

function joinSet(set: Set<unknown>): string {
	return [...set.values()].join('; ');
}

const actualMax = 2 ** 24;
const niceMax = 2 ** 20;

export const sizedFixture = {
	actualMax,
	joinMap,
	joinSet,
	niceMax,
};
