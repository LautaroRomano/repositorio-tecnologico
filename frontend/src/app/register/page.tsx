"use client";
import { Suspense, useEffect, useState } from "react";
import { FaCheckCircle, FaUser, FaLock, FaEnvelope } from "react-icons/fa";
import { MdPersonAdd } from "react-icons/md";
import NextLink from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { toast } from "react-toastify";
import axios from "axios";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardFooter,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { motion } from "framer-motion";

function RegisterPage() {
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [passwordConfirm, setPasswordConfirm] = useState("");
  const [accountName, setAccountName] = useState("");
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    const param1 = searchParams.get("error");
    if (param1) toast.error(param1, { autoClose: 5000 });
  }, [searchParams]);

  // Validación de correo electrónico
  const isValidEmail = (email: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  // Validación de la fortaleza de la contraseña
  const isStrongPassword = (password: string) => {
    return password.length >= 8; // Requisito mínimo simplificado
  };

  const validateForm = () => {
    if (username.length < 3) {
      setErrorMessage("El nombre de usuario debe tener al menos 3 caracteres");
      setError(true);
      return false;
    }

    if (accountName.length < 3) {
      setErrorMessage(
        "El nombre de la cuenta debe tener al menos 3 caracteres"
      );
      setError(true);
      return false;
    }

    if (!isValidEmail(email)) {
      setErrorMessage("Ingresa un correo electrónico válido");
      setError(true);
      return false;
    }

    if (!isStrongPassword(password)) {
      setErrorMessage("La contraseña debe tener al menos 8 caracteres");
      setError(true);
      return false;
    }

    if (password !== passwordConfirm) {
      setErrorMessage("Las contraseñas no coinciden");
      setError(true);
      return false;
    }

    return true;
  };

  const handleSubmit = async () => {
    // Validamos primero
    if (!validateForm()) return;

    setIsLoading(true);
    setError(false);

    try {
      const res = await axios.post("/api/auth/register", {
        account_name: accountName,
        username: username,
        email: email,
        password: password,
        img: "",
      });

      if (res.status === 200 || res.status === 201) {
        setSuccess(true);
        toast.success("¡Registro exitoso! Bienvenido.", {
          autoClose: 2000,
        });
        setTimeout(() => router.push("/login"), 2000);
        return;
      }

      setErrorMessage(
        "Error en el registro. Intenta con otro nombre de usuario o correo."
      );
      setError(true);
    } catch (error: any) {
      setError(true);
      if (
        error.response &&
        error.response.data &&
        error.response.data.message
      ) {
        setErrorMessage(error.response.data.message);
        toast.error(error.response.data.message, { autoClose: 5000 });
      } else {
        setErrorMessage("Ocurrió un error. Intenta nuevamente.");
        toast.error("Ocurrió un error. Intenta nuevamente.", {
          autoClose: 5000,
        });
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="w-full max-w-md mx-auto py-10 px-4">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="text-center mb-8"
      >
        <h1 className="text-3xl font-bold mb-2 bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
          Crear Cuenta
        </h1>
        <p className="text-gray-500">
          Regístrate para acceder a todos los recursos
        </p>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.2 }}
      >
        <Card className="shadow-lg border-0 overflow-hidden">
          <div className="h-2 bg-gradient-to-r from-blue-500 to-purple-600"></div>

          <CardHeader className="pb-2 pt-6">
            <h2 className="text-xl font-medium text-center">
              Información de registro
            </h2>
          </CardHeader>

          <CardContent className="space-y-4 pt-4">
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                @
              </div>
              <Input
                placeholder="Nombre de usuario (debe ser unico)"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className={`pl-10 border-gray-300 focus:ring-2 focus:ring-blue-500 transition-all ${
                  error ? "border-red-500" : ""
                }`}
              />
            </div>

            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <FaUser className="text-gray-400" />
              </div>
              <Input
                type="text"
                placeholder="Nombre de la cuenta"
                value={accountName}
                onChange={(e) => setAccountName(e.target.value)}
                className={`pl-10 border-gray-300 focus:ring-2 focus:ring-blue-500 transition-all ${
                  error ? "border-red-500" : ""
                }`}
                onKeyDown={(e) => {
                  if (e.key === "Enter") handleSubmit();
                }}
              />
            </div>

            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <FaEnvelope className="text-gray-400" />
              </div>
              <Input
                type="email"
                placeholder="Correo electrónico"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className={`pl-10 border-gray-300 focus:ring-2 focus:ring-blue-500 transition-all ${
                  error ? "border-red-500" : ""
                }`}
              />
            </div>

            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <FaLock className="text-gray-400" />
              </div>
              <Input
                type="password"
                placeholder="Contraseña"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className={`pl-10 border-gray-300 focus:ring-2 focus:ring-blue-500 transition-all ${
                  error ? "border-red-500" : ""
                }`}
              />
            </div>

            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <FaLock className="text-gray-400" />
              </div>
              <Input
                type="password"
                placeholder="Confirmar contraseña"
                value={passwordConfirm}
                onChange={(e) => setPasswordConfirm(e.target.value)}
                className={`pl-10 border-gray-300 focus:ring-2 focus:ring-blue-500 transition-all ${
                  error ? "border-red-500" : ""
                }`}
              />
            </div>

            {error && (
              <div className="bg-red-50 p-3 rounded-md text-sm text-red-700 flex items-center">
                <svg
                  className="w-5 h-5 mr-2"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    fillRule="evenodd"
                    d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
                    clipRule="evenodd"
                  />
                </svg>
                {errorMessage}
              </div>
            )}

            <Button
              className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:opacity-90 transition-all"
              disabled={
                username.length === 0 ||
                email.length === 0 ||
                password.length === 0 ||
                passwordConfirm.length === 0 ||
                isLoading ||
                success
              }
              onClick={handleSubmit}
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
                  Procesando...
                </span>
              ) : success ? (
                <span className="flex items-center justify-center">
                  <FaCheckCircle className="mr-2" />
                  ¡Listo! Redirigiendo...
                </span>
              ) : (
                <span className="flex items-center justify-center">
                  <MdPersonAdd className="mr-2" size={18} />
                  Crear cuenta
                </span>
              )}
            </Button>
          </CardContent>

          <CardFooter className="flex flex-col space-y-4 bg-gray-50 px-6 py-4">
            <NextLink
              className="flex justify-center items-center gap-2 text-sm font-medium hover:text-blue-700 transition-colors"
              href="/login"
            >
              ¿Ya tienes cuenta?{" "}
              <span className="text-blue-600">Inicia sesión aquí</span>
            </NextLink>
          </CardFooter>
        </Card>
      </motion.div>

      <div className="mt-6 text-center text-sm text-gray-500">
        <p>
          Al registrarte, aceptas nuestros{" "}
          <NextLink href="/terms" className="text-blue-600 hover:underline">
            términos y condiciones
          </NextLink>{" "}
          y{" "}
          <NextLink href="/privacy" className="text-blue-600 hover:underline">
            política de privacidad
          </NextLink>
        </p>
      </div>
    </div>
  );
}

export default function Register() {
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
      <RegisterPage />
    </Suspense>
  );
}
