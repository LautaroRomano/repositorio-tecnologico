package controllers

import (
	"net/http"
	"time"

	"github.com/LautaroRomano/repositorio-tecnologico/database"
	"github.com/LautaroRomano/repositorio-tecnologico/models"
	"github.com/gin-gonic/gin"
)

// CreateChannelPost crea un nuevo post en un canal
func CreateChannelPost(c *gin.Context) {
	channelID := c.Param("id")
	userID := c.MustGet("userID").(uint)

	// Verificar si el usuario es miembro del canal
	var member models.ChannelMember
	if err := database.DB.Where("channel_id = ? AND user_id = ?", channelID, userID).First(&member).Error; err != nil {
		c.JSON(http.StatusForbidden, gin.H{"error": "No tienes acceso a este canal"})
		return
	}

	var input struct {
		Content string   `json:"content" binding:"required"`
		Tags    []string `json:"tags"`
	}

	if err := c.ShouldBindJSON(&input); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Datos inválidos"})
		return
	}

	post := models.ChannelPost{
		ChannelID: uint(parseUint(channelID)),
		UserID:    userID,
		Content:   input.Content,
		Tags:      input.Tags,
		CreatedAt: time.Now(),
		UpdatedAt: time.Now(),
	}

	if err := database.DB.Create(&post).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Error al crear el post"})
		return
	}

	// Cargar la información del usuario que creó el post
	database.DB.Preload("User").First(&post, post.PostID)

	c.JSON(http.StatusCreated, gin.H{
		"message": "Post creado exitosamente",
		"post":    post,
	})
}

// GetChannelPosts obtiene los posts de un canal
func GetChannelPosts(c *gin.Context) {
	channelID := c.Param("id")
	userID := c.MustGet("userID").(uint)

	// Verificar si el usuario es miembro del canal
	var member models.ChannelMember
	if err := database.DB.Where("channel_id = ? AND user_id = ?", channelID, userID).First(&member).Error; err != nil {
		c.JSON(http.StatusForbidden, gin.H{"error": "No tienes acceso a este canal"})
		return
	}

	var posts []models.ChannelPost
	if err := database.DB.
		Where("channel_id = ?", channelID).
		Preload("User").
		Preload("Files").
		Preload("Comments.User").
		Preload("Likes").
		Order("created_at DESC").
		Find(&posts).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Error al obtener los posts"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"posts": posts})
}

// AddChannelPostComment agrega un comentario a un post del canal
func AddChannelPostComment(c *gin.Context) {
	postID := c.Param("postId")
	userID := c.MustGet("userID").(uint)

	var input struct {
		Content string `json:"content" binding:"required"`
	}

	if err := c.ShouldBindJSON(&input); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Datos inválidos"})
		return
	}

	// Verificar si el post existe y obtener el channel_id
	var post models.ChannelPost
	if err := database.DB.First(&post, postID).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Post no encontrado"})
		return
	}

	// Verificar si el usuario es miembro del canal
	var member models.ChannelMember
	if err := database.DB.Where("channel_id = ? AND user_id = ?", post.ChannelID, userID).First(&member).Error; err != nil {
		c.JSON(http.StatusForbidden, gin.H{"error": "No tienes acceso a este canal"})
		return
	}

	comment := models.ChannelPostComment{
		PostID:    uint(parseUint(postID)),
		UserID:    userID,
		Content:   input.Content,
		CreatedAt: time.Now(),
	}

	if err := database.DB.Create(&comment).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Error al crear el comentario"})
		return
	}

	// Cargar la información del usuario que creó el comentario
	database.DB.Preload("User").First(&comment, comment.CommentID)

	c.JSON(http.StatusCreated, gin.H{
		"message": "Comentario agregado exitosamente",
		"comment": comment,
	})
}

// LikeChannelPost agrega o quita un like a un post del canal
func LikeChannelPost(c *gin.Context) {
	postID := c.Param("postId")
	userID := c.MustGet("userID").(uint)

	// Verificar si el post existe y obtener el channel_id
	var post models.ChannelPost
	if err := database.DB.First(&post, postID).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Post no encontrado"})
		return
	}

	// Verificar si el usuario es miembro del canal
	var member models.ChannelMember
	if err := database.DB.Where("channel_id = ? AND user_id = ?", post.ChannelID, userID).First(&member).Error; err != nil {
		c.JSON(http.StatusForbidden, gin.H{"error": "No tienes acceso a este canal"})
		return
	}

	// Verificar si ya existe un like
	var existingLike models.ChannelPostLike
	if err := database.DB.Where("post_id = ? AND user_id = ?", postID, userID).First(&existingLike).Error; err == nil {
		// Si existe, lo eliminamos (toggle)
		if err := database.DB.Delete(&existingLike).Error; err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Error al quitar el like"})
			return
		}
		c.JSON(http.StatusOK, gin.H{"message": "Like quitado exitosamente"})
		return
	}

	// Si no existe, creamos uno nuevo
	like := models.ChannelPostLike{
		PostID: uint(parseUint(postID)),
		UserID: userID,
	}

	if err := database.DB.Create(&like).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Error al agregar el like"})
		return
	}

	c.JSON(http.StatusCreated, gin.H{
		"message": "Like agregado exitosamente",
		"like":    like,
	})
}

// DeleteChannelPost elimina un post del canal
func DeleteChannelPost(c *gin.Context) {
	postID := c.Param("postId")
	userID := c.MustGet("userID").(uint)

	// Verificar si el post existe y obtener el channel_id
	var post models.ChannelPost
	if err := database.DB.First(&post, postID).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Post no encontrado"})
		return
	}

	// Verificar si el usuario es el creador del post o un administrador del canal
	var member models.ChannelMember
	if err := database.DB.Where("channel_id = ? AND user_id = ?", post.ChannelID, userID).First(&member).Error; err != nil {
		c.JSON(http.StatusForbidden, gin.H{"error": "No tienes acceso a este canal"})
		return
	}

	if post.UserID != userID && !member.IsAdmin {
		c.JSON(http.StatusForbidden, gin.H{"error": "No tienes permiso para eliminar este post"})
		return
	}

	// Eliminar el post y sus relaciones (cascade)
	if err := database.DB.Delete(&post).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Error al eliminar el post"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "Post eliminado exitosamente"})
}
