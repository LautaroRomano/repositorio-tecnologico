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
    <div className="flex  flex-col py-6 px-4 sm:px-6 items-center">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="text-center mb-8"
      >
        <h1 className="text-3xl font-bold mb-2 bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
          RED DE APUNTES
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
        <div className="w-auto md:w-[500px]">
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
