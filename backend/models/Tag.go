package models

import "time"

type Tag struct {
	TagID     uint   `gorm:"primaryKey"`
	Name      string `gorm:"not null;unique"`
	CreatedAt time.Time
}

type PostTag struct {
	PostID uint `gorm:"primaryKey;column:post_id"`
	TagID  uint `gorm:"primaryKey;column:tag_id"`

	Post Post `gorm:"foreignKey:PostID"`
	Tag  Tag  `gorm:"foreignKey:TagID"`
}

// TableName especifica el nombre de la tabla para PostTag
func (PostTag) TableName() string {
	return "post_tags"
}
