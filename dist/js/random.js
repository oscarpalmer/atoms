// src/js/array/shuffle.ts
function shuffle(array) {
  const shuffled = array.slice();
  const { length } = shuffled;
  for (let index = 0;index < length; index += 1) {
    const random = getRandomInteger(0, length);
    [shuffled[index], shuffled[random]] = [shuffled[random], shuffled[index]];
  }
  return shuffled;
}

// src/js/random.ts
function getRandomBoolean() {
  return Math.random() > 0.5;
}
function getRandomCharacters(length, selection) {
  if (length < 1) {
    return "";
  }
  const actual = typeof selection === "string" && selection.length > 0 ? selection : "abcdefghijklmnopqrstuvwxyz";
  let characters = "";
  for (let index = 0;index < length; index += 1) {
    characters += actual.charAt(getRandomInteger(0, actual.length));
  }
  return characters;
}
function getRandomColour() {
  return `#${Array.from({ length: 6 }, getRandomHex).join("")}`;
}
function getRandomDate(earliest, latest) {
  const earliestTime = earliest?.getTime() ?? -8640000000000000;
  const latestTime = latest?.getTime() ?? 8640000000000000;
  return new Date(getRandomInteger(earliestTime, latestTime));
}
function getRandomFloat(min, max) {
  const minimum = min ?? Number.MIN_SAFE_INTEGER;
  return Math.random() * ((max ?? Number.MAX_SAFE_INTEGER) - minimum) + minimum;
}
function getRandomHex() {
  return "0123456789ABCDEF"[getRandomInteger(0, 16)];
}
function getRandomInteger(min, max) {
  return Math.floor(getRandomFloat(min, max));
}
function getRandomItem(array) {
  return array[getRandomInteger(0, array.length)];
}
function getRandomItems(array, amount) {
  if (amount === 1) {
    return array.length === 0 ? [] : [array[getRandomInteger(0, array.length)]];
  }
  return amount == null || amount >= array.length ? shuffle(array) : shuffle(array).slice(0, amount);
}
export {
  getRandomItems,
  getRandomItem,
  getRandomInteger,
  getRandomHex,
  getRandomFloat,
  getRandomDate,
  getRandomColour,
  getRandomCharacters,
  getRandomBoolean
};
