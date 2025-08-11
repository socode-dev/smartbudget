const LoadingSpinner = ({ size = 25, color = "white" }) => {
  return (
    <div
      className="border-7 rounded-full animate-spin mx-auto"
      style={{
        width: size,
        height: size,
        borderColor: color,
        borderTopColor: "gray",
      }}
    >
      <div></div>
    </div>
  );
};

export default LoadingSpinner;
