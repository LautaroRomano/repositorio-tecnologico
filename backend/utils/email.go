package utils

import (
	"github.com/resendlabs/resend-go"
)

var resendClient *resend.Client

func InitResendClient(apiKey string) {
	resendClient = resend.NewClient(apiKey)
}

func SendPasswordResetEmail(to, resetToken string) error {
	params := &resend.SendEmailRequest{
		From:    "noreply@redapuntes.com",
		To:      []string{to},
		Subject: "Recuperación de contraseña",
		Html:    generatePasswordResetEmailHTML(resetToken),
	}

	_, err := resendClient.Emails.Send(params)
	return err
}

func generatePasswordResetEmailHTML(token string) string {
	return `
		<html>
			<body>
				<h2>Recuperación de contraseña</h2>
				<p>Has solicitado restablecer tu contraseña. Haz clic en el siguiente enlace para continuar:</p>
				<a href="http://localhost:3000/reset-password?token=` + token + `">Restablecer contraseña</a>
				<p>Si no solicitaste este cambio, puedes ignorar este correo.</p>
				<p>El enlace expirará en 1 hora.</p>
			</body>
		</html>
	`
}
