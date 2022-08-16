// code for shuffling based on seed taken from
// https://stackoverflow.com/a/53758827

export function shuffleProfiles(array: any[], seed: number) {
  var m = array.length;
  var t;
  var i;

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
  var x = Math.sin(seed++) * 10000;
  return x - Math.floor(x);
}
