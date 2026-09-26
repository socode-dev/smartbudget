import { useState } from "react";
import { useAuthFormContext } from "../context/AuthFormContext";
import useAuthStore from "../store/useAuthStore";
import AuthFormShell from "../components/auth/AuthFormShell";
import AuthFooter from "../components/auth/AuthFooter";
import Alert from "../components/ui/Alert";
import Button from "../components/ui/Button";
import FormField from "../components/ui/FormField";
import Input from "../components/ui/Input";

const ForgotPassword = () => {
  const sendResetEmail = useAuthStore((state) => state.sendResetEmail);
  const [error, setError] = useState("");
  const {
    forgotRegister: register,
    forgotErrors: errors,
    forgotIsSubmitting: isSubmitting,
    forgotHandleSubmit: handleSubmit,
  } = useAuthFormContext();

  const onSendResetEmail = handleSubmit(async (data) => {
    setError("");
    const result = await sendResetEmail(data.email);
    if (!result?.ok)
      setError(
        result?.error || "The reset email could not be sent. Please try again.",
      );
  });

  return (
    <AuthFormShell
      title="Forgot your password?"
      description="Please enter your email address below. You will receive a link to create a new password."
    >
      {error && <Alert className="mb-4">{error}</Alert>}
      <form noValidate onSubmit={onSendResetEmail} aria-busy={isSubmitting}>
        <fieldset disabled={isSubmitting} className="min-w-0 space-y-6">
          <FormField
            id="reset-email"
            label="Email Address"
            required
            error={errors.email}
          >
            {(fieldProps) => (
              <Input
                {...register("email")}
                {...fieldProps}
                type="email"
                autoComplete="email"
                placeholder="Enter your email"
              />
            )}
          </FormField>
          <Button
            type="submit"
            className="w-full"
            loading={isSubmitting}
            loadingText="Sending reset link..."
          >
            Continue
          </Button>
        </fieldset>
      </form>
      <AuthFooter to="/login" linkText="Back to login" />
    </AuthFormShell>
  );
};

export default ForgotPassword;
