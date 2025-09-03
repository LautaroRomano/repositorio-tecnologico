package database

import (
	"fmt"
	"log"
	"os"

	"github.com/LautaroRomano/repositorio-tecnologico/models"
	"gorm.io/driver/postgres"
	"gorm.io/gorm"
)

var DB *gorm.DB

func Connect() {
	// Esta función ahora se llama desde vercel.go con la configuración ya validada
	// Obtener configuración de la base de datos
	dbHost := os.Getenv("DB_HOST")
		dbUser := os.Getenv("DB_USER")
		dbPassword := os.Getenv("DB_PASSWORD")
		dbName := os.Getenv("DB_NAME")
		dbPort := os.Getenv("DB_PORT")
		dbSSLMode := os.Getenv("DB_SSLMODE")
		
		if dbPort == "" {
			dbPort = "5432"
		}
		if dbSSLMode == "" {
			dbSSLMode = "require"
		}
		
		if dbHost != "" && dbUser != "" && dbName != "" && dbSSLMode != "" {
			log.Println("Variables de entorno encontradas, usando configuración de producción")
		} else {
			log.Println("Variables de entorno incompletas, usando valores por defecto")
		}
	
	log.Printf("Conectando a la base de datos: %s:%s/%s", dbHost, dbPort, dbName)

	dsn := fmt.Sprintf(
		"host=%s user=%s password=%s dbname=%s port=%s sslmode=%s",
		dbHost, dbUser, dbPassword, dbName, dbPort, dbSSLMode,
	)

	var err error
	// Disable foreign key constraints during migration
	DB, err = gorm.Open(postgres.Open(dsn), &gorm.Config{
		DisableForeignKeyConstraintWhenMigrating: true,
	})
	if err != nil {
		log.Fatalf("Error conectando a la base de datos: %v", err)
	}
	log.Println("Conexión con PostgreSQL establecida correctamente.")
}

// ConnectWithConfig permite conectar con configuración específica
func ConnectWithConfig(host, user, password, dbname, port, sslmode string) {
	log.Printf("Conectando a la base de datos: %s:%s/%s", host, port, dbname)

	dsn := fmt.Sprintf(
		"host=%s user=%s password=%s dbname=%s port=%s sslmode=%s timezone=Argentina/Buenos_Aires",
		host, user, password, dbname, port, sslmode,
	)

	var err error
	// Disable foreign key constraints during migration
	DB, err = gorm.Open(postgres.Open(dsn), &gorm.Config{
		DisableForeignKeyConstraintWhenMigrating: true,
	})
	if err != nil {
		log.Fatalf("Error conectando a la base de datos: %v", err)
	}
	log.Println("Conexión con PostgreSQL establecida correctamente.")
}

func Migrate() {
	// Migrate all models at once with foreign key constraints disabled
	err := DB.AutoMigrate(
		&models.User{},
		&models.Post{},
		&models.Comment{},
		&models.PostLike{},
		&models.PostFile{},
		&models.PostTag{},
		&models.Tag{},
		&models.Follow{},
		&models.University{},
		&models.Career{},
		&models.Channel{},
		&models.ChannelMember{},
		&models.ChannelInvitation{},
		&models.ChannelPost{},
		&models.ChannelPostComment{},
		&models.ChannelPostLike{},
		&models.ChannelPostFile{},
	)
	if err != nil {
		log.Fatalf("Error en la migración: %v", err)
	}

	log.Println("Migración completada exitosamente.")
}

func InitDB() {
	dsn := os.Getenv("DATABASE_URL")
	if dsn == "" {
		dsn = "root:@tcp(127.0.0.1:3306)/repositorio_tecnologico?charset=utf8mb4&parseTime=True&loc=Local"
	}

	var err error
	DB, err = gorm.Open(postgres.Open(dsn), &gorm.Config{})
	if err != nil {
		log.Fatal("Failed to connect to database:", err)
	}

	// Migrate the schema
	err = DB.AutoMigrate(
		&models.User{},
		&models.University{},
		&models.Career{},
		&models.Post{},
		&models.PostTag{},
		&models.Tag{},
		&models.Follow{},
	)
	if err != nil {
		log.Fatal("Failed to migrate database:", err)
	}
}
