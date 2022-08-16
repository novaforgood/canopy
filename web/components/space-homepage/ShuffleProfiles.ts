// code for shuffling based on seed taken from
// https://stackoverflow.com/a/53758827

export function shuffleProfiles<T>(array: T[], seed: number) {
  let m = array.length;
  let t;
  let i;

  while (m) {
    i = Math.floor(random(seed) * m--);

    t = array[m];
    array[m] = array[i];
    array[i] = t;
    ++seed;
  }

  return array;
}

function random(seed: number) {
  const x = Math.sin(seed++) * 10000;
  return x - Math.floor(x);
}
