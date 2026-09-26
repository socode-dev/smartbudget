import { useState } from "react";
import { FiMail, FiRefreshCw } from "react-icons/fi";
import toast from "react-hot-toast";
import useAuthStore from "../../store/useAuthStore";
import { useDemoMode } from "../../demo/useDemoMode";
import Button from "../ui/Button";

const AccountVerificationBanner = () => {
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);
  const demo = useDemoMode();
  const user = useAuthStore((state) => state.currentUser);
  const verified = useAuthStore((state) => state.isUserEmailVerified);
  const resendVerificationLink = useAuthStore(state => state.resendVerificationLink);

  if (demo || verified) return null;

  const resend = async () => {
    if (sending) return;
    setSending(true);
    try {
      await resendVerificationLink(user);
      setSent(true);
    } catch {
      toast.error("The verification link could not be sent. Please try again.");
    } finally {
      setSending(false);
    }
  };

  return (
    <aside
      aria-labelledby="verification-banner-title"
      className="flex flex-col gap-4 border-b border-primary/25 bg-info-soft px-4 py-3.5 sm:flex-row sm:items-center sm:justify-between sm:px-6"
    >
      <div className="flex min-w-0 items-start gap-3">
        <span className="grid size-10 shrink-0 place-items-center rounded-lg bg-primary text-white shadow-xs">
          <FiMail size={18} aria-hidden="true" />
        </span>
        <div className="min-w-0">
          <h2
            id="verification-banner-title"
            className="text-sm font-semibold text-foreground"
          >
            Verify your email address
          </h2>
          <p className="mt-0.5 break-words text-xs leading-5 text-muted-foreground">
            {sent
              ? `A verification link was sent to ${user?.email || "your email address"}. Check your inbox and spam folder.`
              : `Send a verification link to ${user?.email || "your email address"} to finish securing your account.`}
          </p>
        </div>
      </div>
      <Button
        variant="outline"
        className="w-full shrink-0 border-primary/35 bg-card text-primary hover:bg-primary hover:text-white sm:w-auto"
        onClick={resend}
        loading={sending}
        loadingText="Sending..."
      >
        <span className="flex items-center gap-2">
          <FiRefreshCw aria-hidden="true" />
          {sent ? "Send again" : "Send verification email"}
        </span>
      </Button>
    </aside>
  );
};

export default AccountVerificationBanner;
