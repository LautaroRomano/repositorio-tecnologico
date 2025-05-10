"use client";

import { Home, Search, PlusCircle, User } from "lucide-react";
import { usePathname } from "next/navigation";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { useAuth } from "@/hooks/useAuth";
import { useState, useEffect } from "react";
import { UserProfile } from "@/types/types";
import axios from "axios";

const items = [
  {
    title: "Inicio",
    href: "/",
    icon: Home,
  },
  {
    title: "Buscar",
    href: "/search",
    icon: Search,
  },
  {
    title: "Crear",
    href: "/create-post",
    icon: PlusCircle,
  },
];

export function MobileNav() {
  const pathname = usePathname();
  const { isLoggedIn } = useAuth();
  const [profile, setProfile] = useState<UserProfile | null>(null);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const res = await axios.get("/api/users/me", {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        });
        setProfile(res.data.user);
      } catch (error) {
        console.error("Error fetching profile:", error);
      }
    };

    if (isLoggedIn) {
      fetchProfile();
    }
  }, [isLoggedIn]);

  const isActive = (href: string) => {
    if (href === "/") {
      return pathname === "/";
    }
    return pathname.startsWith(href);
  };

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 border-t bg-background md:hidden">
      <div className="flex h-16 items-center justify-around">
        {items.map((item) => {
          const active = isActive(item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex flex-col items-center justify-center gap-1 px-3 py-2 text-sm font-medium transition-colors",
                active
                  ? "text-primary"
                  : "text-muted-foreground hover:text-primary"
              )}
            >
              <item.icon className="h-5 w-5" />
              <span className="text-xs">{item.title}</span>
            </Link>
          );
        })}

        {/* Botón de perfil */}
        <Link
          href={isLoggedIn && profile ? `/user/${profile.UserID}` : "/login"}
          className={cn(
            "flex flex-col items-center justify-center gap-1 px-3 py-2 text-sm font-medium transition-colors",
            isActive(
              isLoggedIn && profile ? `/user/${profile.UserID}` : "/login"
            )
              ? "text-primary"
              : "text-muted-foreground hover:text-primary"
          )}
        >
          <User className="h-5 w-5" />
          <span className="text-xs">Perfil</span>
        </Link>
      </div>
    </nav>
  );
}
