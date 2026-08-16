import {expect, test} from 'vitest';
import {getColor} from '../../src';

test('color', () => {
	const color = getColor('hello, world!');

	expect(color.hex).toEqual('000000');
	expect(color.alpha).toEqual(100);

	color.hex = 'ffffff';

	expect(color.hex).toEqual('ffffff');
	expect(color.hexa).toEqual('ffffffff');
	expect(color.alpha).toEqual(100);

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
	expect(color.alpha).toEqual(100);

	color.hex = 'hello, world!';

	expect(color.hex).toEqual('ffffff');
	expect(color.alpha).toEqual(100);

	color.hsl = {hue: 69, lightness: 'blah' as never, saturation: 0};

	expect(color.hsl).toEqual({hue: 69, lightness: 0, saturation: 0});
	expect(color.alpha).toEqual(100);

	color.hsl = 123 as never;

	expect(color.hsl).toEqual({hue: 69, lightness: 0, saturation: 0});
	expect(color.alpha).toEqual(100);

	color.hsl = {hue: 900, lightness: 0, saturation: 0};

	expect(color.hsl).toEqual({hue: 360, lightness: 0, saturation: 0});
	expect(color.alpha).toEqual(100);

	color.hwb = {hue: 69, whiteness: 'blah' as never, blackness: 0};

	expect(color.hwb).toEqual({hue: 69, whiteness: 0, blackness: 0});
	expect(color.alpha).toEqual(100);

	color.hwb = 123 as never;

	expect(color.hwb).toEqual({hue: 69, whiteness: 0, blackness: 0});
	expect(color.alpha).toEqual(100);

	color.hwb = {hue: -900, whiteness: 0, blackness: 0};

	expect(color.hwb).toEqual({hue: 0, whiteness: 0, blackness: 0});
	expect(color.alpha).toEqual(100);

	color.rgb = {red: 0, green: 'blah' as never, blue: 0};

	expect(color.rgb).toEqual({red: 0, green: 0, blue: 0});
	expect(color.alpha).toEqual(100);

	color.rgb = 123 as never;

	expect(color.rgb).toEqual({red: 0, green: 0, blue: 0});
	expect(color.alpha).toEqual(100);

	color.rgb = {red: 552, green: 0, blue: 0};

	expect(color.rgb).toEqual({red: 255, green: 0, blue: 0});
	expect(color.alpha).toEqual(100);

	color.alpha = -99;

	expect(color.alpha).toEqual(0);

	color.alpha = 500;

	expect(color.alpha).toEqual(100);

	color.alpha = Number.NaN;

	expect(color.alpha).toEqual(100);

	color.alpha = 44;

	expect(color.alpha).toEqual(44);

	color.hsla = {hue: 180, lightness: 25, saturation: 75, alpha: 50};

	expect(color.hsla).toEqual({
		hue: 180,
		lightness: 25,
		saturation: 75,
		alpha: 50,
	});

	expect(color.alpha).toEqual(50);

	color.hwba = {hue: 90, whiteness: 75, blackness: 25, alpha: 33.33};

	expect(color.hwba).toEqual({
		hue: 90,
		whiteness: 75,
		blackness: 25,
		alpha: 33.33,
	});

	expect(color.alpha).toEqual(33.33);

	color.rgba = {red: 255, green: 128, blue: 0, alpha: 25};

	expect(color.rgba).toEqual({red: 255, green: 128, blue: 0, alpha: 25});
	expect(color.alpha).toEqual(25);
});
