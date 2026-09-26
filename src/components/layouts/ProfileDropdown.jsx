import clsx from "clsx";
import { FiLogOut } from "react-icons/fi";
import { useMainContext } from "../../context/MainContext";
import useAuthStore from "../../store/useAuthStore";
import { useDemoMode } from "../../demo/useDemoMode";
import Button from "../ui/Button";

const ProfileDropdown = () => {
  const isDemoMode = useDemoMode();
  const user = useAuthStore((state) => state.currentUser);
  const userName = useAuthStore((state) => state.userName);
  const isUserEmailVerified = useAuthStore(state => state.isUserEmailVerified);
  
  const { isProfileOpen, handleSignoutPromptOpen } = useMainContext();
  
  if (!isProfileOpen) return null;
  
  return (
    <section
      id="profile-menu"
      aria-label="Account"
      className={clsx(
        "absolute top-[calc(100%+0.5rem)] right-0 max-h-[calc(100dvh-5rem)] w-64 max-w-[calc(100vw-5rem)] overflow-y-auto",
        "rounded-lg border border-border bg-popover text-sm shadow-xl max-w-[calc(100vw-2rem)]",
      )}
    >
      <div className="flex flex-col items-center p-5 text-center">
        <span
          className="inline-flex size-9 shrink-0 items-center justify-center rounded-full bg-primary text-xs font-semibold text-primary-foreground mb-3"
          aria-hidden="true"
        >
          {userName?.initials || "SB"}
        </span>
        <h2 className="max-w-full break-words font-display text-base font-semibold">
          {userName?.fullName || "Your account"}
        </h2>
        <p className="mt-1 max-w-full break-words text-xs text-muted-foreground">
          {user?.email}
        </p>
        <p className="mt-3 text-xs text-muted-foreground">
          Status:{" "}
          <span
            className={
              isUserEmailVerified
                ? "text-green-700 dark:text-green-400"
                : "text-amber-700 dark:text-amber-400"
            }
          >
            {isUserEmailVerified ? "Verified" : "Unverified"}
          </span>
        </p>
      </div>
      <div className="border-t border-border p-2">
        <Button
          variant="ghost"
          onClick={handleSignoutPromptOpen}
          aria-haspopup="dialog"
          className="text-danger w-full"
        >
          <span className="flex items-center justify-center gap-2">
            <FiLogOut aria-hidden="true" />
            {isDemoMode ? "Exit Demo" : "Log Out"}
          </span>
        </Button>
      </div>
    </section>
  );
};

export default ProfileDropdown;
