"use client";
import { useState, useEffect, useRef, ChangeEvent } from "react";
import { useRouter } from "next/navigation";
import { toast } from "react-toastify";
import axios from "axios";
import {
  FaUser,
  FaUniversity,
  FaGraduationCap,
  FaCamera,
  FaKey,
} from "react-icons/fa";
import { motion } from "framer-motion";
import {
  Card,
  CardContent,
  CardHeader,
  CardFooter,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Progress } from "@/components/ui/progress";
import { useAuth } from "@/hooks/useAuth";
import { Career, University, UserProfile } from "@/types/types";

export default function EditProfilePage() {
  const router = useRouter();
  const { isLoggedIn, requireAuth } = useAuth();
  const [profile, setProfile] = useState<UserProfile | null>(null);

  const [username, setUsername] = useState("");
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const [universityId, setUniversityId] = useState<string>("");
  const [careerId, setCareerId] = useState<string>("");

  const [universities, setUniversities] = useState<University[]>([]);
  const [careers, setCareers] = useState<Career[]>([]);

  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState("");

  const [showPasswordDialog, setShowPasswordDialog] = useState(false);
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [passwordError, setPasswordError] = useState("");

  const fileInputRef = useRef<HTMLInputElement>(null);

  // Redirección si el usuario no está autenticado
  useEffect(() => {
    if (isLoggedIn === false) {
      toast.info("Debes iniciar sesión para acceder a esta página");
      router.push("/login");
    }
  }, [isLoggedIn, router]);

  // Cargar datos del usuario y opciones de selección
  const fetchData = async () => {
    if (isLoggedIn === null) return;

    setIsLoading(true);
    setError("");

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
      setUsername(userData.Username || "");
      setAvatarPreview(userData.Avatar || "");
      setUniversityId(userData.UniversityID?.toString() || "none");
      setCareerId(userData.CareerID?.toString() || "none");

      // Cargar universidades
      const univResponse = await axios.get("/api/universities");
      setUniversities(univResponse.data.universities || []);

      // Cargar carreras
      const careerResponse = await axios.get("/api/careers");
      setCareers(careerResponse.data.careers || []);
    } catch (err) {
      console.error("Error cargando datos:", err);
      setError("Error al cargar tus datos. Intenta nuevamente.");
      toast.error("Error al cargar tus datos");
    } finally {
      setIsLoading(false);
    }
  };
  useEffect(() => {
    if (isLoggedIn === null) return;
    requireAuth(() => fetchData());
  }, [isLoggedIn]);

  // Manejar cambio de archivo de avatar
  const handleAvatarChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validar tipo de archivo
    if (!file.type.startsWith("image/")) {
      console.log("Tipo de archivo no válido:", file.type);
      toast.error("Por favor selecciona una imagen válida");
      return;
    }

    // Validar tamaño (máximo 4MB)
    if (file.size > 4 * 1024 * 1024) {
      console.log("Tamaño de archivo demasiado grande:", file.size);
      toast.error("La imagen es demasiado grande. Máximo 4MB");
      return;
    }

    setAvatarFile(file);

    // Crear preview
    const reader = new FileReader();
    reader.onloadend = () => {
      setAvatarPreview(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  // Enviar formulario de perfil
  const handleSubmit = async () => {
    if (!profile) return;

    setIsSaving(true);
    setError("");

    try {
      const formData = new FormData();
      formData.append("username", username);

      if (avatarFile) {
        formData.append("avatar", avatarFile);
      }

      if (universityId && universityId !== "none") {
        formData.append("university_id", universityId);
      }

      if (careerId && careerId !== "none") {
        formData.append("career_id", careerId);
      }

      const response = await axios.put(`/api/users/me`, formData, {
        headers: {
          "Content-Type": "multipart/form-data",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });

      if (response.status === 200) {
        toast.success("Perfil actualizado correctamente");
        setTimeout(() => router.push(`/user/${profile.UserID}`), 1000);
      } else {
        throw new Error("Error al actualizar perfil");
      }
    } catch (err: any) {
      console.error("Error actualizando perfil:", err);
      setError(err.response?.data?.error || "Error al actualizar tu perfil");
      toast.error("Error al guardar los cambios");
    } finally {
      setIsSaving(false);
    }
  };

  // Cambiar contraseña
  const handleChangePassword = async () => {
    if (newPassword !== confirmPassword) {
      setPasswordError("Las contraseñas no coinciden");
      return;
    }

    if (newPassword.length < 8) {
      setPasswordError("La contraseña debe tener al menos 8 caracteres");
      return;
    }

    setPasswordError("");

    try {
      const response = await axios.put(
        "/api/users/me/password",
        {
          current_password: currentPassword,
          new_password: newPassword,
        },
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );

      if (response.status === 200) {
        toast.success("Contraseña actualizada correctamente");
        setShowPasswordDialog(false);
        // Limpiar campos
        setCurrentPassword("");
        setNewPassword("");
        setConfirmPassword("");
      } else {
        throw new Error("Error al cambiar contraseña");
      }
    } catch (err: any) {
      console.error("Error al cambiar contraseña:", err);
      setPasswordError(
        err.response?.data?.error || "Error al cambiar contraseña"
      );
    }
  };

  if (isLoggedIn === null || isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[70vh]">
        <Progress value={85} className="w-64 h-1 mb-4" />
        <p className="text-gray-500">Cargando tu perfil...</p>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto py-8 px-4">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="text-center mb-8"
      >
        <h1 className="text-3xl font-bold mb-2 bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
          Editar Perfil
        </h1>
        <p className="text-gray-500">Actualiza tu información personal</p>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.2 }}
      >
        <Card className="overflow-hidden border-0 shadow-lg">
          <div className="h-2 bg-gradient-to-r from-blue-500 to-purple-600"></div>

          <CardHeader className="pb-4 pt-6">
            <div className="flex flex-col items-center">
              <div className="relative group mb-4">
                <Avatar className="h-24 w-24 border-4 border-white shadow-md">
                  <AvatarImage src={avatarPreview || ""} />
                  <AvatarFallback className="bg-blue-100 text-blue-800 text-2xl">
                    {username?.substring(0, 2).toUpperCase() || <FaUser />}
                  </AvatarFallback>
                </Avatar>
                <div
                  className="absolute bottom-0 right-0 p-2 rounded-full bg-blue-600 text-white cursor-pointer hover:bg-blue-700 transition-colors"
                  onClick={() => fileInputRef.current?.click()}
                >
                  <FaCamera size={14} />
                </div>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={handleAvatarChange}
                />
              </div>

              <h2 className="text-xl font-semibold">Información Personal</h2>
            </div>
          </CardHeader>

          <CardContent className="space-y-6">
            {error && (
              <div className="bg-red-50 p-3 rounded-md text-sm text-red-700">
                {error}
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="username" className="flex items-center gap-2">
                <FaUser className="text-gray-500" />
                Nombre de usuario
              </Label>
              <Input
                readOnly={true}
                id="username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="university" className="flex items-center gap-2">
                <FaUniversity className="text-gray-500" />
                Universidad
              </Label>
              <Select value={universityId} onValueChange={setUniversityId}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecciona universidad" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">Sin especificar</SelectItem>
                  {universities.map((univ) => (
                    <SelectItem
                      key={univ.UniversityID}
                      value={univ.UniversityID.toString()}
                    >
                      {univ.Name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="career" className="flex items-center gap-2">
                <FaGraduationCap className="text-gray-500" />
                Carrera
              </Label>
              <Select
                value={careerId}
                onValueChange={setCareerId}
                disabled={!universityId}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecciona carrera" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">Sin especificar</SelectItem>
                  {careers
                    .filter(
                      (career) => career.UniversityID === parseInt(universityId)
                    )
                    .map((career) => (
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

            <Button
              variant="outline"
              className="w-full mt-4 flex items-center justify-center gap-2 border-gray-300"
              onClick={() => setShowPasswordDialog(true)}
            >
              <FaKey className="text-gray-500" />
              Cambiar contraseña
            </Button>
          </CardContent>

          <CardFooter className="flex justify-end space-x-2 bg-gray-50 px-6 py-4">
            <Button
              variant="outline"
              onClick={() => router.back()}
              className="border-gray-300"
              disabled={isSaving}
            >
              Cancelar
            </Button>
            <Button
              onClick={handleSubmit}
              className="bg-gradient-to-r from-blue-600 to-purple-600"
              disabled={isSaving || !username}
            >
              {isSaving ? (
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
                  Guardando...
                </span>
              ) : (
                "Guardar cambios"
              )}
            </Button>
          </CardFooter>
        </Card>
      </motion.div>

      {/* Diálogo para cambiar contraseña */}
      <Dialog open={showPasswordDialog} onOpenChange={setShowPasswordDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Cambiar contraseña</DialogTitle>
          </DialogHeader>

          <div className="space-y-4 py-4">
            {passwordError && (
              <div className="bg-red-50 p-3 rounded-md text-sm text-red-700">
                {passwordError}
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="current-password">Contraseña actual</Label>
              <Input
                id="current-password"
                type="password"
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="new-password">Nueva contraseña</Label>
              <Input
                id="new-password"
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="confirm-password">
                Confirmar nueva contraseña
              </Label>
              <Input
                id="confirm-password"
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
              />
            </div>
          </div>

          <DialogFooter className="sm:justify-end">
            <Button
              variant="outline"
              onClick={() => setShowPasswordDialog(false)}
            >
              Cancelar
            </Button>
            <Button
              onClick={handleChangePassword}
              className="bg-gradient-to-r from-blue-600 to-purple-600"
              disabled={!currentPassword || !newPassword || !confirmPassword}
            >
              Actualizar contraseña
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
