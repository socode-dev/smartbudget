const ErrorFallback = ({ resetErrorBoundary }) => {
  return (
    <div className="p-4 text-center">
      <h2 className="text-lg font-semibold text-red-600">
        Something went wrong
      </h2>
      <button
        onClick={resetErrorBoundary}
        className="mt-4 mx-auto px-4 py-2 bg-red-500 hover:bg-red-600 transition text-white rounded cursor-pointer"
      >
        Try Again
      </button>
    </div>
  );
};

export default ErrorFallback;
