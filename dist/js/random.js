// src/js/random.ts
function getRandomBoolean() {
  return Math.random() > 0.5;
}
function getRandomCharacters(length, selection) {
  if (length < 1) {
    return "";
  }
  const actualSelection = typeof selection === "string" && selection.length > 0 ? selection : "abcdefghijklmnopqrstuvwxyz";
  let characters = "";
  for (let index = 0;index < length; index += 1) {
    characters += actualSelection.charAt(getRandomInteger(0, actualSelection.length));
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
function getRandomInteger(min, max) {
  return Math.floor(getRandomFloat(min, max));
}
function getRandomHex() {
  return "0123456789ABCDEF"[getRandomInteger(0, 16)];
}
export {
  getRandomInteger,
  getRandomHex,
  getRandomFloat,
  getRandomDate,
  getRandomColour,
  getRandomCharacters,
  getRandomBoolean
};
