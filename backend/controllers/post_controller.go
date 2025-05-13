package controllers

import (
	"context"
	"fmt"
	"math"
	"path/filepath"
	"strconv"
	"strings"
	"time"

	"github.com/LautaroRomano/repositorio-tecnologico/config"
	"github.com/LautaroRomano/repositorio-tecnologico/database"
	"github.com/LautaroRomano/repositorio-tecnologico/models"
	"github.com/cloudinary/cloudinary-go/v2/api/uploader"
	"github.com/gin-gonic/gin"
)

func GetPosts(c *gin.Context) {
	// Obtener parámetros de paginación
	page := 1     // Valor por defecto
	pageSize := 3 // Tamaño fijo de 10 posts por página

	// Obtener número de página desde query params
	pageParam := c.DefaultQuery("page", "1")
	pageNum, err := strconv.Atoi(pageParam)
	if err != nil || pageNum < 1 {
		page = 1
	} else {
		page = pageNum
	}

	// Calcular offset para paginación
	offset := (page - 1) * pageSize

	// Obtener posts con relaciones necesarias
	var posts []models.Post
	result := database.DB.Model(&models.Post{}).
		Preload("Comments").
		Preload("Comments.User").
		Preload("Likes").
		Preload("Likes.User").
		Order("created_at DESC").
		Limit(pageSize).
		Offset(offset).
		Find(&posts)

	if result.Error != nil {
		c.JSON(500, gin.H{"error": "Error al obtener los posts"})
		return
	}

	// Construir respuesta
	var response []gin.H

	for _, post := range posts {
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

		// Construir estructura de usuario
		// Obtener información del usuario para cada post
		var user models.User
		database.DB.Where("user_id = ?", post.UserID).First(&user)

		// Construir estructura de usuario
		userResponse := gin.H{
			"UserID":   user.UserID,
			"Username": user.Username,
			"Avatar":   user.Img,
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

	// Obtener total de posts para metadatos de paginación
	var totalPosts int64
	database.DB.Model(&models.Post{}).Count(&totalPosts)

	// Calcular total de páginas
	totalPages := int(math.Ceil(float64(totalPosts) / float64(pageSize)))

	c.JSON(200, gin.H{
		"posts": response,
		"pagination": gin.H{
			"current_page": page,
			"total_pages":  totalPages,
			"page_size":    pageSize,
			"total_items":  totalPosts,
		},
	})
}

func GetPostByID(c *gin.Context) {
	// Implementar la lógica para obtener un post por ID
}

func CreatePost(c *gin.Context) {
	// Implementar la lógica para crear un nuevo post
	content := c.PostForm("content")
	careerID := c.PostForm("career_id")

	fmt.Println("Contenido del post:", content)
	fmt.Println("ID de carrera:", careerID)

	// Convertir IDs a uint
	careerIDUint, err := strconv.ParseUint(careerID, 10, 32)
	if err != nil {
		c.JSON(400, gin.H{"error": "ID de carrera inválido"})
		return
	}

	post := models.Post{
		Content:  content,
		CareerID: uint(careerIDUint),
		UserID:   c.MustGet("userID").(uint), //agergar el ID del usuario autenticado
	}

	// Guardar en base de datos
	database.DB.Create(&post)
	if post.PostID == 0 {
		c.JSON(500, gin.H{"error": "Error al crear el post"})
		return
	}

	// Procesar múltiples archivos
	form, err := c.MultipartForm()
	if err == nil {
		files := form.File["files[]"]

		// Verificar si hay archivos
		if len(files) > 0 {
			for _, file := range files {
				// Abrir el archivo
				openedFile, err := file.Open()
				if err != nil {
					c.JSON(500, gin.H{"error": fmt.Sprintf("No se pudo abrir el archivo %s: %v", file.Filename, err)})
					return
				}
				defer openedFile.Close()

				// Determinar el tipo de archivo basado en la extensión
				fileType := determineFileType(file.Filename)

				// Subir a Cloudinary
				ctx := context.Background()
				uploadParams := uploader.UploadParams{
					Folder:       "post_files",
					ResourceType: "auto",
				}

				result, err := config.Cld.Upload.Upload(ctx, openedFile, uploadParams)
				if err != nil {
					c.JSON(500, gin.H{"error": fmt.Sprintf("Error al subir archivo %s: %v", file.Filename, err)})
					return
				}

				// Guardar referencia del archivo en la base de datos
				postFile := models.PostFile{
					FileURL:  result.SecureURL,
					PostID:   post.PostID,
					FileType: fileType,
					FileName: file.Filename,
				}

				database.DB.Create(&postFile)
				if postFile.FileID == 0 {
					c.JSON(500, gin.H{"error": fmt.Sprintf("Error al guardar el archivo %s en la base de datos", file.Filename)})
					return
				}
			}
		}
	}

	c.JSON(201, gin.H{
		"message": "Post creado exitosamente",
		"post_id": post.PostID,
	})
}

func determineFileType(filename string) string {
	// Extract file extension - convert to lowercase for consistent comparison
	extension := strings.ToLower(filepath.Ext(filename))

	// Check file type based on extension
	switch extension {
	case ".jpg", ".jpeg", ".png", ".gif", ".bmp", ".webp":
		return "image/jpeg"
	case ".pdf":
		return "application/pdf"
	case ".doc", ".docx":
		return "application/msword"
	case ".xls", ".xlsx":
		return "application/vnd.ms-excel"
	case ".ppt", ".pptx":
		return "application/vnd.ms-powerpoint"
	case ".mp4", ".avi", ".mov", ".wmv", ".flv", ".mkv":
		return "video/mp4"
	case ".mp3", ".wav", ".ogg", ".flac", ".aac":
		return "audio/mpeg"
	case ".zip", ".rar", ".7z", ".tar", ".gz":
		return "application/zip"
	default:
		return "application/octet-stream"
	}
}

func UpdatePost(c *gin.Context) {
	// Implementar la lógica para actualizar un post existente
}

func DeletePost(c *gin.Context) {
	// Implementar la lógica para eliminar un post
}

func SearchPosts(c *gin.Context) {
	// Obtener parámetros de búsqueda
	query := c.Query("q")
	universityID := c.Query("university")
	careerID := c.Query("career")
	tags := c.Query("tags")

	// Construir la consulta base
	db := database.DB.Model(&models.Post{}).
		Preload("Comments").
		Preload("Comments.User").
		Preload("Likes").
		Preload("Likes.User").
		Preload("User")

	// Aplicar filtros
	if query != "" {
		db = db.Where("content ILIKE ?", "%"+query+"%")
	}

	if universityID != "" {
		db = db.Where("university_id = ?", universityID)
	}

	if careerID != "" {
		db = db.Where("career_id = ?", careerID)
	}

	if tags != "" {
		tagList := strings.Split(tags, ",")
		for _, tag := range tagList {
			db = db.Where("tags @> ARRAY[?]::text[]", tag)
		}
	}

	// Ejecutar la consulta
	var posts []models.Post
	if err := db.Order("created_at DESC").Find(&posts).Error; err != nil {
		c.JSON(500, gin.H{"error": "Error al buscar posts"})
		return
	}

	// Construir la respuesta
	var response []gin.H
	for _, post := range posts {
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

		// Construir estructura de usuario
		userResponse := gin.H{
			"UserID":   post.User.UserID,
			"Username": post.User.Username,
			"Avatar":   post.User.Img,
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

	c.JSON(200, gin.H{
		"posts": response,
	})
}

// LikePost maneja la acción de dar like a un post
func LikePost(c *gin.Context) {
	postID := c.Param("id")
	userID := c.GetInt("userID") // Asumiendo que tienes middleware de autenticación

	// Verificar si el like ya existe
	var existingLike models.PostLike
	result := database.DB.Where("post_id = ? AND user_id = ?", postID, userID).First(&existingLike)

	if result.Error == nil {
		// Si el like existe, lo eliminamos (toggle)
		if err := database.DB.Delete(&existingLike).Error; err != nil {
			c.JSON(500, gin.H{"error": "Error al quitar el like"})
			return
		}
		c.JSON(200, gin.H{"message": "Like eliminado"})
		return
	}

	// Si el like no existe, lo creamos
	postIDUint, _ := strconv.ParseUint(postID, 10, 32)
	newLike := models.PostLike{
		PostID:  uint(postIDUint),
		UserID:  uint(userID),
		LikedAt: time.Now(),
	}

	if err := database.DB.Create(&newLike).Error; err != nil {
		c.JSON(500, gin.H{"error": "Error al dar like"})
		return
	}

	c.JSON(200, gin.H{"message": "Like agregado"})
}

// AddComment maneja la acción de agregar un comentario
func AddComment(c *gin.Context) {
	postID := c.Param("id")
	userID := c.GetInt("userID") // Asumiendo que tienes middleware de autenticación

	var commentData struct {
		Content string `json:"content" binding:"required"`
	}

	if err := c.ShouldBindJSON(&commentData); err != nil {
		c.JSON(400, gin.H{"error": "Contenido del comentario requerido"})
		return
	}

	postIDUint, _ := strconv.ParseUint(postID, 10, 32)
	newComment := models.Comment{
		PostID:    uint(postIDUint),
		UserID:    uint(userID),
		Content:   commentData.Content,
		CreatedAt: time.Now(),
	}

	if err := database.DB.Create(&newComment).Error; err != nil {
		c.JSON(500, gin.H{"error": "Error al crear el comentario"})
		return
	}

	// Cargar la información del usuario para la respuesta
	var user models.User
	database.DB.First(&user, userID)

	c.JSON(200, gin.H{
		"comment": gin.H{
			"CommentID": newComment.CommentID,
			"PostID":    newComment.PostID,
			"UserID":    newComment.UserID,
			"Content":   newComment.Content,
			"CreatedAt": newComment.CreatedAt,
			"User": gin.H{
				"UserID":   user.UserID,
				"Username": user.Username,
				"Avatar":   user.Img,
			},
		},
	})
}
