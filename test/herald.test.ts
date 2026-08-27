import {expect, test} from 'vitest';
import {herald, isEvents, isHerald} from '../src';
import {isFixture} from './.fixtures/is.fixture';

const {length, values} = isFixture;

type Events = {
	foo: (id: number, name: string) => void;
	bar: () => void;
	baz: () => void;
};

test('', () => {});
