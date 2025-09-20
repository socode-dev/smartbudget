import { useAuthFormContext } from "../context/AuthFormContext";
import LoadingSpinner from "../components/ui/LoadingSpinner";
import useAuthStore from "../store/useAuthStore";
import { motion } from "framer-motion";

const ForgotPassword = () => {
  const sendResetEmail = useAuthStore((state) => state.sendResetEmail);
  const {
    forgotRegister: register,
    forgotErrors: errors,
    forgotIsSubmitting: isSubmitting,
    forgotHandleSubmit: handleSubmit,
  } = useAuthFormContext();

  const onSendResetEmail = handleSubmit((data) => {
    if (!data) return;
    sendResetEmail(data?.email);
  });

  return (
    <motion.main
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.4, ease: "easeOut" }}
      className="w-full max-w-[500px] px-2 py-8 flex flex-col items-center mx-auto"
    >
      <h2 className="text-3xl md:text-4xl text-[rgb(var(--color-muted))] text-center font-medium tracking-wide">
        Forgot your password?
      </h2>

      <p className="text-base text-[rgb(var(--color-muted))] text-center mt-4 mb-6">
        Please enter your email address below. You will receive a link to create
        new password.
      </p>

      <form className="w-full flex flex-col">
        <fieldset className=" w-full mb-4">
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
              className="w-full text-sm text-[rgb(var(--color-muted))] px-4 py-2 rounded-lg border-2 border-[rgb(var(--color-gray-border))] outline-none focus:border-[rgb(var(--color-brand))] transition"
            />
          </div>
          {errors.email && (
            <p className="text-[12px] text-red-600 mt-1">
              {errors.email.message}
            </p>
          )}
        </fieldset>

        <button
          onClick={onSendResetEmail}
          disabled={isSubmitting}
          className="self-end text-base text-center font-medium w-1/2 py-1 mt-6 rounded-lg shadow bg-[rgb(var(--color-brand))] text-white hover:scale-97 active:scale-103 disabled:opacity-50 transition cursor-pointer"
        >
          {isSubmitting ? <LoadingSpinner size={25} /> : "Continue"}
        </button>
      </form>
    </motion.main>
  );
};

export default ForgotPassword;
