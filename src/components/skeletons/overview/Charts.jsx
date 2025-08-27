const Charts = () => {
  return (
    <section>
      <div className="w-2xs h-[40px] animate-pulse bg-[rgb(var(--color-skeleton-bg))] rounded-lg mb-2"></div>
      <div className="w-full max-w-2xl h-[30px] animate-pulse bg-[rgb(var(--color-skeleton-bg))] rounded-lg mb-6"></div>
      {/* Chart grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className="w-full h-[300px] bg-[rgb(var(--color-skeleton-bg))] rounded-lg animate-pulse p-4"></div>
        <div className="w-full h-[300px] bg-[rgb(var(--color-skeleton-bg))] rounded-lg animate-pulse p-4"></div>
      </div>
    </section>
  );
};

export default Charts;
