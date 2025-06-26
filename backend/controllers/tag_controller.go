package controllers

import (
	"net/http"

	"github.com/LautaroRomano/repositorio-tecnologico/database"
	"github.com/LautaroRomano/repositorio-tecnologico/models"
	"github.com/gin-gonic/gin"
	"gorm.io/gorm"
)

func GetTags(c *gin.Context) {
	// Inicializar tags de ejemplo si no existen
	initializeDefaultTags(database.DB)

	var tags []models.Tag
	database.DB.Find(&tags)

	c.JSON(http.StatusOK, tags)
}

func initializeDefaultTags(db *gorm.DB) {
	// Lista de tags por defecto
	defaultTags := []string{
		"Apuntes",
		"Parciales",
		"Finales",
		"Clases",
		"Ejercicios",
		"Resúmenes",
		"Material de estudio",
		"Proyectos",
		"Trabajos prácticos",
		"Exámenes",
		"Guías",
		"Presentaciones",
		"Videos",
		"Libros",
		"Artículos",
	}

	// Verificar si ya existen tags
	var count int64
	db.Model(&models.Tag{}).Count(&count)

	// Si no hay tags, crear los por defecto
	if count == 0 {
		for _, tagName := range defaultTags {
			tag := models.Tag{
				Name: tagName,
			}
			db.Create(&tag)
		}
	}
}

// Función para recrear las tablas de tags si es necesario
func RecreateTagTables(c *gin.Context) {

	// Eliminar tablas existentes si existen
	database.DB.Migrator().DropTable(&models.PostTag{})
	database.DB.Migrator().DropTable(&models.Tag{})

	// Recrear las tablas
	database.DB.AutoMigrate(&models.Tag{}, &models.PostTag{})

	// Inicializar tags por defecto
	initializeDefaultTags(database.DB)

	c.JSON(http.StatusOK, gin.H{"message": "Tablas de tags recreadas exitosamente"})
}
