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