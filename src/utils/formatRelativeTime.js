import { formatDistanceToNow } from "date-fns";

export const formatRelativeTime = (createdAt) => {
  if (!createdAt) return "";

  const convertDate = (d) => {
    const newDate = new Date(d.seconds * 1000);
    return newDate.toLocaleString();
  };

  const date = convertDate(createdAt);

  return formatDistanceToNow(date, { addSuffix: true });
};
