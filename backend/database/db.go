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
	dsn := fmt.Sprintf(
		"host=%s user=%s password=%s dbname=%s port=%s sslmode=disable",
		os.Getenv("DB_HOST"),
		os.Getenv("DB_USER"),
		os.Getenv("DB_PASSWORD"),
		os.Getenv("DB_NAME"),
		os.Getenv("DB_PORT"),
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
