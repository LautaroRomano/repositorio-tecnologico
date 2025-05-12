package models

import (
	"time"

	"golang.org/x/crypto/bcrypt"
)

type User struct {
	UserID               uint       `json:"user_id" gorm:"primaryKey"`
	Username             string     `json:"username" gorm:"unique"`
	Email                string     `json:"email" gorm:"unique"`
	PasswordHash         string     `json:"-"`
	AccountName          string     `json:"account_name"`
	Img                  string     `json:"img"`
	ResetPasswordToken   string     `json:"-"`
	ResetPasswordExpires time.Time  `json:"-"`
	CreatedAt            time.Time  `json:"created_at"`
	UpdatedAt            time.Time  `json:"updated_at"`
	UniversityID         uint       `gorm:"foreignKey:UniversityID"`
	CareerID             uint       `gorm:"foreignKey:CareerID"`
	University           University `gorm:"foreignKey:UniversityID"`
	Career               Career     `gorm:"foreignKey:CareerID"`
	Followers            []Follow   `gorm:"foreignKey:FollowedID"`
	Following            []Follow   `gorm:"foreignKey:FollowerID"`

	Posts    []Post    `gorm:"foreignKey:UserID"`
	Comments []Comment `gorm:"foreignKey:UserID"`
}

type Follow struct {
	FollowID   uint `gorm:"primaryKey"`
	FollowerID uint `gorm:"not null"`
	FollowedID uint `gorm:"not null"`
	CreatedAt  time.Time
}

func (u *User) SetPassword(password string) error {
	hash, err := bcrypt.GenerateFromPassword([]byte(password), bcrypt.DefaultCost)
	if err != nil {
		return err
	}
	u.PasswordHash = string(hash)
	return nil
}

func (u *User) CheckPassword(password string) bool {
	err := bcrypt.CompareHashAndPassword([]byte(u.PasswordHash), []byte(password))
	return err == nil
}
