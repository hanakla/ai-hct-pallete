export const isCloseTo = (actual: number, expect: number, digits: number) => {
  return ((actual * 10 ** digits) | 0) === ((expect * 10 ** digits) | 0);
};

export const floor = (num: number, digits: number = 1) =>
  ((num * 10 ** digits) | 0) / 10 ** digits;
