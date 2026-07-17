/* Valida los formularios antes de enviarlos al backend */

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

export function validateLoginForm(data) {
  const errors = {}

  if (!data.email || !EMAIL_REGEX.test(data.email.trim())) {
    errors.email = 'Ingresa un correo valido'
  }

  if (!data.password) {
    errors.password = 'La contrasena es obligatoria'
  }

  return errors
}

export function validateRegisterForm(data) {
  const errors = {}

  if (!data.fullName || data.fullName.trim().length < 2) {
    errors.fullName = 'El nombre debe tener al menos 2 caracteres'
  }

  if (!data.email || !EMAIL_REGEX.test(data.email.trim())) {
    errors.email = 'Ingresa un correo valido'
  }

  if (!data.password || data.password.length < 6) {
    errors.password = 'La contrasena debe tener al menos 6 caracteres'
  }

  return errors
}