"use client";
import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import { toast } from "react-toastify";
import axios from "axios";
import {
  FaUserCircle,
  FaGraduationCap,
  FaUniversity,
  FaCalendarAlt,
  FaRegThumbsUp,
} from "react-icons/fa";
import { RiFileListLine } from "react-icons/ri";
import { motion } from "framer-motion";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Post, User } from "@/types/types";
import PostCard from "@/components/app/post-card";
import PostSkeleton from "@/components/app/post-skeleton";
import { useAuth } from "@/hooks/useAuth";

interface UserProfile extends User {
  JoinDate?: string;
  University?: { Name: string };
  Career?: { Name: string };
  PostsCount?: number;
  LikesReceived?: number;
}

export default function UserProfilePage() {
  const router = useRouter();
  const params = useParams();
  const userId = params?.id as string;
  const { requireAuth, isLoggedIn } = useAuth();

  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [userPosts, setUserPosts] = useState<Post[]>([]);
  const [activeTab, setActiveTab] = useState("publicaciones");
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(false);
  const [isSelf, setIsSelf] = useState(false);

  useEffect(() => {
    const fetchUserData = async () => {
      if (!userId) return;

      setIsLoading(true);
      setError(false);

      try {
        // Obtener datos del usuario
        const userResponse = await axios.get(`/api/users/${userId}`, {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        });

        if (userResponse.status !== 200) {
          throw new Error("Error al cargar información del usuario");
        }

        setUserProfile(userResponse.data.user);

        // Verificar si es el propio perfil
        const token = localStorage.getItem("token");
        if (token) {
          try {
            const decoded = JSON.parse(atob(token.split(".")[1]));
            setIsSelf(decoded.user_id === parseInt(userId));
          } catch (e) {
            console.error("Error decodificando token:", e);
          }
        }

        // Obtener publicaciones del usuario
        const postsResponse = await axios.get(`/api/users/${userId}/posts`, {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        });

        if (postsResponse.status !== 200) {
          throw new Error("Error al cargar publicaciones");
        }

        setUserPosts(postsResponse.data.posts);
      } catch (err) {
        console.error("Error cargando datos del usuario:", err);
        setError(true);
        toast.error("Error al cargar la información del usuario");
      } finally {
        setIsLoading(false);
      }
    };

    fetchUserData();
  }, [userId]);

  const formatDate = (dateString?: string) => {
    if (!dateString) return "";
    const date = new Date(dateString);
    return new Intl.DateTimeFormat("es-ES", {
      year: "numeric",
      month: "long",
      day: "numeric",
    }).format(date);
  };

  if (isLoading) {
    return (
      <div className="max-w-2xl mx-auto py-8 px-4">
        <div className="mb-8">
          <div className="flex items-center gap-4">
            <div className="w-24 h-24 rounded-full bg-gray-200 animate-pulse"></div>
            <div className="flex-1">
              <div className="h-6 bg-gray-200 rounded w-48 mb-2 animate-pulse"></div>
              <div className="h-4 bg-gray-200 rounded w-72 animate-pulse"></div>
            </div>
          </div>
        </div>

        <div className="mb-6">
          <div className="h-10 bg-gray-200 rounded mb-6 animate-pulse"></div>
          <PostSkeleton />
          <PostSkeleton />
        </div>
      </div>
    );
  }

  if (error || !userProfile) {
    return (
      <div className="max-w-2xl mx-auto py-8 px-4 text-center">
        <div className="text-red-500 mb-4 text-lg">
          No se pudo cargar la información del usuario
        </div>
        <Button
          onClick={() => router.back()}
          className="bg-gradient-to-r from-blue-600 to-purple-600"
        >
          Volver
        </Button>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto py-8 px-4">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="mb-8"
      >
        <Card className="overflow-hidden border-0 shadow-lg">
          <div className="h-2 bg-gradient-to-r from-blue-500 to-purple-600"></div>

          <CardContent className="p-6">
            <div className="flex flex-col md:flex-row gap-6 items-center md:items-start">
              <Avatar className="w-24 h-24 border-4 border-white shadow-lg">
                <AvatarImage src={userProfile.Avatar || ""} />
                <AvatarFallback className="bg-blue-100 text-blue-800 text-2xl">
                  {userProfile.Username?.substring(0, 2).toUpperCase() || (
                    <FaUserCircle />
                  )}
                </AvatarFallback>
              </Avatar>

              <div className="flex-1 text-center md:text-left">
                <h1 className="text-2xl font-bold mb-2">
                  {userProfile.Username}
                </h1>

                <div className="flex flex-wrap gap-3 mb-4 justify-center md:justify-start">
                  {userProfile.University?.Name && (
                    <Badge
                      variant="secondary"
                      className="flex items-center gap-1 py-1"
                    >
                      <FaUniversity />
                      {userProfile.University.Name}
                    </Badge>
                  )}

                  {userProfile.Career?.Name && (
                    <Badge
                      variant="secondary"
                      className="flex items-center gap-1 py-1"
                    >
                      <FaGraduationCap />
                      {userProfile.Career.Name}
                    </Badge>
                  )}

                  {userProfile.JoinDate && (
                    <Badge
                      variant="outline"
                      className="flex items-center gap-1 py-1"
                    >
                      <FaCalendarAlt />
                      Miembro desde {formatDate(userProfile.JoinDate)}
                    </Badge>
                  )}
                </div>

                <div className="grid grid-cols-2 gap-4 max-w-xs mx-auto md:mx-0">
                  <div className="bg-gray-50 p-3 rounded-lg text-center">
                    <div className="text-xl font-bold text-blue-600">
                      {userProfile.PostsCount || 0}
                    </div>
                    <div className="text-xs text-gray-500 flex items-center justify-center gap-1">
                      <RiFileListLine /> Publicaciones
                    </div>
                  </div>
                  <div className="bg-gray-50 p-3 rounded-lg text-center">
                    <div className="text-xl font-bold text-blue-600">
                      {userProfile.LikesReceived || 0}
                    </div>
                    <div className="text-xs text-gray-500 flex items-center justify-center gap-1">
                      <FaRegThumbsUp /> Likes recibidos
                    </div>
                  </div>
                </div>

                {isSelf && (
                  <Button
                    className="mt-4 bg-gradient-to-r from-blue-600 to-purple-600"
                    onClick={() => router.push("/perfil/editar")}
                  >
                    Editar perfil
                  </Button>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.2 }}
      >
        <Tabs defaultValue="publicaciones" className="mb-6">
          <TabsList className="w-full grid grid-cols-2">
            <TabsTrigger
              value="publicaciones"
              onClick={() => setActiveTab("publicaciones")}
            >
              Publicaciones
            </TabsTrigger>
            <TabsTrigger
              value="populares"
              onClick={() => setActiveTab("populares")}
            >
              Más populares
            </TabsTrigger>
          </TabsList>

          <TabsContent value="publicaciones" className="mt-4 space-y-6">
            {userPosts.length === 0 ? (
              <Card className="p-8 text-center border-0 shadow-md">
                <div className="text-gray-500 mb-4">
                  {isSelf
                    ? "No has realizado publicaciones aún"
                    : "Este usuario no tiene publicaciones"}
                </div>
                {isSelf && (
                  <Button
                    onClick={() => router.push("/create-post")}
                    className="bg-gradient-to-r from-blue-600 to-purple-600"
                  >
                    Crear mi primera publicación
                  </Button>
                )}
              </Card>
            ) : (
              userPosts.map((post) => (
                <PostCard
                  key={post.PostID}
                  post={post}
                  requireAuth={requireAuth}
                />
              ))
            )}
          </TabsContent>

          <TabsContent value="populares" className="mt-4 space-y-6">
            {userPosts.length === 0 ? (
              <Card className="p-8 text-center border-0 shadow-md">
                <div className="text-gray-500 mb-4">
                  No hay publicaciones populares para mostrar
                </div>
              </Card>
            ) : (
              // Mostrar posts ordenados por número de likes
              [...userPosts]
                .sort((a, b) => b.Likes.length - a.Likes.length)
                .slice(0, 5) // Mostrar solo los 5 más populares
                .map((post) => (
                  <PostCard
                    key={post.PostID}
                    post={post}
                    requireAuth={requireAuth}
                  />
                ))
            )}
          </TabsContent>
        </Tabs>
      </motion.div>
    </div>
  );
}
