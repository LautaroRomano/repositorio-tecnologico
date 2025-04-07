package controllers

import (
	"context"
	"fmt"
	"path/filepath"
	"strconv"
	"strings"

	"github.com/LautaroRomano/repositorio-tecnologico/config"
	"github.com/LautaroRomano/repositorio-tecnologico/database"
	"github.com/LautaroRomano/repositorio-tecnologico/models"
	"github.com/cloudinary/cloudinary-go/v2/api/uploader"
	"github.com/gin-gonic/gin"
)

func GetPosts(c *gin.Context) {
	// Implementar la lógica para obtener todos los posts
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
					Folder: "post_files",
				}

				result, err := config.Cld.Upload.Upload(ctx, openedFile, uploadParams)
				if err != nil {
					c.JSON(500, gin.H{"error": fmt.Sprintf("Error al subir archivo %s: %v", file.Filename, err)})
					return
				}

				// Guardar referencia del archivo en la base de datos
				postFile := models.PostFile{
					FileURL:  result.SecureURL,
					PostID:   post.PostID, // Ahora tenemos el ID correcto
					FileType: fileType,
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
		return "image"
	case ".pdf", ".doc", ".docx", ".xls", ".xlsx", ".ppt", ".pptx":
		return "document"
	case ".mp4", ".avi", ".mov", ".wmv", ".flv", ".mkv":
		return "video"
	case ".mp3", ".wav", ".ogg", ".flac", ".aac":
		return "audio"
	case ".zip", ".rar", ".7z", ".tar", ".gz":
		return "compressed"
	default:
		return "other"
	}
}

func UpdatePost(c *gin.Context) {
	// Implementar la lógica para actualizar un post existente
}

func DeletePost(c *gin.Context) {
	// Implementar la lógica para eliminar un post
}
