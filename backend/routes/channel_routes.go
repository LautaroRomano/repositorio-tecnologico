package routes

import (
	"github.com/LautaroRomano/repositorio-tecnologico/controllers"
	"github.com/LautaroRomano/repositorio-tecnologico/middleware"
	"github.com/gin-gonic/gin"
)

func SetupChannelRoutes(router *gin.Engine) {
	// Grupo de rutas para canales
	channelRoutes := router.Group("/channels")
	channelRoutes.Use(middleware.AuthMiddleware())
	{
		// Rutas para canales
		channelRoutes.POST("", controllers.CreateChannel)
		channelRoutes.GET("", controllers.GetChannels)
		channelRoutes.GET("/:id", controllers.GetChannel)
		channelRoutes.POST("/:id/invite", controllers.InviteToChannel)
		channelRoutes.GET("/invitations", controllers.GetPendingInvitations)
		channelRoutes.POST("/invitations/:id", controllers.HandleInvitation)

		// Rutas para posts de canales
		channelRoutes.POST("/:id/posts", controllers.CreateChannelPost)
		channelRoutes.GET("/:id/posts", controllers.GetChannelPosts)
		channelRoutes.POST("/posts/:postId/comments", controllers.AddChannelPostComment)
		channelRoutes.POST("/posts/:postId/like", controllers.LikeChannelPost)
		channelRoutes.DELETE("/posts/:postId", controllers.DeleteChannelPost)
	}
}
