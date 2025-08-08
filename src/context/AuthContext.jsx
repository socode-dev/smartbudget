import { createContext, useContext, useState } from "react";
import useAuthForm from "../hooks/useAuthForm";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);

  const signupForm = useAuthForm("signup");
  const loginForm = useAuthForm("login");

  const {
    register: signupRegister,
    handleSubmit: signupHandleSubmit,
    formState: { errors: signupErrors },
  } = signupForm;

  const {
    register: loginRegister,
    handleSubmit: loginHandleSubmit,
    formState: { errors: loginErrors },
  } = loginForm;

  const onLogin = loginHandleSubmit((data) => {
    console.log(data);
  });

  const onSignup = signupHandleSubmit((data) => {
    console.log(data);
  });

  return (
    <AuthContext.Provider
      value={{
        user,
        onLogin,
        onSignup,
        signupRegister,
        signupErrors,
        loginRegister,
        loginErrors,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuthContext = () => useContext(AuthContext);
