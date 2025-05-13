package main

import (
	"log"
	"os"

	"github.com/LautaroRomano/repositorio-tecnologico/config"
	"github.com/LautaroRomano/repositorio-tecnologico/database"
	"github.com/LautaroRomano/repositorio-tecnologico/routes"
	"github.com/LautaroRomano/repositorio-tecnologico/utils"
	"github.com/gin-gonic/gin"
	"github.com/joho/godotenv"
)

func main() {
	err := godotenv.Load()
	if err != nil {
		log.Fatal("Error cargando .env")
	}

	database.Connect()
	database.Migrate()

	router := gin.Default()
	router.RedirectTrailingSlash = false

	routes.SetupAuthRoutes(router)
	routes.UserRoutes(router)
	routes.PostRoutes(router)
	routes.UniversityRoutes(router)
	routes.CareerRoutes(router)

	utils.InitResendClient(os.Getenv("RESEND_API_KEY"))

	// Inicializar Cloudinary
	err = config.SetupCloudinary()
	if err != nil {
		log.Fatalf("Error configurando Cloudinary: %v", err)
	}

	// Aquí irán tus rutas (por ahora un ping)
	router.GET("/ping", func(c *gin.Context) {
		c.JSON(200, gin.H{"message": "pong"})
	})

	port := os.Getenv("PORT")
	if port == "" {
		port = "8080"
	}

	router.Run(":" + port)

}
