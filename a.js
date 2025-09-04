const a = {
  1: 1,
  2: 2,
  3: 4,
  [Symbol.iterator]() {
    let index = 0;
    return {
      next() {
        if (index < 3) {
          index++;
          return {
            value: a[index],
            done: false,
          };
        } else {
          return {
            done: true,
          };
        }
      },
    };
  },
};

for (const item of a) {
  console.log(item);
}
