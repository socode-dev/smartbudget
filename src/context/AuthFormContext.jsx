import { createContext, useContext } from "react";
import useAuthForm from "../hooks/useAuthForm";

const AuthFormContext = createContext();

export const AuthFormProvider = ({ children }) => {
  const {
    register: signupRegister,
    handleSubmit: signupHandleSubmit,
    reset: signupFormReset,
    errors: signupErrors,
    isSubmitting: signupIsSubmitting,
  } = useAuthForm("signup");

  const {
    register: loginRegister,
    handleSubmit: loginHandleSubmit,
    reset: loginFormReset,
    errors: loginErrors,
    isSubmitting: loginIsSubmitting,
  } = useAuthForm("login");

  const {
    register: forgotRegister,
    handleSubmit: forgotHandleSubmit,
    reset: forgotFormReset,
    errors: forgotErrors,
    isSubmitting: forgotIsSubmitting,
  } = useAuthForm("forgot");

  return (
    <AuthFormContext.Provider
      value={{
        signupRegister,
        signupFormReset,
        signupErrors,
        signupIsSubmitting,
        signupHandleSubmit,
        loginRegister,
        loginFormReset,
        loginErrors,
        loginIsSubmitting,
        loginHandleSubmit,
        forgotRegister,
        forgotFormReset,
        forgotErrors,
        forgotIsSubmitting,
        forgotHandleSubmit,
      }}
    >
      {children}
    </AuthFormContext.Provider>
  );
};

export const useAuthFormContext = () => useContext(AuthFormContext);
