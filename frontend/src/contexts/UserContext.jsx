// src/context/UserContext.js
import { createContext, useContext, useState } from "react";

const UserContext = createContext();

export const UserProvider = ({ children }) => {
  const [user, setUser] = useState(null); // null or { token, user }

  const login = (userData) => {
    setUser(userData);
    localStorage.setItem("token", userData.token); // optional
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem("token"); // optional
  };

  return (
    <UserContext.Provider value={{ user, login, logout }}>
      {children}
    </UserContext.Provider>
  );
};

// Custom hook for easy access
export const useUser = () => useContext(UserContext);
