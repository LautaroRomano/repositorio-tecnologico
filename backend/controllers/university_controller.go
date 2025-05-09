package controllers

import (
	"github.com/LautaroRomano/repositorio-tecnologico/database"
	"github.com/LautaroRomano/repositorio-tecnologico/models"
	"github.com/gin-gonic/gin"
)

func GetUniversities(c *gin.Context) {

	var universities []models.University
	result := database.DB.Model(&models.University{}).
		Preload("Careers").
		Order("name ASC").
		Find(&universities)

	if result.Error != nil {
		c.JSON(500, gin.H{"error": "Error al obtener las universidades"})
		return
	}

	c.JSON(200, gin.H{
		"universities": universities,
	})
}

func GetUniversityByID(c *gin.Context) {
	c.JSON(200, gin.H{
		"message": "University details",
	})
}

func GetCareersByUniversityID(c *gin.Context) {
	c.JSON(200, gin.H{
		"message": "List of careers for the university",
	})
}

func GetCareers(c *gin.Context) {

	var careers []models.Career
	result := database.DB.Model(&models.Career{}).
		Order("name ASC").
		Find(&careers)

	if result.Error != nil {
		c.JSON(500, gin.H{"error": "Error al obtener las carreras"})
		return
	}

	c.JSON(200, gin.H{
		"careers": careers,
	})
}

func GetCareerById(c *gin.Context) {
	c.JSON(200, gin.H{
		"message": "Career details",
	})
}
