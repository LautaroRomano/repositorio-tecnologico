package routes

import (
	"github.com/LautaroRomano/repositorio-tecnologico/controllers"
	"github.com/gin-gonic/gin"
)

func SetupAuthRoutes(router *gin.Engine) {
	auth := router.Group("/auth")
	{
		auth.POST("/register", controllers.Register)
		auth.POST("/login", controllers.Login)
		auth.POST("/forgot-password", controllers.RequestPasswordReset)
		auth.POST("/reset-password", controllers.ResetPassword)
	}
}
