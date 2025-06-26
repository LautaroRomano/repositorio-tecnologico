"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Post, Tag } from "@/types/types";
import PostCard from "@/components/app/post-card";
import { useAuth } from "@/hooks/useAuth";
import { TagMultiSelect } from "@/components/ui/tag-multi-select";
import axios from "axios";
import { toast } from "react-toastify";

interface SearchFilters {
  query: string;
  career: string;
  tags: Tag[];
}

export default function SearchPage() {
  const [posts, setPosts] = useState<Post[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [filters, setFilters] = useState<SearchFilters>({
    query: "",
    career: "all",
    tags: [],
  });
  const [careers, setCareers] = useState<{ CareerID: number; Name: string }[]>(
    []
  );
  const { requireAuth } = useAuth();

  // Cargar carreras
  useEffect(() => {
    const fetchCareers = async () => {
      try {
        const res = await axios.get("/api/careers");
        setCareers(res.data.careers);
      } catch (error) {
        console.error("Error fetching careers:", error);
      }
    };

    fetchCareers();
  }, []);

  const handleSearch = async () => {
    setIsLoading(true);
    try {
      const queryParams = new URLSearchParams();
      if (filters.query) queryParams.append("q", filters.query);
      if (filters.career && filters.career !== "all")
        queryParams.append("career", filters.career);
      if (filters.tags.length > 0) {
        const tagIds = filters.tags.map(tag => tag.TagID);
        queryParams.append("tag_ids", JSON.stringify(tagIds));
      }

      const res = await axios.get(
        `/api/posts/search?${queryParams.toString()}`,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );

      setPosts(res.data.posts || []);
    } catch (error) {
      console.error("Error searching posts:", error);
      toast.error("Error al buscar publicaciones");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="container mx-auto py-6 px-4">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="text-center mb-8"
      >
        <h1 className="text-3xl font-bold mb-2 bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
          Búsqueda Avanzada
        </h1>
        <p className="text-gray-500">Encuentra publicaciones específicas</p>
      </motion.div>

      <Card className="p-6 mb-8">
        <div className="space-y-4">
          {/* Barra de búsqueda */}
          <div className="flex gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <Input
                type="text"
                placeholder="Buscar publicaciones..."
                className="pl-10"
                value={filters.query}
                onChange={(e) =>
                  setFilters((prev) => ({ ...prev, query: e.target.value }))
                }
                onKeyPress={(e) => e.key === "Enter" && handleSearch()}
              />
            </div>
            <Button
              onClick={handleSearch}
              className="bg-gradient-to-r from-blue-600 to-purple-600"
              disabled={isLoading}
            >
              {isLoading ? "Buscando..." : "Buscar"}
            </Button>
          </div>

          {/* Filtros */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium mb-1 block">Carrera</label>
              <Select
                value={filters.career}
                onValueChange={(value) =>
                  setFilters((prev) => ({ ...prev, career: value }))
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Seleccionar carrera" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todas las carreras</SelectItem>
                  {careers.map((career) => (
                    <SelectItem
                      key={career.CareerID}
                      value={career.CareerID.toString()}
                    >
                      {career.Name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Etiquetas */}
            <div>
              <label className="text-sm font-medium mb-1 block">Etiquetas</label>
              <TagMultiSelect
                selectedTags={filters.tags}
                onTagsChange={(tags) => setFilters((prev) => ({ ...prev, tags }))}
                placeholder="Buscar y seleccionar etiquetas..."
              />
            </div>
          </div>
        </div>
      </Card>

      {/* Resultados */}
      <div className="space-y-6">
        {posts.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-gray-500">No se encontraron publicaciones</p>
          </div>
        ) : (
          posts.map((post) => (
            <PostCard key={post.PostID} post={post} requireAuth={requireAuth} />
          ))
        )}
      </div>
    </div>
  );
}
