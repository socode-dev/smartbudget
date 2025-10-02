import { useMainContext } from "../../context/MainContext";
import { doSignOut } from "../../firebase/auth";
import useAuthStore from "../../store/useAuthStore";
import Dialog from "../ui/Dialog";

const SignoutPrompt = () => {
  const setCurrentUser = useAuthStore((state) => state.setCurrentUser);
  const setUserName = useAuthStore((state) => state.setUserName);
  const { isSignoutPromptOpen, handleSignoutPromptClose } = useMainContext();

  if (!isSignoutPromptOpen) return null;

  const onSignOut = () => {
    handleSignoutPromptClose();
    doSignOut();

    setTimeout(() => {
      setCurrentUser(null);
      setUserName((prev) => ({ ...prev, initials: "", fullName: "" }));
    }, 1000);
  };

  return (
    <Dialog ariaLabel="sign-out">
      <p className="text-amber-500 text-4xl py-3 px-7 border-1 border-amber-500 mx-auto rounded-full">
        !
      </p>
      <p className="text-base text-[rgb(var(--color-muted))] text-center">
        Do you want to proceed?
      </p>

      <div className="self-end flex gap-3">
        <button
          onClick={handleSignoutPromptClose}
          className="px-4 py-2 font-medium text-sm text-[rgb(var(--color-muted))] border-2 border-[rgb(var(--color-muted))] hover:bg-[rgb(var(--color-bg))] transition rounded cursor-pointer"
        >
          Cancel
        </button>
        <button
          onClick={onSignOut}
          className="px-4 py-2 font-medium text-sm text-white bg-red-600 hover:bg-red-700 rounded transition cursor-pointer"
        >
          Yes, Log Out
        </button>
      </div>
    </Dialog>
  );
};

export default SignoutPrompt;
