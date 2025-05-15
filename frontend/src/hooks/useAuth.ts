import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import { toast } from "react-toastify";
import { User } from "@/types/types";
export function useAuth() {
  const [isLoggedIn, setIsLoggedIn] = useState<boolean | null>(null);
  const [me, setMe] = useState<User | null>(null);
  const router = useRouter();

  useEffect(() => {
    // Comprueba si hay un token en localStorage
    const token = localStorage.getItem("token");
    setIsLoggedIn(!!token);
  }, []);

  const requireAuth = (action: () => void) => {
    if (isLoggedIn) {
      action();
    } else {
      toast.info("Inicia sesión para continuar", { autoClose: 3000 });
      router.push("/login");
    }
  };

  const logout = () => {
    localStorage.removeItem("token");
    setIsLoggedIn(false);
    toast.success("Cerraste sesión correctamente", { autoClose: 2000 });
    //router.push("/login");
  };

  const handleLogin = (token: string, me: User) => {
    localStorage.setItem("token", token);
    setIsLoggedIn(true);
    setMe(me);
    toast.success("Bienvenido de nuevo!", { autoClose: 2000 });
    setTimeout(() => router.push("/"), 1000);
  };

  return { isLoggedIn, requireAuth, logout, handleLogin, me };
}
