export function random10FromArray<T>(array: T[]): Array<T> {
  let randomItems: T[] = [];

  for (let i = 0; i < 10; i++) {
    let randomIndex = Math.floor(Math.random() * array.length);
    randomItems.push(array.splice(randomIndex, 1)[0]);
  }

  return randomItems;
}

export function findUserRoomData(array1: any[], array2: any[]) {
  const result: any[] = [];
  array1.forEach((obj1) => {
    array2.forEach((obj2) => {
      if (obj1.id === obj2.id) {
        result.push(obj1);
      }
    });
  });
  return result;
}
