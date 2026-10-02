import AnimatedLoader from "./AnimatedLoader";

const AuthLoadingScreen = ({ message = "Loading Vydra..." }) => {
  return (
    <main className="flex min-h-dvh w-full items-center justify-center bg-background px-6">
      <section className="flex flex-col items-center gap-4 text-center">
        <AnimatedLoader size={72} stroke={4} />
        
        <p className="text-sm font-medium text-muted-foreground">
          {message}
        </p>
      </section>
    </main>
  );
};

export default AuthLoadingScreen;
