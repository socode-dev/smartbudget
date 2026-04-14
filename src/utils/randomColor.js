const generateRandomNumber = (number) => {
  return Math.floor(Math.random() * number) + 1;
};

export const getRandomColor = () => {
  return `rgb(${generateRandomNumber(255)}, ${generateRandomNumber(
    255,
  )}, ${generateRandomNumber(255)})`;
};
