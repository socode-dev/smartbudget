const generateRandomNumber = (number) => {
  return Math.floor(Math.random() * number) + 1;
};

export const CATEGORY_OPTIONS = [
  { name: "Freelance", type: "income" },
  { name: "Salary", type: "income" },
  { name: "Investments", type: "expense" },
  { name: "Gifts", type: "expense" },
  { name: "Insurance", type: "expense" },
  { name: "Food", type: "expense" },
  { name: "Groceries", type: "expense" },
  { name: "Transportation", type: "expense" },
  { name: "Dining", type: "expense" },
  { name: "Shopping", type: "expense" },
  { name: "Utilities", type: "expense" },
  { name: "Healthcare", type: "expense" },
  { name: "Entertainment", type: "expense" },
  { name: "Travel", type: "expense" },
  { name: "Rent", type: "expense" },
  { name: "Gas", type: "expense" },
  { name: "Phone", type: "expense" },
  { name: "Internet", type: "expense" },
  { name: "Gym", type: "expense" },
  { name: "Other", type: "other" },
];

export const categoryColor = {
  Investments: "#6366F1",
  Gifts: "#D946EF",
  Insurance: "#38BDF8",
  Food: "#22C55E",
  Groceries: "#84CC16",
  Transportation: "#FBBF24",
  Dining: "#F43F5E",
  Shopping: "#A855F7",
  Utilities: "#14B8A6",
  Healthcare: "#06B6D4",
  Entertainment: "#FB923C",
  Travel: "#10B981",
  Rent: "#92400E",
  Gas: "#577GH5",
  Phone: "#BE123C",
  Internet: "#581C87",
  Gym: "#53JS8K",
  Other: `rgb(${generateRandomNumber(255)}, ${generateRandomNumber(
    255
  )}, ${generateRandomNumber(255)})`,
};
