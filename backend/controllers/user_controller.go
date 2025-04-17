package controllers

import (
	"net/http"
	"strconv"

	"github.com/LautaroRomano/repositorio-tecnologico/database"
	"github.com/LautaroRomano/repositorio-tecnologico/models"

	"github.com/gin-gonic/gin"
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
	userID, exists := c.Get("user_id")
	if !exists {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "Usuario no autenticado"})
		return
	}

	// Reutilizar la lógica existente pasando el ID como parámetro
	c.Params = append(c.Params, gin.Param{Key: "id", Value: strconv.Itoa(userID.(int))})
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
