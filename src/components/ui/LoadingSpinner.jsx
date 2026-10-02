import { LuLoader } from "react-icons/lu";

const LoadingSpinner = ({
  size = 25,
  color = "white",
  compact = false,
}) => {
  return (
    <LuLoader
      aria-hidden="true"
      className={compact
        ? "inline-block shrink-0 animate-spin motion-reduce:animate-none"
        : "mx-auto block animate-spin motion-reduce:animate-none"}
      size={size}
      color={color}
    />
  );
};

export default LoadingSpinner;
