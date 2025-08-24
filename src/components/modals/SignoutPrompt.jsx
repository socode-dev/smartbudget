import { useAuthContext } from "../../context/AuthContext";
import { useMainContext } from "../../context/MainContext";
import { doSignOut } from "../../firebase/auth";

const SignoutPrompt = () => {
  const { setCurrentUser, setUserName } = useAuthContext();
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
    <>
      {/* Modal Backdrop */}
      <div className="fixed top-0 left-0 w-full h-full bg-black/30 z-60" />
      {/* Centered Modal Box */}
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="signout-prompt"
        className="fixed top-[50%] left-[50%] -translate-[50%] z-70 bg-[rgb(var(--color-bg-card))] w-11/12 max-w-[400px] p-4 rounded-lg flex flex-col gap-8"
      >
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
            Yes! Log Out
          </button>
        </div>
      </div>
    </>
  );
};

export default SignoutPrompt;
