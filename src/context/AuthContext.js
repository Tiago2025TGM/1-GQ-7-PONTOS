"use client";
import { createContext, useContext, useEffect, useState } from "react";
import Parse from "@/lib/parse";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const current = Parse.User.current();
    setUser(current);
    setLoading(false);
  }, []);

  const login = async (username, password) => {
    const loggedIn = await Parse.User.logIn(username, password);
    setUser(loggedIn);
    return loggedIn;
  };

  const register = async (username, email, password) => {
    const newUser = new Parse.User();
    newUser.set("username", username);
    newUser.set("email", email);
    newUser.set("password", password);
    const registered = await newUser.signUp();
    setUser(registered);
    return registered;
  };

  const logout = async () => {
    await Parse.User.logOut();
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
