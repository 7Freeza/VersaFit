
import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import * as userModel from '../models/user.model.js'
import * as profileModel from '../models/profile.model.js'
import { validateLogin, validateRegister } from '../utils/validators.js'
import { createError } from '../middleware/errorHandler.js'

function signToken(user) {
  return jwt.sign(
    { userId: user.user_id, email: user.email },
    process.env.JWT_SECRET || 'dev_secret',
    { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
  )
}

function publicUser(row) {
  return {
    userId: row.user_id,
    email: row.email,
    fullName: row.full_name,
    onboardingDone: Boolean(row.onboarding_done),
    age: row.age,
    heightCm: row.height_cm != null ? Number(row.height_cm) : null,
    sex: row.sex,
    activityLevel: row.activity_level,
    intensity: row.intensity,
    preferences: row.preferences,
    objectiveId: row.objective_id,
    objectiveName: row.objective_name,
    latestWeight: row.latest_weight != null ? Number(row.latest_weight) : null,
    latestWeightAt: row.latest_weight_at || null,
  }
}

export async function register(req, res, next) {
  try {
    const errors = validateRegister(req.body)
    if (errors.length) {
      throw createError(400, 'Validation failed', errors)
    }

    const { fullName, email, password } = req.body
    const existing = await userModel.findUserByEmail(email)

    if (existing) {
      throw createError(409, 'Email is already registered')
    }

    const passwordHash = await bcrypt.hash(password, 10)
    const user = await userModel.createUser({ fullName, email, passwordHash })

    // Create empty profile so later updates are simple
    await profileModel.upsertProfile(user.user_id, {
      fullName: user.full_name,
      onboardingDone: false,
    })

    const token = signToken(user)
    const full = await userModel.getUserWithProfile(user.user_id)

    res.status(201).json({
      message: 'Account created successfully',
      token,
      user: publicUser(full),
    })
  } catch (error) {
    next(error)
  }
}

export async function login(req, res, next) {
  try {
    const errors = validateLogin(req.body)
    if (errors.length) {
      throw createError(400, 'Validation failed', errors)
    }

    const { email, password } = req.body
    const user = await userModel.findUserByEmail(email)

    if (!user || !user.is_active) {
      throw createError(401, 'Invalid email or password')
    }

    const valid = await bcrypt.compare(password, user.password_hash)
    if (!valid) {
      throw createError(401, 'Invalid email or password')
    }

    const token = signToken(user)
    const full = await userModel.getUserWithProfile(user.user_id)

    res.json({
      message: 'Login successful',
      token,
      user: publicUser(full),
    })
  } catch (error) {
    next(error)
  }
}

export async function me(req, res, next) {
  try {
    const full = await userModel.getUserWithProfile(req.user.userId)
    if (!full) {
      throw createError(404, 'User not found')
    }

    const needsWeight = await profileModel.needsWeeklyWeight(req.user.userId)

    res.json({
      user: publicUser(full),
      needsWeeklyWeight: needsWeight,
    })
  } catch (error) {
    next(error)
  }
}