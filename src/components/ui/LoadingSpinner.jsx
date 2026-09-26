const LoadingSpinner = ({
  size = 25,
  color = "white",
  borderTopColor = "gray",
  compact = false,
}) => {

  return (
    <span
      aria-hidden="true"
      className={
        compact
          ? "inline-block shrink-0 rounded-full animate-spin motion-reduce:animate-none"
          : "block rounded-full animate-spin mx-auto"
      }
      style={{
        width: size,
        height: size,
        borderWidth: compact ? 2 : 7,
        borderStyle: "solid",
        borderColor: color,
        borderTopColor: borderTopColor,
      }}
    />
  );
};

export default LoadingSpinner;
