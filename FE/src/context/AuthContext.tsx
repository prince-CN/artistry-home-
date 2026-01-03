import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import api from "@/config/api";
import { useDispatch } from "react-redux";
import { LOGIN_SUCCESS, REGISTER_SUCCESS, LOGOUT } from "@/State/Auth/ActionType";

interface User {
  id: number;
  email: string;
  name: string;
  role: string;
}

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  signIn: (email: string, password: string) => Promise<{ error: string | null }>;
  signUp: (name: string, email: string, password: string) => Promise<{ error: string | null }>;
  signOut: () => void;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  isLoading: false,
  signIn: async () => ({ error: "Auth Initializing" }),
  signUp: async () => ({ error: "Auth Initializing" }),
  signOut: () => { },
});

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const dispatch = useDispatch();

  useEffect(() => {
    try {
      const storedUser = localStorage.getItem("user");
      if (storedUser) {
        const parsedUser = JSON.parse(storedUser);
        setUser(parsedUser);
        dispatch({ type: LOGIN_SUCCESS, payload: parsedUser });
      }
    } catch (error) {
      console.error("Auth initialization failed", error);
      localStorage.removeItem("user");
      localStorage.removeItem("jwt");
    }
  }, [dispatch]);

  const signIn = async (email: string, password: string) => {
    setIsLoading(true);
    try {
      const res = await api.post(`/auth/login`, { email, password });
      const data = res.data;
      if (data.jwt) {
        localStorage.setItem("jwt", data.jwt);
      }
      if (data.user) {
        // We store the user object. api.ts interceptor will use 'jwt' key or 'user.jwt'
        localStorage.setItem("user", JSON.stringify(data.user));
        setUser(data.user);
        dispatch({ type: LOGIN_SUCCESS, payload: data.user });
      }
      return { error: null };
    } catch (err: any) {
      return { error: err.response?.data?.error || err.response?.data?.message || "Invalid credentials" };
    } finally {
      setIsLoading(false);
    }
  };

  const signUp = async (name: string, email: string, password: string) => {
    setIsLoading(true);
    try {
      const res = await api.post(`/auth/register`, { name, email, password });
      const data = res.data;
      if (data.jwt) {
        localStorage.setItem("jwt", data.jwt);
      }
      if (data.user) {
        localStorage.setItem("user", JSON.stringify(data.user));
        setUser(data.user);
        dispatch({ type: REGISTER_SUCCESS, payload: data.user });
      }
      return { error: null };
    } catch (err: any) {
      return { error: err.response?.data?.error || err.response?.data?.message || "Registration failed" };
    } finally {
      setIsLoading(false);
    }
  };

  const signOut = () => {
    setUser(null);
    localStorage.removeItem("user");
    localStorage.removeItem("jwt");
    dispatch({ type: LOGOUT });
  };

  return (
    <AuthContext.Provider value={{ user, isLoading, signIn, signUp, signOut }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  return context || {
    user: null,
    isLoading: false,
    signIn: async () => ({ error: "Auth Context Missing" }),
    signUp: async () => ({ error: "Auth Context Missing" }),
    signOut: () => { },
  };
};