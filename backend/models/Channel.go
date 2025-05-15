package models

import "time"

type Channel struct {
	ChannelID    uint   `gorm:"primaryKey"`
	Name         string `gorm:"not null"`
	Description  string `gorm:"type:text"`
	CreatedAt    time.Time
	CreatedBy    uint `gorm:"not null"`
	IsPrivate    bool `gorm:"default:false"`
	UniversityID uint `gorm:"not null"`
	CareerID     uint `gorm:"not null"`

	Creator     User       `gorm:"foreignKey:CreatedBy"`
	University  University `gorm:"foreignKey:UniversityID"`
	Career      Career     `gorm:"foreignKey:CareerID"`
	Members     []ChannelMember
	Invitations []ChannelInvitation
	Posts       []ChannelPost
}

type ChannelMember struct {
	MemberID   uint `gorm:"primaryKey"`
	ChannelID  uint `gorm:"not null"`
	UserID     uint `gorm:"not null"`
	IsAdmin    bool `gorm:"default:false"`
	JoinedAt   time.Time
	LastSeenAt time.Time

	Channel Channel `gorm:"foreignKey:ChannelID"`
	User    User    `gorm:"foreignKey:UserID"`
}

type ChannelInvitation struct {
	InvitationID uint   `gorm:"primaryKey"`
	ChannelID    uint   `gorm:"not null"`
	InvitedBy    uint   `gorm:"not null"`
	InvitedUser  uint   `gorm:"not null"`
	Status       string `gorm:"type:varchar(20);default:'pending'"` // pending, accepted, rejected
	CreatedAt    time.Time
	UpdatedAt    time.Time

	Channel Channel `gorm:"foreignKey:ChannelID"`
	Inviter User    `gorm:"foreignKey:InvitedBy"`
	Invitee User    `gorm:"foreignKey:InvitedUser"`
}

type ChannelPost struct {
	PostID    uint   `gorm:"primaryKey"`
	ChannelID uint   `gorm:"not null"`
	UserID    uint   `gorm:"not null"`
	Content   string `gorm:"type:text;not null"`
	CreatedAt time.Time
	UpdatedAt time.Time
	Tags      []string `gorm:"type:text[]"`

	Channel  Channel              `gorm:"foreignKey:ChannelID"`
	User     User                 `gorm:"foreignKey:UserID"`
	Comments []ChannelPostComment `gorm:"foreignKey:PostID"`
	Likes    []ChannelPostLike    `gorm:"foreignKey:PostID"`
	Files    []ChannelPostFile    `gorm:"foreignKey:PostID"`
}

type ChannelPostComment struct {
	CommentID uint   `gorm:"primaryKey"`
	PostID    uint   `gorm:"not null"`
	UserID    uint   `gorm:"not null"`
	Content   string `gorm:"type:text;not null"`
	CreatedAt time.Time

	Post ChannelPost `gorm:"foreignKey:PostID"`
	User User        `gorm:"foreignKey:UserID"`
}

type ChannelPostLike struct {
	LikeID  uint `gorm:"primaryKey"`
	PostID  uint `gorm:"not null"`
	UserID  uint `gorm:"not null"`
	LikedAt time.Time

	Post ChannelPost `gorm:"foreignKey:PostID"`
	User User        `gorm:"foreignKey:UserID"`
}

type ChannelPostFile struct {
	FileID   uint   `gorm:"primaryKey"`
	PostID   uint   `gorm:"not null"`
	FileURL  string `gorm:"not null"`
	FileType string `gorm:"not null"`
	FileName string `gorm:"not null"`

	Post ChannelPost `gorm:"foreignKey:PostID"`
}
