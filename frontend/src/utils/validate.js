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

export function validateOnboardingStep(step, data) {
  const errors = {}

  if (step === 1) {
    if (!data.fullName || data.fullName.trim().length < 2) {
      errors.fullName = 'Nombre requerido'
    }
    const age = Number(data.age)
    if (!age || age < 12 || age > 100) {
      errors.age = 'Edad entre 12 y 100'
    }
    const height = Number(data.heightCm)
    if (!height || height < 100 || height > 250) {
      errors.heightCm = 'Altura entre 100 y 250 cm'
    }
    const weight = Number(data.weightKg)
    if (!weight || weight <= 0 || weight >= 500) {
      errors.weightKg = 'Peso valido requerido'
    }
  }

  if (step === 2 && !data.activityLevel) {
    errors.activityLevel = 'Selecciona tu nivel actual'
  }

  if (step === 3 && !data.objectiveId) {
    errors.objectiveId = 'Selecciona un objetivo'
  }

  if (step === 4) {
    if (!data.intensity) {
      errors.intensity = 'Selecciona la intensidad'
    }
    if (!data.preferences || data.preferences.length === 0) {
      errors.preferences = 'Elige al menos una preferencia'
    }
  }

  return errors
}

export function validateWeight(value) {
  const weight = Number(value)
  if (!weight || weight <= 0 || weight >= 500) {
    return 'Ingresa un peso valido'
  }
  return null
}
