import VydraLogo from "./VydraLogo";

const AnimatedLoader = ({ size = 72, stroke = 4 }) => {
  const borderWidth = Math.max(2, Math.round(stroke / 2));

  return (
    <div
      className="relative inline-flex shrink-0 items-center justify-center"
      role="status"
      aria-label="Loading"
      style={{ height: size, width: size }}
    >
      <span
        aria-hidden="true"
        className="absolute inset-0 animate-spin rounded-full border-primary/15 border-t-primary motion-reduce:animate-none"
        style={{ borderWidth }}
      />
      <span className="flex items-center justify-center rounded-xl bg-card p-2 shadow-sm">
        <VydraLogo variant="mark" className="size-7" label="" />
      </span>
    </div>
  );
};

export default AnimatedLoader;
