package routes

import (
	"github.com/LautaroRomano/repositorio-tecnologico/controllers"

	"github.com/gin-gonic/gin"
)

func UserRoutes(r *gin.Engine) {
	auth := r.Group("/users")
	{
		auth.GET("/followers", controllers.GetFollowers)
	}
}
