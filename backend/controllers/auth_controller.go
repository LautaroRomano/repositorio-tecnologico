package controllers

import (
	"crypto/rand"
	"encoding/hex"
	"net/http"
	"time"

	"github.com/LautaroRomano/repositorio-tecnologico/database"
	"github.com/LautaroRomano/repositorio-tecnologico/models"
	"github.com/LautaroRomano/repositorio-tecnologico/utils"
	"github.com/gin-gonic/gin"
)

func Register(c *gin.Context) {
	var req struct {
		Username    string `json:"username"`
		Email       string `json:"email"`
		Password    string `json:"password"`
		AccountName string `json:"account_name"`
		Img         string `json:"img"`
	}

	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Datos inválidos"})
		return
	}

	user := models.User{
		Username:    req.Username,
		Email:       req.Email,
		AccountName: req.AccountName,
		Img:         req.Img,
	}
	if err := user.SetPassword(req.Password); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Error al procesar la contraseña"})
		return
	}

	if err := database.DB.Create(&user).Error; err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "No se pudo registrar el usuario"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "Usuario registrado con éxito"})
}

func Login(c *gin.Context) {
	var req struct {
		Username string `json:"username"`
		Email    string `json:"email"`
		Password string `json:"password"`
	}

	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Datos inválidos"})
		return
	}

	var user models.User
	var err error

	if req.Email != "" {
		err = database.DB.Where("email = ?", req.Email).First(&user).Error
	} else {
		err = database.DB.Where("username = ?", req.Username).First(&user).Error
	}

	if err != nil {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "Email o contraseña inválidos"})
		return
	}

	if !user.CheckPassword(req.Password) {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "Email o contraseña inválidos"})
		return
	}

	token, err := utils.GenerateJWT(user.UserID)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "No se pudo generar el token"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"token": token})
}

func RequestPasswordReset(c *gin.Context) {
	var req struct {
		Email string `json:"email"`
	}

	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Datos inválidos"})
		return
	}

	var user models.User
	if err := database.DB.Where("email = ?", req.Email).First(&user).Error; err != nil {
		c.JSON(http.StatusOK, gin.H{"message": "Si el email existe, recibirás un correo con instrucciones"})
		return
	}

	// Generar token aleatorio
	tokenBytes := make([]byte, 32)
	if _, err := rand.Read(tokenBytes); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Error al generar el token"})
		return
	}
	resetToken := hex.EncodeToString(tokenBytes)

	// Guardar token en la base de datos
	user.ResetPasswordToken = resetToken
	user.ResetPasswordExpires = time.Now().Add(1 * time.Hour)
	if err := database.DB.Save(&user).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Error al procesar la solicitud"})
		return
	}

	// Enviar email
	if err := utils.SendPasswordResetEmail(user.Email, resetToken); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Error al enviar el email"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "Si el email existe, recibirás un correo con instrucciones"})
}

func ResetPassword(c *gin.Context) {
	var req struct {
		Token    string `json:"token"`
		Password string `json:"password"`
	}

	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Datos inválidos"})
		return
	}

	var user models.User
	if err := database.DB.Where("reset_password_token = ? AND reset_password_expires > ?",
		req.Token, time.Now()).First(&user).Error; err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Token inválido o expirado"})
		return
	}

	if err := user.SetPassword(req.Password); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Error al actualizar la contraseña"})
		return
	}

	// Limpiar token de reset
	user.ResetPasswordToken = ""
	user.ResetPasswordExpires = time.Time{}

	if err := database.DB.Save(&user).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Error al guardar los cambios"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "Contraseña actualizada con éxito"})
}
