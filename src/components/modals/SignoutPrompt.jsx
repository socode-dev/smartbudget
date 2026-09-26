import { useMainContext } from "../../context/MainContext";
import { doSignOut } from "../../firebase/auth";
import useAuthStore from "../../store/useAuthStore";
import Dialog from "../ui/Dialog";
import Button from "../ui/Button";
import { useNavigate } from "react-router-dom";
import { useDemoMode } from "../../demo/useDemoMode";
import { FiAlertTriangle, FiLogOut, FiX } from "react-icons/fi";

const SignoutPrompt = () => {
  const isDemoMode = useDemoMode();
  const navigate = useNavigate();
  const setCurrentUser = useAuthStore((state) => state.setCurrentUser);
  const setUserName = useAuthStore((state) => state.setUserName);
  const { isSignoutPromptOpen, handleSignoutPromptClose } = useMainContext();

  if (!isSignoutPromptOpen) return null;

  const onSignOut = () => {
    handleSignoutPromptClose();

    if (isDemoMode) {
      navigate("/login");
      return;
    }

    doSignOut();

    setTimeout(() => {
      setCurrentUser(null);
      setUserName((prev) => ({ ...prev, initials: "", fullName: "" }));
    }, 1000);
  };

  return (
    <Dialog
      ariaLabelledBy="signout-title"
      ariaDescribedBy="signout-description"
      onClose={handleSignoutPromptClose}
      padded={false}
      className="max-w-[420px] overflow-hidden p-0!"
    >
      <header className="flex items-start gap-3 border-b border-border bg-background px-6 py-5">
        <span className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-danger-soft text-danger">
          <FiAlertTriangle size={18} aria-hidden="true" />
        </span>

        <div className="min-w-0 flex-1">
          <h2 id="signout-title" className="font-display text-lg font-semibold">
            {isDemoMode ? "Exit demo session?" : "Log out of Vydra?"}
          </h2>
          <p
            id="signout-description"
            className="mt-1 text-sm leading-relaxed text-muted-foreground"
          >
            {isDemoMode
              ? "You will return to the login screen and your demo session will end."
              : "You will need to sign in again before accessing your dashboard."}
          </p>
        </div>

        <Button
          variant="ghost"
          className="size-10 min-h-10 shrink-0 p-0!"
          onClick={handleSignoutPromptClose}
          aria-label="Close sign out prompt"
          title="Close sign out prompt"
        >
          <FiX size={18} aria-hidden="true" />
        </Button>
      </header>

      <footer className="flex flex-col-reverse gap-2 border-t border-border bg-surface px-6 py-4 sm:flex-row sm:justify-end">
        <Button variant="outline" onClick={handleSignoutPromptClose}>
          Stay signed in
        </Button>
        <Button variant="destructive" onClick={onSignOut}>
          <span className="flex items-center justify-center gap-2">
            <FiLogOut aria-hidden="true" />
            {isDemoMode ? "Exit demo" : "Log out"}
          </span>
        </Button>
      </footer>
    </Dialog>
  );
};

export default SignoutPrompt;
