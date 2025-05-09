"use client";
import { Suspense, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "react-toastify";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { motion } from "framer-motion";
import { Post } from "@/types/types";
import PostSkeleton from "@/components/app/post-skeleton";
import PostCard from "@/components/app/post-card";
import { useAuth } from "@/hooks/useAuth";
import axios from "axios";

function HomePage() {
  const [posts, setPosts] = useState<Post[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(false);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [page, setPage] = useState(1);
  const router = useRouter();
  const { requireAuth } = useAuth();

  const fetchPosts = async ({ page = 1 }) => {
    try {
      setIsLoading(true);
      // setPosts(mockPosts);

      const res = await axios.get("/api/posts", {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });

      if (res.status !== 200) {
        throw new Error("Error fetching posts");
      }
      const data = res.data;
      if (data.error) {
        throw new Error(data.error);
      }

      if (!data?.posts || data.posts.length === 0)
        toast.info("No hay publicaciones para mostrar");
      else setPosts(data.posts);
      setError(false);
    } catch (err) {
      console.error("Error loading mock posts:", err);
      setError(true);
      toast.error("Error al cargar las publicaciones");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchPosts({ page: 1 });
  }, []);

  const handleCreatePost = () => {
    requireAuth(() => router.push("/create-post"));
  };

  const handleLoadMore = () => {
    requireAuth(() => {
      if (isLoadingMore || !hasMore) return;
      setIsLoadingMore(true);
      setPage((prevPage) => prevPage + 1);

      axios
        .get(`/api/posts?page=${page + 1}`, {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        })
        .then((res) => {
          if (res.status !== 200) {
            throw new Error("Error fetching posts");
          }
          const data = res.data;
          if (data.error) {
            throw new Error(data.error);
          }

          if (!data?.posts || data.posts.length === 0) {
            setHasMore(false);
            toast.info("No hay más publicaciones para mostrar");
          } else {
            setPosts((prevPosts) => [...prevPosts, ...data.posts]);
          }
        })
        .catch((err) => {
          console.error("Error loading more posts:", err);
          toast.error("Error al cargar más publicaciones");
        })
        .finally(() => {
          setIsLoadingMore(false);
        });
    });
  };

  return (
    <div className="max-w-2xl mx-auto py-6 px-4 sm:px-6">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="text-center mb-8"
      >
        <h1 className="text-3xl font-bold mb-2 bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
          Repositorio Tecnológico
        </h1>
        <p className="text-gray-500">Explora las publicaciones más recientes</p>
      </motion.div>

      {isLoading ? (
        <>
          <PostSkeleton />
          <PostSkeleton />
          <PostSkeleton />
        </>
      ) : error ? (
        <div className="text-center p-8">
          <div className="text-red-500 mb-4 text-lg">
            No se pudieron cargar las publicaciones
          </div>
          <Button
            onClick={() => window.location.reload()}
            className="bg-gradient-to-r from-blue-600 to-purple-600"
          >
            Intentar nuevamente
          </Button>
        </div>
      ) : posts.length === 0 ? (
        <Card className="p-8 text-center border-0 shadow-md">
          <div className="text-gray-500 mb-4">
            No hay publicaciones para mostrar
          </div>
          <Button
            onClick={handleCreatePost}
            className="bg-gradient-to-r from-blue-600 to-purple-600"
          >
            Crear la primera publicación
          </Button>
        </Card>
      ) : (
        <div>
          {posts.map((post) => (
            <PostCard key={post.PostID} post={post} requireAuth={requireAuth} />
          ))}

          <div className="flex justify-center my-6">
            <Button
              onClick={handleLoadMore}
              className="bg-gradient-to-r from-blue-600 to-purple-600"
              disabled={isLoadingMore || !hasMore}
            >
              {isLoadingMore ? "Cargando..." : "Cargar más"}
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}

export default function Home() {
  return (
    <Suspense
      fallback={
        <div className="flex justify-center items-center w-full h-screen">
          <div className="w-64">
            <Progress value={85} className="h-1" />
            <p className="text-center mt-2 text-sm text-gray-500">
              Cargando...
            </p>
          </div>
        </div>
      }
    >
      <HomePage />
    </Suspense>
  );
}

// Mock data
const mockPosts: Post[] = [
  {
    PostID: 1,
    UserID: 1,
    Content:
      "Acabo de completar un proyecto increíble sobre inteligencia artificial. ¿Alguien interesado en colaborar en futuras investigaciones sobre aprendizaje profundo?",
    CreatedAt: new Date(2023, 6, 15, 14, 30).toISOString(),
    Tags: ["AI", "Deep Learning", "Proyectos"],
    UniversityID: 1,
    CareerID: 2,
    University: { Name: "Universidad Tecnológica" },
    Career: { Name: "Ingeniería Informática" },
    User: {
      UserID: 1,
      Username: "maria_tech",
      Avatar: "https://i.pravatar.cc/150?img=1",
    },
    Comments: [
      {
        CommentID: 1,
        PostID: 1,
        UserID: 2,
        Content:
          "¡Esto suena muy interesante! Me encantaría saber más sobre tu proyecto.",
        CreatedAt: new Date(2023, 6, 15, 15, 45).toISOString(),
        User: {
          UserID: 2,
          Username: "carlos_dev",
          Avatar: "https://i.pravatar.cc/150?img=2",
        },
      },
      {
        CommentID: 2,
        PostID: 1,
        UserID: 3,
        Content:
          "¿Qué tecnologías utilizaste para implementar el aprendizaje profundo?",
        CreatedAt: new Date(2023, 6, 15, 16, 20).toISOString(),
        User: {
          UserID: 3,
          Username: "ana_ia",
          Avatar: "https://i.pravatar.cc/150?img=3",
        },
      },
    ],
    Likes: [
      {
        LikeID: 1,
        PostID: 1,
        UserID: 2,
        LikedAt: new Date(2023, 6, 15, 15, 10).toISOString(),
        User: {
          UserID: 2,
          Username: "carlos_dev",
          Avatar: "https://i.pravatar.cc/150?img=2",
        },
      },
      {
        LikeID: 2,
        PostID: 1,
        UserID: 3,
        LikedAt: new Date(2023, 6, 15, 16, 5).toISOString(),
        User: {
          UserID: 3,
          Username: "ana_ia",
          Avatar: "https://i.pravatar.cc/150?img=3",
        },
      },
    ],
    Files: [
      {
        FileID: 1,
        FileURL: "https://images.unsplash.com/photo-1488590528505-98d2b5aba04b",
        FileType: "image/jpeg",
        PostID: 1,
      },
    ],
  },
  {
    PostID: 2,
    UserID: 3,
    Content:
      "Comparto mi investigación sobre algoritmos genéticos aplicados a problemas de optimización. Adjunto el PDF con los resultados preliminares.",
    CreatedAt: new Date(2023, 6, 10, 11, 15).toISOString(),
    Tags: ["Algoritmos", "Investigación", "Optimización"],
    UniversityID: 2,
    CareerID: 1,
    University: { Name: "Universidad Nacional" },
    Career: { Name: "Ciencias de la Computación" },
    User: {
      UserID: 3,
      Username: "ana_ia",
      Avatar: "https://i.pravatar.cc/150?img=3",
    },
    Comments: [
      {
        CommentID: 3,
        PostID: 2,
        UserID: 1,
        Content: "Excelente trabajo, Ana. Los resultados son muy prometedores.",
        CreatedAt: new Date(2023, 6, 10, 12, 30).toISOString(),
        User: {
          UserID: 1,
          Username: "maria_tech",
          Avatar: "https://i.pravatar.cc/150?img=1",
        },
      },
    ],
    Likes: [
      {
        LikeID: 4,
        PostID: 2,
        UserID: 1,
        LikedAt: new Date(2023, 6, 10, 11, 45).toISOString(),
        User: {
          UserID: 1,
          Username: "maria_tech",
          Avatar: "https://i.pravatar.cc/150?img=1",
        },
      },
    ],
    Files: [
      {
        FileID: 2,
        FileURL: "/documentos/algoritmos_geneticos.pdf",
        FileType: "application/pdf",
        PostID: 2,
      },
    ],
  },
  {
    PostID: 3,
    UserID: 4,
    Content:
      "He desarrollado una nueva biblioteca para procesamiento de datos en tiempo real. ¿Alguien quiere probarla y darme feedback?",
    CreatedAt: new Date(2023, 6, 5, 9, 45).toISOString(),
    Tags: ["Open Source", "Desarrollo", "Big Data"],
    UniversityID: 1,
    CareerID: 2,
    University: { Name: "Universidad Tecnológica" },
    Career: { Name: "Ingeniería Informática" },
    User: {
      UserID: 4,
      Username: "pedro_code",
      Avatar: "https://i.pravatar.cc/150?img=4",
    },
    Comments: [],
    Likes: [
      {
        LikeID: 6,
        PostID: 3,
        UserID: 2,
        LikedAt: new Date(2023, 6, 5, 10, 30).toISOString(),
        User: {
          UserID: 2,
          Username: "carlos_dev",
          Avatar: "https://i.pravatar.cc/150?img=2",
        },
      },
    ],
    Files: [],
  },
];
