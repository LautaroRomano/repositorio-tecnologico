package models

import "time"

type Post struct {
	PostID       uint   `gorm:"primaryKey"`
	UserID       uint   `gorm:"not null"`
	Content      string `gorm:"not null"`
	CreatedAt    time.Time
	TSV          string `gorm:"type:tsvector"`
	UniversityID uint   `gorm:"not null"`
	CareerID     uint   `gorm:"not null"`

	User     User      `gorm:"foreignKey:UserID"`
	Comments []Comment `gorm:"foreignKey:PostID"`
	Likes    []PostLike
	Tags     []Tag `gorm:"many2many:post_tags;foreignKey:PostID;joinForeignKey:post_id;References:TagID;joinReferences:tag_id"`
}

type Comment struct {
	CommentID uint      `gorm:"primaryKey" json:"comment_id"`
	PostID    uint      `json:"post_id"`
	UserID    uint      `json:"user_id"`
	Content   string    `json:"content"`
	CreatedAt time.Time `json:"created_at"`
	User      User      `gorm:"foreignKey:UserID" json:"user"`
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
	FileName string `gorm:"not null"`
	PostID   uint   `gorm:"not null"`
}
