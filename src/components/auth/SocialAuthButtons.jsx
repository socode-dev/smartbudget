import { useRef, useState } from "react";
import { FaGoogle, FaMicrosoft } from "react-icons/fa6";
import Button from "../ui/Button";

const SocialAuthButtons = ({
  onGoogle,
  onMicrosoft,
  disabled,
  onPendingChange,
  verb = "continue",
}) => {
  const [pending, setPending] = useState(null);
  const active = useRef(false);
  
  const signIn = async (provider, action) => {
    if (disabled || active.current) return;
    active.current = true;
    setPending(provider);
    onPendingChange?.(true);
    
    try {
      await action();
    } finally {
      active.current = false;
      setPending(null);
      onPendingChange?.(false);
    }
  };

  return (
    <section className="mt-6" aria-label="Social sign in">
      <p className="text-center text-xs font-medium uppercase text-muted-foreground">
        Or {verb} with
      </p>
      <div className="mt-3 grid grid-cols-2 gap-3">
        <Button
          variant="outline"
          disabled={disabled || Boolean(pending)}
          loading={pending === "google"}
          loadingText="Google"
          onClick={() => signIn("google", onGoogle)}
          aria-label="Continue with Google"
        >
          <span className="flex items-center justify-center gap-2">
            <FaGoogle aria-hidden="true" />
            Google
          </span>
        </Button>
        <Button
          variant="outline"
          disabled={disabled || Boolean(pending)}
          loading={pending === "microsoft"}
          loadingText="Microsoft"
          onClick={() => signIn("microsoft", onMicrosoft)}
          aria-label="Continue with Microsoft"
        >
          <span className="flex items-center justify-center gap-2">
            <FaMicrosoft aria-hidden="true" />
            Microsoft
          </span>
        </Button>
      </div>
    </section>
  );
};
export default SocialAuthButtons;
