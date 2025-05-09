package routes

import (
	"github.com/LautaroRomano/repositorio-tecnologico/controllers"
	"github.com/gin-gonic/gin"
)

func UniversityRoutes(r *gin.Engine) {
	universities := r.Group("/universities")
	{
		universities.GET("", controllers.GetUniversities)
		universities.GET("/:id", controllers.GetUniversityByID)
		universities.GET("/:id/careers", controllers.GetCareersByUniversityID)
	}
}

func CareerRoutes(r *gin.Engine) {
	careers := r.Group("/careers")
	{
		careers.GET("", controllers.GetCareers)
		careers.GET("/:id", controllers.GetCareerById)
	}
}
