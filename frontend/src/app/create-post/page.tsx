"use client";
import { useState, useRef, FormEvent, ChangeEvent, useEffect } from "react";
import { useRouter } from "next/navigation";
import { toast } from "react-toastify";
import {
  FaTimes,
  FaUpload,
  FaGraduationCap,
  FaUniversity,
} from "react-icons/fa";
import { MdSend } from "react-icons/md";
import axios from "axios";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardFooter,
} from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { motion } from "framer-motion";
import { useAuth } from "@/hooks/useAuth";
import { Progress } from "@/components/ui/progress";
import { TagMultiSelect } from "@/components/ui/tag-multi-select";
import { Tag, University, Career } from "@/types/types";

interface FileWithPreview {
  file: File;
  id: string;
  preview: string;
}

export default function CreatePostPage() {
  const router = useRouter();
  const [content, setContent] = useState("");
  const [universities, setUniversities] = useState<University[]>([]);
  const [universityId, setUniversityId] = useState<string>("");
  const [careers, setCareers] = useState<Career[]>([]);
  const [careerId, setCareerId] = useState<string>("");
  const [files, setFiles] = useState<FileWithPreview[]>([]);
  const [selectedTags, setSelectedTags] = useState<Tag[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { isLoggedIn } = useAuth();

  const handleChangeUniversityId = (id: string) => {
    setUniversityId(id);
    // Filtrar las carreras según la universidad seleccionada
    const filteredCareers = universities.find((uni) => uni.UniversityID === parseInt(id))?.Careers || [];
    setCareers(filteredCareers);
  };

  const handleFetchUniversities = async () => {
    try {
      const res = await axios.get("/api/universities");
      setUniversities(res.data.universities);
    } catch (error) {
      console.error("Error al obtener universidades:", error);
      toast.error("Error al obtener universidades");
    }
  };

  // Redirigir si el usuario no está logueado
  useEffect(() => {
    if (isLoggedIn === false) {
      toast.info("Necesitas iniciar sesión para crear una publicación");
      router.push("/login");
    } else {
      handleFetchUniversities();
    }
  }, [isLoggedIn, router]);

  // Manejar la subida de archivos
  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    const selectedFiles = e.target.files;
    if (!selectedFiles) return;

    const newFilesArray: FileWithPreview[] = Array.from(selectedFiles).map(
      (file) => ({
        file,
        id: Math.random().toString(36).substring(2, 11),
        preview: URL.createObjectURL(file),
      })
    );

    setFiles((prevFiles) => [...prevFiles, ...newFilesArray]);

    // Limpiar el input de archivo para permitir seleccionar el mismo archivo nuevamente
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  // Eliminar un archivo
  const removeFile = (id: string) => {
    setFiles((prevFiles) => {
      const updatedFiles = prevFiles.filter((file) => file.id !== id);

      // Liberar URL de objeto para evitar fugas de memoria
      prevFiles.forEach((file) => {
        if (file.id === id) {
          URL.revokeObjectURL(file.preview);
        }
      });

      return updatedFiles;
    });
  };

  // Enviar el formulario
  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();

    // Validaciones
    if (!content.trim()) {
      toast.error("El contenido no puede estar vacío");
      return;
    }

    if (!universityId) {
      toast.error("Debes seleccionar una universidad");
      return;
    }

    if (!careerId) {
      toast.error("Debes seleccionar una carrera");
      return;
    }

    setIsLoading(true);
    setError("");

    try {
      // Crear un FormData para enviar archivos
      const formData = new FormData();
      formData.append("content", content);
      formData.append("career_id", careerId);
      formData.append("university_id", universityId);

      // Agregar tags si existen
      if (selectedTags.length > 0) {
        const tagIds = selectedTags.map((tag) => tag.TagID);
        formData.append("tag_ids", JSON.stringify(tagIds));
      }

      // Agregar los archivos al FormData
      if (files.length > 0) {
        files.forEach((fileObj) => {
          formData.append("files[]", fileObj.file);
        });
      }

      // Simular una demora para efectos de demostración
      await new Promise((resolve) => setTimeout(resolve, 1500));

      const res = await axios.post("/api/posts/", formData, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });

      // Ejecutar en caso de error
      if (res.status !== 200 && res.status !== 201) {
        throw new Error("Error al crear la publicación");
      }

      // Simulamos éxito
      toast.success("¡Publicación creada con éxito!");

      // Redirigir a la página principal
      setTimeout(() => {
        router.push("/");
      }, 1000);
    } catch (err: any) {
      console.error("Error al crear la publicación:", err);
      setError(err.response?.data?.message || "Error al crear la publicación");
      toast.error("Ocurrió un error al crear la publicación");
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoggedIn === null || isLoggedIn === false) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="text-center w-64">
          <p className="mb-2">Verificando autenticación...</p>
          <Progress value={80} className="h-2 animate-pulse" />
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto py-10 px-4">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="text-center mb-8"
      >
        <h1 className="text-3xl font-bold mb-2 bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
          Crear Publicación
        </h1>
        <p className="text-gray-500">Comparte contenido con la comunidad</p>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.2 }}
      >
        <form onSubmit={handleSubmit}>
          <Card className="shadow-lg border-0 overflow-hidden">
            <div className="h-2 bg-gradient-to-r from-blue-500 to-purple-600"></div>

            <CardHeader className="pb-2 pt-6">
              <h2 className="text-xl font-medium text-center">
                Nueva publicación
              </h2>
            </CardHeader>

            <CardContent className="space-y-6 pt-4">
              {/* Contenido del post */}
              <div className="space-y-2">
                <Label htmlFor="content">Contenido</Label>
                <Textarea
                  id="content"
                  placeholder="¿Qué quieres compartir?"
                  rows={5}
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  className={`resize-none focus:ring-2 focus:ring-blue-500 transition-all ${
                    error ? "border-red-500" : ""
                  }`}
                />
              </div>

              {/* Universidad */}
              <div className="space-y-2">
                <Label htmlFor="university" className="flex items-center gap-2">
                  <FaUniversity className="text-gray-500" />
                  Universidad
                </Label>
                <Select
                  value={universityId}
                  onValueChange={(value) => handleChangeUniversityId(value)}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Selecciona una universidad" />
                  </SelectTrigger>
                  <SelectContent>
                    {universities.map((university) => (
                      <SelectItem
                        key={university.UniversityID}
                        value={university.UniversityID.toString()}
                      >
                        {university.Name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Carrera */}
              <div className="space-y-2">
                <Label htmlFor="career" className="flex items-center gap-2">
                  <FaGraduationCap className="text-gray-500" />
                  Carrera
                </Label>
                <Select
                  value={careerId}
                  onValueChange={(value) => setCareerId(value)}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Selecciona una carrera" />
                  </SelectTrigger>
                  <SelectContent>
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

              {/* Etiquetas / Tags */}
              <div className="space-y-2">
                <Label htmlFor="tags">Etiquetas</Label>
                <TagMultiSelect
                  selectedTags={selectedTags}
                  onTagsChange={setSelectedTags}
                  placeholder="Buscar y seleccionar etiquetas..."
                />
              </div>

              {/* Archivos */}
              <div className="space-y-2">
                <Label htmlFor="files" className="mb-2">
                  Archivos
                </Label>
                <div
                  className={`border-2 border-dashed rounded-lg p-6 text-center cursor-pointer hover:bg-gray-50 transition-colors ${
                    files.length ? "border-blue-300" : "border-gray-300"
                  }`}
                  onClick={() => fileInputRef.current?.click()}
                >
                  <FaUpload className="mx-auto h-10 w-10 text-gray-400" />
                  <p className="mt-2 text-sm text-gray-500">
                    Haz clic para seleccionar archivos o arrastra y suelta
                  </p>
                  <p className="text-xs text-gray-400">
                    PNG, JPG, PDF, DOC hasta 10MB
                  </p>
                  <input
                    ref={fileInputRef}
                    type="file"
                    id="files"
                    multiple
                    onChange={handleFileChange}
                    className="hidden"
                  />
                </div>

                {files.length > 0 && (
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mt-3">
                    {files.map((file) => (
                      <div key={file.id} className="relative group">
                        <div className="h-24 border rounded-md overflow-hidden flex items-center justify-center">
                          {file.file.type.includes("image") ? (
                            <img
                              src={file.preview}
                              alt="Preview"
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <div className="text-gray-500 text-center p-2">
                              <div className="text-3xl mb-1">
                                {file.file.type.includes("pdf")
                                  ? "PDF"
                                  : file.file.type.includes("doc")
                                  ? "DOC"
                                  : "FILE"}
                              </div>
                              <p className="text-xs truncate max-w-full">
                                {file.file.name}
                              </p>
                            </div>
                          )}
                        </div>
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            removeFile(file.id);
                          }}
                          className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1 shadow-md opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          <FaTimes size={10} />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </CardContent>

            <CardFooter className="flex justify-end space-x-2 bg-gray-50 px-6 py-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => router.back()}
                className="border-gray-300"
                disabled={isLoading}
              >
                Cancelar
              </Button>
              <Button
                type="submit"
                className="bg-gradient-to-r from-blue-600 to-purple-600 hover:opacity-90 transition-all"
                disabled={isLoading || !content.trim() || !careerId}
              >
                {isLoading ? (
                  <span className="flex items-center">
                    <svg
                      className="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                    >
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                      ></circle>
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                      ></path>
                    </svg>
                    Publicando...
                  </span>
                ) : (
                  <span className="flex items-center gap-2">
                    <MdSend /> Publicar
                  </span>
                )}
              </Button>
            </CardFooter>
          </Card>
        </form>
      </motion.div>
    </div>
  );
}
