export function random10FromArray<T>(array: T[]): Array<T> {
  let randomItems: T[] = [];

  for (let i = 0; i < 10; i++) {
    let randomIndex = Math.floor(Math.random() * array.length);
    randomItems.push(array.splice(randomIndex, 1)[0]);
  }

  return randomItems;
}
