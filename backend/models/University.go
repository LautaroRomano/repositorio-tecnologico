package models

type University struct {
	UniversityID uint     `gorm:"primaryKey"`
	Name         string   `gorm:"not null"`
	Careers      []Career `gorm:"foreignKey:UniversityID"` // One-to-many relationship
}

type Career struct {
	CareerID     uint       `gorm:"primaryKey"`
	Name         string     `gorm:"not null"`
	UniversityID uint       `gorm:"not null"`
	University   University `gorm:"foreignKey:UniversityID"` // Many-to-one relationship
}
