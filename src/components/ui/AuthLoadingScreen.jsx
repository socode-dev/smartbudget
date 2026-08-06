import AnimatedLoader from "./AnimatedLoader";

const AuthLoadingScreen = () => {
  return (
    <main className="min-h-dvh w-full flex items-center justify-center px-6">
      <section className="flex flex-col items-center gap-5 text-center">
        <AnimatedLoader size={86} stroke={7} />
        <div>
          <p className="text-lg font-semibold text-[rgb(var(--color-text))]">
            SmartBudget
          </p>
          <p className="text-sm text-[rgb(var(--color-muted))]">
            Preparing your financial workspace...
          </p>
        </div>
      </section>
    </main>
  );
};

export default AuthLoadingScreen;
