// src/js/colour/index.ts
function getForegroundColour(value) {
  const values = [value.blue / 255, value.green / 255, value.red / 255];
  for (let colour of values) {
    if (colour <= 0.03928) {
      colour /= 12.92;
    } else {
      colour = ((colour + 0.055) / 1.055) ** 2.4;
    }
  }
  const luminance = 0.2126 * values[2] + 0.7152 * values[1] + 0.0722 * values[0];
  return luminance > 0.625 ? "black" : "white";
}

// src/js/number.ts
function clamp(value, min, max, loop) {
  if (value < min) {
    return loop === true ? max : min;
  }
  return value > max ? loop === true ? min : max : value;
}

// src/js/colour/is.ts
function isColour(value) {
  return isInstance(/^(hex|hsl|rgb)$/, value);
}
function isColourValue(value, properties) {
  return typeof value === "object" && value !== null && properties.every((property) => (property in value) && typeof value[property] === "number");
}
function isHexColour(value) {
  return isInstance(/^hex$/, value);
}
function isHSLColour(value) {
  return isInstance(/^hsl$/, value);
}
var isInstance = function(pattern, value) {
  return typeof value === "object" && value !== null && "$colour" in value && typeof value.$colour === "string" && pattern.test(value.$colour);
};
function isRGBColour(value) {
  return isInstance(/^rgb$/, value);
}

// src/js/colour/base.ts
class Colour {
  get value() {
    return { ...this.state.value };
  }
  constructor(type, value, defaults, properties) {
    this.$colour = type;
    this.state = {
      value: isColourValue(value, properties) ? { ...value } : { ...defaults }
    };
  }
}

// src/js/colour/hsl.ts
function getHSLColour(value) {
  return new HSLColour(value);
}

class HSLColour extends Colour {
  get hue() {
    return +this.state.value.hue;
  }
  set hue(value) {
    this.state.value.hue = clamp(value, 0, 360);
  }
  get lightness() {
    return +this.state.value.lightness;
  }
  set lightness(value) {
    this.state.value.lightness = clamp(value, 0, 100);
  }
  get saturation() {
    return +this.state.value.saturation;
  }
  set saturation(value) {
    this.state.value.saturation = clamp(value, 0, 100);
  }
  constructor(value) {
    super("hsl", value, defaults, properties);
  }
  toHex() {
    return HSLColour.toRgb(this.state.value).toHex();
  }
  toRgb() {
    return HSLColour.toRgb(this.state.value);
  }
  toString() {
    return `hsl(${this.state.value.hue}, ${this.state.value.saturation}%, ${this.state.value.lightness}%)`;
  }
  static toRgb(value) {
    return hslToRgb(value);
  }
}
var defaults = {
  hue: 0,
  lightness: 0,
  saturation: 0
};
var properties = [
  "hue",
  "lightness",
  "saturation"
];

// src/js/colour/rgb.ts
function getRGBColour(value) {
  return new RGBColour(value);
}

class RGBColour extends Colour {
  get blue() {
    return +this.state.value.blue;
  }
  set blue(value) {
    this.state.value.blue = clamp(value, 0, 255);
  }
  get green() {
    return +this.state.value.green;
  }
  set green(value) {
    this.state.value.green = clamp(value, 0, 255);
  }
  get red() {
    return +this.state.value.red;
  }
  set red(value) {
    this.state.value.red = clamp(value, 0, 255);
  }
  constructor(value) {
    super("rgb", value, defaults2, properties2);
  }
  toHex() {
    return RGBColour.toHex(this.value);
  }
  toHsl() {
    return RGBColour.toHsl(this.value);
  }
  toString() {
    return `rgb(${this.value.red}, ${this.value.green}, ${this.value.blue})`;
  }
  static toHex(value) {
    return rgbToHex(value);
  }
  static toHsl(rgb) {
    return rgbToHsl(rgb);
  }
}
var defaults2 = {
  blue: 0,
  green: 0,
  red: 0
};
var properties2 = ["blue", "green", "red"];

// src/js/colour/functions.ts
function getNormalisedHex(value) {
  const normalised = value.replace(/^#/, "");
  return normalised.length === 3 ? normalised.split("").map((character) => character.repeat(2)).join("") : normalised;
}
function hexToRgb(value) {
  const hex2 = anyPattern.test(value) ? getNormalisedHex(value) : "";
  const pairs = groupedPattern.exec(hex2) ?? [];
  const rgb2 = [];
  const { length } = pairs;
  for (let index = 1;index < length; index += 1) {
    rgb2.push(Number.parseInt(pairs[index], 16));
  }
  return new RGBColour({
    blue: rgb2[2] ?? 0,
    green: rgb2[1] ?? 0,
    red: rgb2[0] ?? 0
  });
}
function hslToRgb(value) {
  let hue = value.hue % 360;
  if (hue < 0) {
    hue += 360;
  }
  const saturation = value.saturation / 100;
  const lightness = value.lightness / 100;
  function get(value2) {
    const part = (value2 + hue / 30) % 12;
    const mod = saturation * Math.min(lightness, 1 - lightness);
    return lightness - mod * Math.max(-1, Math.min(part - 3, 9 - part, 1));
  }
  return new RGBColour({
    blue: clamp(Math.round(get(4) * 255), 0, 255),
    green: clamp(Math.round(get(8) * 255), 0, 255),
    red: clamp(Math.round(get(0) * 255), 0, 255)
  });
}
function rgbToHex(value) {
  return new HexColour(`${[value.red, value.green, value.blue].map((colour) => {
    const hex2 = colour.toString(16);
    return hex2.length === 1 ? `0${hex2}` : hex2;
  }).join("")}`);
}
function rgbToHsl(rgb2) {
  const blue = rgb2.blue / 255;
  const green = rgb2.green / 255;
  const red = rgb2.red / 255;
  const max = Math.max(blue, green, red);
  const min = Math.min(blue, green, red);
  const delta = max - min;
  const lightness = (min + max) / 2;
  let hue = 0;
  let saturation = 0;
  if (delta !== 0) {
    saturation = lightness === 0 || lightness === 1 ? 0 : (max - lightness) / Math.min(lightness, 1 - lightness);
    switch (max) {
      case blue:
        hue = (red - green) / delta + 4;
        break;
      case green:
        hue = (blue - red) / delta + 2;
        break;
      case red:
        hue = (green - blue) / delta + (green < blue ? 6 : 0);
        break;
      default:
        break;
    }
    hue *= 60;
  }
  if (saturation < 0) {
    hue += 180;
    saturation = Math.abs(saturation);
  }
  if (hue >= 360) {
    hue -= 360;
  }
  return new HSLColour({
    hue: +hue.toFixed(2),
    lightness: +(lightness * 100).toFixed(2),
    saturation: +(saturation * 100).toFixed(2)
  });
}
var anyPattern = /^#*([a-f0-9]{3}){1,2}$/i;
var groupedPattern = /^#*([a-f0-9]{2})([a-f0-9]{2})([a-f0-9]{2})$/i;

// src/js/colour/hex.ts
function getHexColour(value) {
  return new HexColour(value);
}

class HexColour {
  state;
  get value() {
    return `#${this.state.value}`;
  }
  set value(value) {
    this.state.value = anyPattern.test(value) ? getNormalisedHex(value) : "000000";
  }
  constructor(value) {
    this.$colour = "hex";
    this.state = {
      value: typeof value === "string" && anyPattern.test(value) ? getNormalisedHex(value) : "000000"
    };
  }
  toHsl() {
    return HexColour.toRgb(this.value).toHsl();
  }
  toRgb() {
    return HexColour.toRgb(this.value);
  }
  toString() {
    return this.value;
  }
  static toRgb(value) {
    return hexToRgb(value);
  }
}
export {
  isRGBColour,
  isHexColour,
  isHSLColour,
  isColour,
  getRGBColour,
  getHexColour,
  getHSLColour,
  getForegroundColour,
  RGBColour,
  HexColour,
  HSLColour
};
