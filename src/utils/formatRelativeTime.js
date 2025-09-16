import { formatDistanceToNow } from "date-fns";

export const formatRelativeTime = (createdAt) => {
  if (!createdAt) return "";

  const toDate = (date) => {
    // If it's already a Date
    if (date instanceof Date) return date;

    // Firestore Timestamp has toDate()
    if (date && typeof date.toDate === "function") return date.toDate();

    // If it's an object with seconds (Firestore in some contexts)
    if (date && typeof date.seconds === "number")
      return new Date(date.seconds * 1000);

    // If it's a numeric timestamp (ms)
    if (typeof date === "number") return new Date(date);

    // If it's an ISO/string fallback (less preferred)
    if (typeof date === "string") return new Date(date);

    return null;
  };

  const date = toDate(createdAt);
  if (!date || Number.isNaN(date.getTime())) return "";

  return formatDistanceToNow(date, { addSuffix: true });
};
