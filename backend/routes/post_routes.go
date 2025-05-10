package routes

import (
	"github.com/LautaroRomano/repositorio-tecnologico/controllers"
	"github.com/LautaroRomano/repositorio-tecnologico/middleware"
	"github.com/gin-gonic/gin"
)

func PostRoutes(r *gin.Engine) {
	posts := r.Group("/posts")
	{
		posts.GET("", controllers.GetPosts) // Changed from "/" to ""
		posts.GET("/:id", controllers.GetPostByID)

		posts.GET("/search", controllers.SearchPosts)

		// Rutas protegidas que requieren autenticación
		authorized := posts.Group("") // Changed from "/" to ""
		authorized.Use(middleware.AuthMiddleware())
		{
			authorized.POST("", controllers.CreatePost) // Changed from "/" to ""
			authorized.PUT("/:id", controllers.UpdatePost)
			authorized.DELETE("/:id", controllers.DeletePost)
			authorized.POST("/:id/likes", controllers.LikePost)
			authorized.POST("/:id/comments", controllers.AddComment)
		}
	}
}
