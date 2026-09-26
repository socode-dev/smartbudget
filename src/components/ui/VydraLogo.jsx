import clsx from "clsx";

const logoAssets = {
  mark: "/assets/vydra-mark.svg",
  wordmark: "/assets/vydra-logo.svg",
};

const VydraLogo = ({ variant = "wordmark", className, label = "Vydra" }) => {
  const isMark = variant === "mark";
  const decorative = label === "";
  const asset = logoAssets[isMark ? "mark" : "wordmark"];

  return (
    <img
      src={asset}
      alt={decorative ? "" : label}
      aria-hidden={decorative || undefined}
      className={clsx("inline-block shrink-0 object-contain", className)}
    />
  );
};

export default VydraLogo;
