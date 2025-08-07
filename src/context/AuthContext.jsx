import { createContext, useContext, useState } from "react";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  const handleLogin = (e) => {
    e.preventDefault();
  };

  const handleSignup = (e) => {
    e.preventDefault();
  };

  return (
    <AuthContext.Provider
      value={{ user, isLoggedIn, handleLogin, handleSignup }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuthContext = () => useContext(AuthContext);
