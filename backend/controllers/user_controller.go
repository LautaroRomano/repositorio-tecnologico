package controllers

import (
	"net/http"

	"github.com/LautaroRomano/repositorio-tecnologico/database"
	"github.com/LautaroRomano/repositorio-tecnologico/models"

	"github.com/gin-gonic/gin"
)

func GetFollowers(c *gin.Context) {
	username := c.Param("username")
	var user models.User
	if err := database.DB.Where("username = ?", username).First(&user).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Usuario no encontrado"})
		return
	}

	var followers []models.User
	if err := database.DB.Model(&user).Association("Followers").Find(&followers); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Error al obtener seguidores"})
		return
	}

	c.JSON(http.StatusOK, followers)
}
