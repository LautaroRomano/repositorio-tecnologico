package routes

import (
	"github.com/LautaroRomano/repositorio-tecnologico/controllers"
	"github.com/LautaroRomano/repositorio-tecnologico/middleware"
	"github.com/gin-gonic/gin"
)

func UserRoutes(r *gin.Engine) {
	users := r.Group("/users")
	{
		// Rutas públicas
		users.GET("/:id", controllers.GetUserProfile)
		users.GET("/:id/posts", controllers.GetUserPosts)

		// Rutas que requieren autenticación
		authUsers := users.Group("/")
		authUsers.Use(middleware.AuthMiddleware())
		{
			authUsers.GET("/followers", controllers.GetFollowers)
			authUsers.GET("/me", controllers.GetCurrentUser)
			authUsers.PUT("/me", controllers.UpdateUserProfile)
			authUsers.PUT("/me/password", controllers.ChangePassword)
		}
	}
}
