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

// Menu items.
const items = [
  {
    title: "Inicio",
    url: "#",
    icon: Home,
  },
  {
    title: "Mensajes",
    url: "#",
    icon: MessageCircle,
    isDisabled: true,
  },
  {
    title: "Buscar",
    url: "/search",
    icon: Search,
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

  const { isLoggedIn, requireAuth } = useAuth();

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
    <Sidebar className="flex flex-col h-full justify-between border-r">
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel className="px-4 py-2 text-lg font-bold">
            REPOUNI
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu className="space-y-1 px-2">
              {items.map((item) => (
                <SidebarMenuItem key={item.title} className="mb-1">
                  <SidebarMenuButton
                    disabled={item.isDisabled}
                    asChild
                    className={cn(
                      instagramStyles.menuButton,
                      item.isDisabled && "opacity-50 cursor-not-allowed"
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
      <div className="mt-auto border-t pt-2 pb-4">
        {isLoggedIn && profile ? (
          <div className="px-4">
            <SidebarMenuItem>
              <SidebarMenuButton asChild className={instagramStyles.menuButton}>
                <a
                  href={`/user/${profile.UserID}`}
                  className="flex items-center"
                >
                  <img
                    src={profile.Avatar}
                    alt={profile.Username}
                    className="w-8 h-8 rounded-full mr-3"
                  />
                  <span className={instagramStyles.text}>Mi perfil</span>
                </a>
              </SidebarMenuButton>
            </SidebarMenuItem>

            <SidebarMenuItem>
              <SidebarMenuButton
                className={cn(
                  instagramStyles.menuButton,
                  "text-red-500 hover:bg-red-50"
                )}
                onClick={() => console.log("Cerrar sesión")}
              >
                <LogOut className={instagramStyles.icon} />
                <span className={instagramStyles.text}>Cerrar sesión</span>
              </SidebarMenuButton>
            </SidebarMenuItem>
          </div>
        ) : (
          <div className="px-4">
            <SidebarMenuItem>
              <SidebarMenuButton
                asChild
                className={cn(
                  instagramStyles.menuButton,
                  "bg-blue-500 text-white hover:bg-blue-600"
                )}
              >
                <a href="/login" className="flex items-center justify-center">
                  <LogIn className="h-5 w-5 mr-2" />
                  <span className="text-sm font-medium">Iniciar sesión</span>
                </a>
              </SidebarMenuButton>
            </SidebarMenuItem>
          </div>
        )}
      </div>
    </Sidebar>
  );
}
