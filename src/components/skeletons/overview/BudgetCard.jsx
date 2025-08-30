const BudgetCard = () => {
  return (
    <div className="w-full h-auto bg-[rgb(var(--color-skeleton-bg))] rounded-lg animate-pulse p-6">
      <div className="w-28 h-14 bg-[rgb(var(--color-skeleton-bg-deep))] rounded-md animate-pulse mb-2"></div>
      <div className="w-2/3 h-6 bg-[rgb(var(--color-skeleton-bg-deep))] rounded-md animate-pulse mb-4"></div>
      {Array.from({ length: 3 }).map((_, i) => (
        <div
          key={i}
          className="w-1/3 h-4 bg-[rgb(var(--color-skeleton-bg-deep))] rounded-md animate-pulse mb-1"
        ></div>
      ))}
    </div>
  );
};

export default BudgetCard;
