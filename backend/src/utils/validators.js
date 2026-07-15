/**
 * Simple Validators for request bodies.
 */

const EMIAL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

export function validateRegister(body){
    const errors = []
    const {fullname, email, password} = body

    if(!fullname ||String(fullname).trim().length < 2){
        errors.push('Full name must have at least 2 characters')
    }
    if(!email || !EMAIL_REGEX.test(String(email).trim())){
        errors.push('A valid email is required')
    }
    if(!password || String(password).length < 6){
        errors.push('Password must have at least 6 characters')
    }

    return errors
}

export function validateLogin(body){
    const errors = []
    const {email, password} = body

    if(!email || !EMAIL_REGEX.test(String(email).trim())){
        errors.push('A valid email is required')
    }
    
    if(!password){
        errors.push('Password is required')
    }

    return errors
}

export function validateProfile(body){
    const errors = []
    const {age, heightCm, weightKg, sex} = body
    
    if(age !== undefined && age !== null){
        const ageNum = Number(age)
        if(Number.isNaN(ageNum) || ageNum < 12 || ageNum > 100){
            errors.push('Age must be between 12 and 100')
        }
    }

    if(heightCm !== undefined && heightCm !== null){
        const height = Number(heightCm)
        if(Number.isNaN(height) || height < 100 || height > 250){
            errors.push('Height must be between 100 and 250 cm')
        }
    }

    if(weightKg !== undefined && weightKg !== null){
        const weight = Number(weightKg)
        if(Number.isNaN(weight) || weight < 30 || weight > 300){
            errors.push('Weight must be between 30 and 300 kg')
        }
    }

    if (sex && !['M', 'F', 'Other'].includes(sex)) {
    errors.push('Sex must be M, F or Other')
    }

    if (activityLevel && !['sedentary', 'light', 'moderate', 'active'].includes(activityLevel)) {
    errors.push('Invalid activity level')
    }

    if (intensity && !['low', 'medium', 'high'].includes(intensity)) {
    errors.push('Intensity must be low, medium or high')
    }

    if (objectiveId !== undefined && objectiveId !== null) {
        const id = Number(objectiveId)
        if (Number.isNaN(id) || id < 1) {
        errors.push('Invalid objective')
        }
    }
    return errors
}

export function validateWeight(body){
    const errors = []
    const weight = Number(body.weightKg)

    if(Number.isNaN(weight)|| weight <= 0 || weight >= 500){
        errors.push('Weight must be a positive number under 500 kg')
    }
    return errors
}