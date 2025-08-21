import { formatDistanceToNow } from "date-fns";

export const formatRelativeTime = (createdAt) => {
  if (!createdAt) return "";

  const date = createdAt.toDate ? createdAt.toDate() : createdAt;

  return formatDistanceToNow(date, { addSuffix: true });
};
