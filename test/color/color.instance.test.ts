import {expect, test} from 'vitest';
import {getColor} from '../../src/color';

test('color', () => {
	const color = getColor('hello, world!');

	expect(color.hex).toEqual('000000');
	expect(color.alpha).toEqual(1);

	color.hex = 'ffffff';

	expect(color.hex).toEqual('ffffff');
	expect(color.hexa).toEqual('ffffffff');
	expect(color.alpha).toEqual(1);

	color.hexa = 'ffffff00';

	expect(color.hex).toEqual('ffffff');
	expect(color.hexa).toEqual('ffffff00');
	expect(color.alpha).toEqual(0);

	color.hexa = 'ffffffdd';

	expect(color.hex).toEqual('ffffff');
	expect(color.hexa).toEqual('ffffffdd');
	expect(color.alpha).toEqual(221 / 255);

	color.hexa = 'ffffff';

	expect(color.hex).toEqual('ffffff');
	expect(color.hexa).toEqual('ffffffff');
	expect(color.alpha).toEqual(1);

	color.hex = 'hello, world!';

	expect(color.hex).toEqual('ffffff');
	expect(color.alpha).toEqual(1);

	color.hsl = {hue: 0, lightness: 'blah' as never, saturation: 0};

	expect(color.hsl).toEqual({hue: 0, lightness: 0, saturation: 0});
	expect(color.alpha).toEqual(1);

	color.hsl = 123 as never;

	expect(color.hsl).toEqual({hue: 0, lightness: 0, saturation: 0});
	expect(color.alpha).toEqual(1);

	color.hsl = {hue: 900, lightness: 0, saturation: 0};

	expect(color.hsl).toEqual({hue: 360, lightness: 0, saturation: 0});
	expect(color.alpha).toEqual(1);

	color.rgb = {red: 0, green: 'blah' as never, blue: 0};

	expect(color.rgb).toEqual({red: 0, green: 0, blue: 0});
	expect(color.alpha).toEqual(1);

	color.rgb = 123 as never;

	expect(color.rgb).toEqual({red: 0, green: 0, blue: 0});
	expect(color.alpha).toEqual(1);

	color.rgb = {red: 552, green: 0, blue: 0};

	expect(color.rgb).toEqual({red: 255, green: 0, blue: 0});
	expect(color.alpha).toEqual(1);

	color.alpha = -99;

	expect(color.alpha).toEqual(0);

	color.alpha = 500;

	expect(color.alpha).toEqual(1);

	color.alpha = Number.NaN;

	expect(color.alpha).toEqual(1);

	color.alpha = 44;

	expect(color.alpha).toEqual(0.44);

	color.hsla = {hue: 180, lightness: 25, saturation: 75, alpha: 0.5};

	expect(color.hsla).toEqual({
		hue: 180,
		lightness: 25,
		saturation: 75,
		alpha: 0.5,
	});
	expect(color.alpha).toEqual(0.5);

	color.rgba = {red: 255, green: 128, blue: 0, alpha: 0.25};

	expect(color.rgba).toEqual({red: 255, green: 128, blue: 0, alpha: 0.25});
	expect(color.alpha).toEqual(0.25);
});
