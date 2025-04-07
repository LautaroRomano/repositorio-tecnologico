package middleware

import (
	"fmt"
	"net/http"
	"os"
	"strings"

	"github.com/gin-gonic/gin"
	"github.com/golang-jwt/jwt/v5"
)

// AuthMiddleware verifica el token JWT y agrega el ID del usuario al contexto
func AuthMiddleware() gin.HandlerFunc {
	return func(c *gin.Context) {
		// Obtener el token del header Authorization
		authHeader := c.GetHeader("Authorization")
		if authHeader == "" {
			c.AbortWithStatusJSON(http.StatusUnauthorized, gin.H{"error": "Se requiere token de autorización"})
			return
		}

		// El formato esperado es "Bearer <token>"
		parts := strings.Split(authHeader, " ")
		if len(parts) != 2 || parts[0] != "Bearer" {
			c.AbortWithStatusJSON(http.StatusUnauthorized, gin.H{"error": "Formato de token inválido"})
			return
		}

		tokenString := parts[1]

		// Validar el token
		token, err := jwt.Parse(tokenString, func(token *jwt.Token) (interface{}, error) {
			// Verificar el método de firma
			if _, ok := token.Method.(*jwt.SigningMethodHMAC); !ok {
				return nil, fmt.Errorf("método de firma inesperado: %v", token.Header["alg"])
			}

			// Usar la clave secreta para validar
			return []byte(os.Getenv("JWT_SECRET")), nil
		})

		if err != nil {
			c.AbortWithStatusJSON(http.StatusUnauthorized, gin.H{"error": "Token inválido: " + err.Error()})
			return
		}

		// Verificar que el token sea válido
		if claims, ok := token.Claims.(jwt.MapClaims); ok && token.Valid {
			// Extraer el ID del usuario y agregarlo al contexto
			userID := uint(claims["user_id"].(float64))
			c.Set("userID", userID)

			// Continuar con el siguiente handler
			c.Next()
		} else {
			c.AbortWithStatusJSON(http.StatusUnauthorized, gin.H{"error": "Token inválido"})
			return
		}
	}
}
