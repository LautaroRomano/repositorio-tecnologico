package controllers

import (
	"fmt"
	"net/http"
	"time"

	"github.com/LautaroRomano/repositorio-tecnologico/database"
	"github.com/LautaroRomano/repositorio-tecnologico/models"
	"github.com/gin-gonic/gin"
)

// CreateChannel crea un nuevo canal
func CreateChannel(c *gin.Context) {
	var input struct {
		Name         string `json:"name" binding:"required"`
		Description  string `json:"description"`
		IsPrivate    bool   `json:"is_private"`
		UniversityID uint   `json:"university_id" binding:"required"`
		CareerID     uint   `json:"career_id" binding:"required"`
	}

	if err := c.ShouldBindJSON(&input); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Datos inválidos"})
		return
	}

	userID := c.MustGet("userID").(uint)

	channel := models.Channel{
		Name:         input.Name,
		Description:  input.Description,
		IsPrivate:    input.IsPrivate,
		CreatedBy:    userID,
		UniversityID: input.UniversityID,
		CareerID:     input.CareerID,
	}

	if err := database.DB.Create(&channel).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Error al crear el canal"})
		return
	}

	// Crear el primer miembro (creador) como administrador
	member := models.ChannelMember{
		ChannelID:  channel.ChannelID,
		UserID:     userID,
		IsAdmin:    true,
		JoinedAt:   time.Now(),
		LastSeenAt: time.Now(),
	}

	if err := database.DB.Create(&member).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Error al agregar el creador como miembro"})
		return
	}

	c.JSON(http.StatusCreated, gin.H{
		"message": "Canal creado exitosamente",
		"channel": channel,
	})
}

// GetChannels obtiene la lista de canales disponibles para el usuario
func GetChannels(c *gin.Context) {
	userID := c.MustGet("userID").(uint)

	var channels []models.Channel
	if err := database.DB.
		Joins("JOIN channel_members ON channels.channel_id = channel_members.channel_id").
		Where("channel_members.user_id = ?", userID).
		Preload("Creator").
		Preload("University").
		Preload("Career").
		Find(&channels).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Error al obtener los canales"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"channels": channels})
}

// GetChannel obtiene los detalles de un canal específico
func GetChannel(c *gin.Context) {
	channelID := c.Param("id")
	userID := c.MustGet("userID").(uint)

	// Verificar si el usuario es miembro del canal
	var member models.ChannelMember
	if err := database.DB.Where("channel_id = ? AND user_id = ?", channelID, userID).First(&member).Error; err != nil {
		c.JSON(http.StatusForbidden, gin.H{"error": "No tienes acceso a este canal"})
		return
	}

	var channel models.Channel
	if err := database.DB.
		Preload("Creator").
		Preload("University").
		Preload("Career").
		Preload("Members.User").
		First(&channel, channelID).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Canal no encontrado"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"channel": channel})
}

// InviteToChannel invita a un usuario a un canal
func InviteToChannel(c *gin.Context) {
	channelID := c.Param("id")
	userID := c.MustGet("userID").(uint)

	var input struct {
		InvitedUserID uint `json:"invited_user_id" binding:"required"`
	}

	if err := c.ShouldBindJSON(&input); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Datos inválidos"})
		return
	}

	// Verificar si el usuario que invita es administrador
	var member models.ChannelMember
	if err := database.DB.Where("channel_id = ? AND user_id = ? AND is_admin = ?", channelID, userID, true).First(&member).Error; err != nil {
		c.JSON(http.StatusForbidden, gin.H{"error": "Solo los administradores pueden invitar usuarios"})
		return
	}

	// Verificar si el usuario ya es miembro
	var existingMember models.ChannelMember
	if err := database.DB.Where("channel_id = ? AND user_id = ?", channelID, input.InvitedUserID).First(&existingMember).Error; err == nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "El usuario ya es miembro del canal"})
		return
	}

	// Verificar si ya existe una invitación pendiente
	var existingInvitation models.ChannelInvitation
	if err := database.DB.Where("channel_id = ? AND invited_user = ? AND status = ?", channelID, input.InvitedUserID, "pending").First(&existingInvitation).Error; err == nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Ya existe una invitación pendiente para este usuario"})
		return
	}

	invitation := models.ChannelInvitation{
		ChannelID:   uint(parseUint(channelID)),
		InvitedBy:   userID,
		InvitedUser: input.InvitedUserID,
		Status:      "pending",
		CreatedAt:   time.Now(),
		UpdatedAt:   time.Now(),
	}

	if err := database.DB.Create(&invitation).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Error al crear la invitación"})
		return
	}

	c.JSON(http.StatusCreated, gin.H{
		"message":    "Invitación enviada exitosamente",
		"invitation": invitation,
	})
}

// HandleInvitation maneja la aceptación o rechazo de una invitación
func HandleInvitation(c *gin.Context) {
	invitationID := c.Param("id")
	userID := c.MustGet("userID").(uint)

	var input struct {
		Action string `json:"action" binding:"required"` // "accept" o "reject"
	}

	if err := c.ShouldBindJSON(&input); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Datos inválidos"})
		return
	}

	var invitation models.ChannelInvitation
	if err := database.DB.First(&invitation, invitationID).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Invitación no encontrada"})
		return
	}

	// Verificar que el usuario sea el invitado
	if invitation.InvitedUser != userID {
		c.JSON(http.StatusForbidden, gin.H{"error": "No tienes permiso para manejar esta invitación"})
		return
	}

	// Verificar que la invitación esté pendiente
	if invitation.Status != "pending" {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Esta invitación ya ha sido procesada"})
		return
	}

	if input.Action == "accept" {
		// Crear nuevo miembro
		member := models.ChannelMember{
			ChannelID:  invitation.ChannelID,
			UserID:     userID,
			IsAdmin:    false,
			JoinedAt:   time.Now(),
			LastSeenAt: time.Now(),
		}

		if err := database.DB.Create(&member).Error; err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Error al agregar al usuario como miembro"})
			return
		}

		// Actualizar estado de la invitación
		invitation.Status = "accepted"
	} else if input.Action == "reject" {
		invitation.Status = "rejected"
	} else {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Acción inválida"})
		return
	}

	invitation.UpdatedAt = time.Now()
	if err := database.DB.Save(&invitation).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Error al actualizar la invitación"})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"message":    fmt.Sprintf("Invitación %s exitosamente", input.Action),
		"invitation": invitation,
	})
}

// GetPendingInvitations obtiene las invitaciones pendientes del usuario
func GetPendingInvitations(c *gin.Context) {
	userID := c.MustGet("userID").(uint)

	var invitations []models.ChannelInvitation
	if err := database.DB.
		Where("invited_user = ? AND status = ?", userID, "pending").
		Preload("Channel").
		Preload("Inviter").
		Find(&invitations).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Error al obtener las invitaciones"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"invitations": invitations})
}

// Función auxiliar para convertir string a uint
func parseUint(s string) uint64 {
	var result uint64
	fmt.Sscanf(s, "%d", &result)
	return result
}
