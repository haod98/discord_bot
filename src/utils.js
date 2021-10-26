function randomNumber(min, max) {
  //   min = Math.ceil(min);
  //   max = Math.floor(max);
  //   return Math.floor(Math.random() * (max - min + 1)) + min;
  const r = Math.random() * (max - min) + min;
  return Math.floor(r);
}

function randomNumbers(min, max, count = 1) {
  const ids = [];
  for (let i = 0; i < count; i++) {
    ids.push(randomNumber(min, max));
  }

  return ids;
}

module.exports = {
  randomNumber,
  randomNumbers,
}