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

function HomePage() {
  const [posts, setPosts] = useState<Post[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const fetchPosts = async () => {
      try {
        setIsLoading(true);

        // Simulating API delay
        await new Promise((resolve) => setTimeout(resolve, 1500));

        setPosts(mockPosts);
        setError(false);
      } catch (err) {
        console.error("Error loading mock posts:", err);
        setError(true);
        toast.error("Error al cargar las publicaciones");
      } finally {
        setIsLoading(false);
      }
    };

    fetchPosts();
  }, []);

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
            onClick={() => router.push("/create-post")}
            className="bg-gradient-to-r from-blue-600 to-purple-600"
          >
            Crear la primera publicación
          </Button>
        </Card>
      ) : (
        <div>
          {posts.map((post) => (
            <PostCard key={post.PostID} post={post} />
          ))}

          <div className="flex justify-center my-6">
            <Button
              variant="outline"
              className="border-blue-300 text-blue-700 hover:bg-blue-50"
            >
              Cargar más
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
