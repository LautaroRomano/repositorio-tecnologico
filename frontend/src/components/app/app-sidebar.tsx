"use client";
import {
  User2,
  GroupIcon,
  Home,
  MessageCircle,
  Search,
  Settings,
  LogOut,
  LogIn,
} from "lucide-react";

import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";
import { useState, useEffect } from "react";
import { cn } from "@/lib/utils";
import { useAuth } from "@/hooks/useAuth";
import { UserProfile } from "@/types/types";
import { toast } from "react-toastify";
import axios from "axios";
import { FaPlus } from "react-icons/fa";
import { usePathname } from "next/navigation";

// Menu items.
const items = [
  {
    title: "Inicio",
    url: "/",
    icon: Home,
  },
  {
    title: "Crear publicación",
    url: "/create-post",
    icon: FaPlus,
  },
  {
    title: "Buscar",
    url: "/search",
    icon: Search,
  },
  {
    title: "Mensajes",
    url: "#",
    icon: MessageCircle,
    isDisabled: true,
  },
  {
    title: "Canales",
    url: "#",
    icon: GroupIcon,
  },
  {
    title: "Ajustes",
    url: "#",
    icon: Settings,
  },
];

export function AppSidebar() {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const { isLoggedIn, requireAuth, logout } = useAuth();
  console.log("🚀 ~ AppSidebar ~ isLoggedIn:", isLoggedIn)
  const pathname = usePathname();

  const instagramStyles = {
    menuButton:
      "flex items-center px-4 py-3 transition-all hover:bg-gray-100 rounded-lg",
    icon: "h-6 w-6 mr-3",
    text: "text-sm font-medium",
  };

  const fetchData = async () => {
    if (isLoggedIn === null) return;

    setIsLoading(true);

    try {
      // Cargar datos del usuario actual
      const userResponse = await axios.get("/api/users/me", {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });

      if (userResponse.status !== 200) {
        throw new Error("Error al cargar información del usuario");
      }

      const userData = userResponse.data.user;
      setProfile(userData);
    } catch (err) {
      console.error("Error cargando datos:", err);
      toast.error("Error al cargar tus datos");
    } finally {
      setIsLoading(false);
    }
  };
  useEffect(() => {
    if (!!!isLoggedIn) return;
    requireAuth(() => fetchData());
  }, [isLoggedIn]);

  return (
    <Sidebar className="flex flex-col h-screen justify-between border-r">
      <SidebarContent>
        <SidebarGroup className="gap-y-4">
          <SidebarGroupLabel className="px-4 py-2 text-lg font-bold">
            REPOUNI
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu className="px-2">
              {items.map((item) => (
                <SidebarMenuItem key={item.title} className="mb-2">
                  <SidebarMenuButton
                    disabled={item.isDisabled}
                    asChild
                    isActive={pathname === item.url}
                    className={cn(
                      instagramStyles.menuButton,
                      item.isDisabled && "opacity-50 cursor-not-allowed",
                      pathname === item.url &&
                        "bg-sidebar-accent text-sidebar-accent-foreground"
                    )}
                  >
                    <a href={item.url}>
                      <item.icon className={instagramStyles.icon} />
                      <span className={instagramStyles.text}>{item.title}</span>
                    </a>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      {/* Footer con perfil o botón de inicio de sesión */}
      <SidebarGroup>
        <SidebarGroupContent>
          <SidebarMenu className="space-y-1 px-2">
            {isLoggedIn && profile ? (
              <SidebarMenuItem>
                <SidebarMenuButton
                  asChild
                  isActive={pathname === `/user/${profile.UserID}`}
                  className={cn(
                    instagramStyles.menuButton,
                    pathname === `/user/${profile.UserID}` &&
                      "bg-sidebar-accent text-sidebar-accent-foreground"
                  )}
                >
                  <a href={`/user/${profile.UserID}`}>
                    <User2 className={instagramStyles.icon} />
                    <span className={instagramStyles.text}>Mi Perfil</span>
                  </a>
                </SidebarMenuButton>
                <SidebarMenuButton
                  isActive={pathname === "/logout"}
                  className={cn(
                    instagramStyles.menuButton,
                    pathname === "/logout" &&
                      "bg-sidebar-accent text-sidebar-accent-foreground",
                    "text-red-700 hover:text-red-800"
                  )}
                  onClick={() => logout()}
                >
                  <LogOut
                    className={cn(instagramStyles.icon, "text-red-500")}
                  />
                  <span className={instagramStyles.text}>Cerrar Sesión</span>
                </SidebarMenuButton>
              </SidebarMenuItem>
            ) : (
              <SidebarMenuItem>
                <SidebarMenuButton
                  asChild
                  isActive={pathname === "/login"}
                  className={cn(
                    instagramStyles.menuButton,
                    pathname === "/login" &&
                      "bg-sidebar-accent text-sidebar-accent-foreground"
                  )}
                >
                  <a href="/login">
                    <LogIn className={instagramStyles.icon} />
                    <span className={instagramStyles.text}>Iniciar Sesión</span>
                  </a>
                </SidebarMenuButton>
              </SidebarMenuItem>
            )}
          </SidebarMenu>
        </SidebarGroupContent>
      </SidebarGroup>
    </Sidebar>
  );
}
