import { useAuthFormContext } from "../context/AuthFormContext";
import { useAuthContext } from "../context/AuthContext";
import LoadingSpinner from "../components/ui/LoadingSpinner";

const ForgotPassword = () => {
  const {
    forgotRegister: register,
    forgotErrors: errors,
    forgotIsSubmitting: isSubmitting,
  } = useAuthFormContext();
  const { sendResetEmail } = useAuthContext();

  return (
    <main className="w-full max-w-[500px] p-4 flex flex-col items-center mx-auto">
      <h2 className="text-3xl text-[rgb(var(--color-muted))] text-center font-medium tracking-wide">
        Forgot your password?
      </h2>

      <p className="text-sm text-[rgb(var(--color-muted))] text-center mt-2 mb-6">
        Please enter your email address below. You will receive a link to create
        new password.
      </p>

      <form className="w-11/12 flex flex-col">
        <fieldset className=" w-full mb-3">
          <div className="flex flex-col gap-1">
            <label
              htmlFor="email"
              className="text-base text-[rgb(var(--color-muted))] font-medium"
            >
              Email Address
            </label>
            <input
              {...register("email")}
              type="email"
              id="email"
              placeholder="1234567890@gmail.com"
              className="w-full text-xs text-[rgb(var(--color-muted))] px-4 py-1 rounded-lg border-2 border-[rgb(var(--color-gray-border))] outline-none focus:border-[rgb(var(--color-brand))] transition"
            />
          </div>
          {errors.email && (
            <p className="text-[12px] text-red-600 mt-1">
              {errors.email.message}
            </p>
          )}
        </fieldset>

        <button
          onClick={sendResetEmail}
          disabled={isSubmitting}
          className="self-start text-sm text-center font-medium w-1/2 py-1 mt-6 rounded-lg shadow bg-[rgb(var(--color-brand))] text-white hover:scale-97 active:scale-103 disabled:opacity-50 transition cursor-pointer"
        >
          {isSubmitting ? <LoadingSpinner size={25} /> : "Continue"}
        </button>
      </form>
    </main>
  );
};

export default ForgotPassword;
