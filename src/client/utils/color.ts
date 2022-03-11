export const intToRgb = (num: number) => {
  const str = ("000000" + (num >>> 0).toString(16)).slice(-6);
  return {
    red: parseInt(str.slice(0, 2), 16),
    green: parseInt(str.slice(2, 4), 16),
    blue: parseInt(str.slice(4, 8), 16),
  };
};
