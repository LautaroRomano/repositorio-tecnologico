package controllers

import (
	"context"
	"errors"
	"fmt"
	"net/http"
	"strconv"

	"github.com/LautaroRomano/repositorio-tecnologico/config"
	"github.com/LautaroRomano/repositorio-tecnologico/database"
	"github.com/LautaroRomano/repositorio-tecnologico/models"
	"github.com/cloudinary/cloudinary-go/v2/api/uploader"
	"github.com/gin-gonic/gin"
	"golang.org/x/crypto/bcrypt"
)

// GetUserProfile obtiene información detallada del perfil de un usuario
func GetUserProfile(c *gin.Context) {
	userID, err := strconv.Atoi(c.Param("id"))
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "ID de usuario inválido"})
		return
	}

	var user models.User
	if err := database.DB.First(&user, userID).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Usuario no encontrado"})
		return
	}

	// Obtener información de universidad si existe
	var universityName string
	if user.UniversityID > 0 {
		database.DB.Model(&models.University{}).
			Select("name").
			Where("university_id = ?", user.UniversityID).
			Pluck("name", &universityName)
	}

	// Obtener información de carrera si existe
	var careerName string
	if user.CareerID > 0 {
		database.DB.Model(&models.Career{}).
			Select("name").
			Where("career_id = ?", user.CareerID).
			Pluck("name", &careerName)
	}

	// Contar número de publicaciones del usuario
	var postsCount int64
	database.DB.Model(&models.Post{}).Where("user_id = ?", userID).Count(&postsCount)

	// Contar likes recibidos en todas sus publicaciones
	var likesReceived int64
	database.DB.Model(&models.PostLike{}).
		Joins("JOIN posts ON post_likes.post_id = posts.post_id").
		Where("posts.user_id = ?", userID).
		Count(&likesReceived)

	// Construir respuesta con información completa
	userResponse := gin.H{
		"UserID":        user.UserID,
		"Username":      user.Username,
		"Avatar":        user.Img,
		"JoinDate":      user.CreatedAt,
		"PostsCount":    postsCount,
		"LikesReceived": likesReceived,
		"UniversityID":  user.UniversityID,
		"CareerID":      user.CareerID,
	}

	// Añadir información de universidad si existe
	if universityName != "" {
		userResponse["University"] = gin.H{"Name": universityName}
	}

	// Añadir información de carrera si existe
	if careerName != "" {
		userResponse["Career"] = gin.H{"Name": careerName}
	}

	c.JSON(http.StatusOK, gin.H{
		"user": userResponse,
	})
}

// GetUserPosts obtiene las publicaciones de un usuario específico
func GetUserPosts(c *gin.Context) {
	userID, err := strconv.Atoi(c.Param("id"))
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "ID de usuario inválido"})
		return
	}

	// Parámetros de paginación
	page := 1
	pageSize := 10

	pageParam := c.DefaultQuery("page", "1")
	pageNum, err := strconv.Atoi(pageParam)
	if err == nil && pageNum > 0 {
		page = pageNum
	}

	offset := (page - 1) * pageSize

	// Obtener publicaciones del usuario con sus relaciones
	var posts []models.Post
	result := database.DB.Model(&models.Post{}).
		Where("user_id = ?", userID).
		Preload("User").
		Preload("Comments").
		Preload("Comments.User").
		Preload("Likes").
		Preload("Likes.User").
		Order("created_at DESC").
		Limit(pageSize).
		Offset(offset).
		Find(&posts)

	if result.Error != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Error al obtener las publicaciones"})
		return
	}

	// Construir respuesta con el mismo formato que GetPosts
	var response []gin.H

	for _, post := range posts {
		var postUser models.User
		database.DB.First(&postUser, post.UserID)

		// Buscar información de Universidad
		var universityName string
		database.DB.Model(&models.University{}).
			Select("name").
			Where("university_id = ?", post.UniversityID).
			Pluck("name", &universityName)

		// Buscar información de Carrera
		var careerName string
		database.DB.Model(&models.Career{}).
			Select("name").
			Where("career_id = ?", post.CareerID).
			Pluck("name", &careerName)

		// Buscar archivos asociados al post
		var files []models.PostFile
		database.DB.Where("post_id = ?", post.PostID).Find(&files)

		// Construir estructura de usuario usando datos recuperados explícitamente
		userResponse := gin.H{
			"UserID":   postUser.UserID,
			"Username": postUser.Username,
			"Avatar":   postUser.Img,
		}

		// Construir estructura de comentarios
		commentsResponse := []gin.H{}
		for _, comment := range post.Comments {
			commentUser := gin.H{
				"UserID":   comment.User.UserID,
				"Username": comment.User.Username,
				"Avatar":   comment.User.Img,
			}

			commentsResponse = append(commentsResponse, gin.H{
				"CommentID": comment.CommentID,
				"PostID":    comment.PostID,
				"UserID":    comment.UserID,
				"Content":   comment.Content,
				"CreatedAt": comment.CreatedAt,
				"User":      commentUser,
			})
		}

		// Construir estructura de likes
		likesResponse := []gin.H{}
		for _, like := range post.Likes {
			likeUser := gin.H{
				"UserID":   like.User.UserID,
				"Username": like.User.Username,
				"Avatar":   like.User.Img,
			}

			likesResponse = append(likesResponse, gin.H{
				"LikeID":  like.LikeID,
				"PostID":  like.PostID,
				"UserID":  like.UserID,
				"LikedAt": like.LikedAt,
				"User":    likeUser,
			})
		}

		// Construir estructura de archivos
		filesResponse := []gin.H{}
		for _, file := range files {
			filesResponse = append(filesResponse, gin.H{
				"FileID":   file.FileID,
				"FileURL":  file.FileURL,
				"FileType": file.FileType,
				"PostID":   file.PostID,
			})
		}

		// Armar respuesta completa de cada post
		postResponse := gin.H{
			"PostID":       post.PostID,
			"UserID":       post.UserID,
			"Content":      post.Content,
			"CreatedAt":    post.CreatedAt,
			"Tags":         post.Tags,
			"UniversityID": post.UniversityID,
			"CareerID":     post.CareerID,
			"University":   gin.H{"Name": universityName},
			"Career":       gin.H{"Name": careerName},
			"User":         userResponse,
			"Comments":     commentsResponse,
			"Likes":        likesResponse,
			"Files":        filesResponse,
		}

		response = append(response, postResponse)
	}

	// Contar total de posts para paginación
	var totalPosts int64
	database.DB.Model(&models.Post{}).Where("user_id = ?", userID).Count(&totalPosts)

	c.JSON(http.StatusOK, gin.H{
		"posts": response,
		"pagination": gin.H{
			"current_page": page,
			"total_pages":  (int(totalPosts) + pageSize - 1) / pageSize,
			"page_size":    pageSize,
			"total_items":  totalPosts,
		},
	})
}

// GetCurrentUser obtiene la información del usuario autenticado
func GetCurrentUser(c *gin.Context) {
	// Obtener ID del usuario desde el token (implementado en middleware de autenticación)
	userID, exists := c.Get("userID")
	if !exists {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "Usuario no autenticado"})
		return
	}

	// Convertir userID a string independientemente de si es uint o int
	var userIDStr string
	switch v := userID.(type) {
	case int:
		userIDStr = strconv.Itoa(v)
	case uint:
		userIDStr = strconv.FormatUint(uint64(v), 10)
	default:
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Tipo de ID de usuario no válido"})
		return
	}

	// Reutilizar la lógica existente pasando el ID como parámetro
	c.Params = append(c.Params, gin.Param{Key: "id", Value: userIDStr})
	GetUserProfile(c)
}

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

func UpdateUserProfile(c *gin.Context) {
	// Obtener ID del usuario desde el token (implementado en middleware de autenticación)
	userID, exists := c.Get("userID")
	if !exists {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "Usuario no autenticado"})
		return
	}

	// Procesar múltiples archivos
	form, err := c.MultipartForm()
	if err == nil &&
		form.File != nil &&
		form.File["avatar"] != nil && len(form.File["avatar"]) > 0 &&
		form.Value != nil &&
		form.Value["university_id"] != nil && len(form.Value["university_id"]) > 0 &&
		form.Value["career_id"] != nil && len(form.Value["career_id"]) > 0 {

		file := form.File["avatar"][0]
		university_id := form.Value["university_id"][0]
		career_id := form.Value["career_id"][0]

		userIDStr := strconv.FormatUint(uint64(userID.(uint)), 10)
		userID, err := strconv.Atoi(userIDStr)

		if err != nil {
			c.JSON(http.StatusBadRequest, gin.H{"error": "ID de usuario inválido"})
			return
		}

		// Abrir el archivo
		openedFile, err := file.Open()
		if err != nil {
			c.JSON(500, gin.H{"error": fmt.Sprintf("No se pudo abrir el archivo %s: %v", file.Filename, err)})
			return
		}
		defer openedFile.Close()

		// Determinar el tipo de archivo basado en la extensión
		fileType := determineFileType(file.Filename)

		if fileType != "image/jpeg" {
			c.JSON(400, gin.H{"error": "El archivo debe ser una imagen"})
			return
		}

		// Subir a Cloudinary
		ctx := context.Background()
		uploadParams := uploader.UploadParams{
			Folder: "avatars",
		}

		result, err := config.Cld.Upload.Upload(ctx, openedFile, uploadParams)
		if err != nil {
			c.JSON(500, gin.H{"error": fmt.Sprintf("Error al subir archivo %s: %v", file.Filename, err)})
			return
		}

		// Guardar URL del avatar en la base de datos
		var user models.User
		if err := database.DB.First(&user, userID).Error; err != nil {
			c.JSON(http.StatusNotFound, gin.H{"error": "Usuario no encontrado"})
			return
		}
		user.Img = result.SecureURL

		// Convertir university_id de string a uint
		universityID, err := strconv.Atoi(university_id)
		if err != nil {
			c.JSON(http.StatusBadRequest, gin.H{"error": "ID de universidad inválido"})
			return
		}
		user.UniversityID = uint(universityID)

		// Convertir career_id de string a uint
		careerID, err := strconv.Atoi(career_id)
		if err != nil {
			c.JSON(http.StatusBadRequest, gin.H{"error": "ID de carrera inválido"})
			return
		}
		user.CareerID = uint(careerID)
		if err := database.DB.Save(&user).Error; err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Error al actualizar el avatar"})
			return
		}
		c.JSON(http.StatusOK, gin.H{"message": "Usuario actualizado con éxito", "user": user})
		return
	} else {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Datos de entrada inválidos"})
	}
}

// ChangePassword handles changing user password
func ChangePassword(c *gin.Context) {
	var passwordChange struct {
		CurrentPassword string `json:"current_password" binding:"required"`
		NewPassword     string `json:"new_password" binding:"required"`
	}

	if err := c.ShouldBindJSON(&passwordChange); err != nil {
		c.JSON(400, gin.H{"error": "Invalid input format"})
		return
	}

	// Get the user ID from the token/session
	userID, exists := c.Get("userID")
	if !exists {
		c.JSON(401, gin.H{"error": "Authentication required"})
		return
	}

	// Verify current password and update to new password
	// This is where you would implement your password change logic
	err := verifyAndUpdatePassword(userID.(uint), passwordChange.CurrentPassword, passwordChange.NewPassword)
	if err != nil {
		c.JSON(400, gin.H{"error": err.Error()})
		return
	}

	c.JSON(200, gin.H{"message": "Password changed successfully"})
}

// Helper function to verify current password and update to new password
func verifyAndUpdatePassword(userID uint, currentPassword, newPassword string) error {
	// Get the user from the database
	var user models.User
	if err := database.DB.First(&user, userID).Error; err != nil {
		return err
	}

	// Verify the current password
	if err := bcrypt.CompareHashAndPassword([]byte(user.PasswordHash), []byte(currentPassword)); err != nil {
		return errors.New("current password is incorrect")
	}

	// Hash the new password
	hashedPassword, err := bcrypt.GenerateFromPassword([]byte(newPassword), bcrypt.DefaultCost)
	if err != nil {
		return errors.New("error processing new password")
	}

	// Update the password in the database
	result := database.DB.Model(&user).Update("password_hash", string(hashedPassword))
	if result.Error != nil {
		return result.Error
	}

	return nil
}
