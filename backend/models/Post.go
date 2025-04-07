package models

import "time"

type Post struct {
	PostID       uint   `gorm:"primaryKey"`
	UserID       uint   `gorm:"not null"`
	Content      string `gorm:"not null"`
	CreatedAt    time.Time
	Tags         []string `gorm:"type:text[]"`
	TSV          string   `gorm:"type:tsvector"`
	UniversityID uint     `gorm:"not null"`
	CareerID     uint     `gorm:"not null"`

	User     User      `gorm:"foreignKey:UserID"`
	Comments []Comment `gorm:"foreignKey:PostID"`
	Likes    []PostLike
}

type Comment struct {
	CommentID uint   `gorm:"primaryKey"`
	PostID    uint   `gorm:"not null"`
	UserID    uint   `gorm:"not null"`
	Content   string `gorm:"not null"`
	CreatedAt time.Time
}

type PostLike struct {
	LikeID  uint `gorm:"primaryKey"`
	PostID  uint `gorm:"not null"`
	UserID  uint `gorm:"not null"`
	LikedAt time.Time

	Post Post `gorm:"foreignKey:PostID"`
	User User `gorm:"foreignKey:UserID"`
}

type PostFile struct {
	FileID   uint   `gorm:"primaryKey"`
	FileURL  string `gorm:"not null"`
	FileType string `gorm:"not null"`
	PostID   uint   `gorm:"not null"`
}
