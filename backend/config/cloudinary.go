package config

import (
	"os"

	"github.com/cloudinary/cloudinary-go/v2"
)

var Cld *cloudinary.Cloudinary

// SetupCloudinary inicializa la conexión con Cloudinary
func SetupCloudinary() error {
	var err error

	// Obtener credenciales desde variables de entorno
	cloudName := os.Getenv("CLOUDINARY_CLOUD_NAME")
	apiKey := os.Getenv("CLOUDINARY_API_KEY")
	apiSecret := os.Getenv("CLOUDINARY_API_SECRET")

	// Crear instancia de Cloudinary
	Cld, err = cloudinary.NewFromParams(cloudName, apiKey, apiSecret)
	if err != nil {
		return err
	}

	return nil
}
