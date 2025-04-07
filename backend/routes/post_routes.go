package routes

import (
	"github.com/LautaroRomano/repositorio-tecnologico/controllers"
	"github.com/LautaroRomano/repositorio-tecnologico/middleware"
	"github.com/gin-gonic/gin"
)

func PostRoutes(r *gin.Engine) {
	posts := r.Group("/posts")
	{
		posts.GET("/", controllers.GetPosts)
		posts.GET("/:id", controllers.GetPostByID)
		// Rutas protegidas que requieren autenticación
		authorized := posts.Group("/")
		authorized.Use(middleware.AuthMiddleware())
		{
			authorized.POST("/", controllers.CreatePost)
			authorized.PUT("/:id", controllers.UpdatePost)
			authorized.DELETE("/:id", controllers.DeletePost)
		}
	}
}
