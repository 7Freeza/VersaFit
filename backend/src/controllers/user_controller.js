
import * as userModel from '../models/user.model.js'
import * as profileModel from '../models/profile.model.js'
import { validateProfile, validateWeight } from '../utils/validators.js'
import { createError } from '../middleware/errorHandler.js'
import { generatePersonalizedPlan } from '../services/aiRoutine.service.js'
import { saveGeneratedPlan } from '../models/exercise.model.js'

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

export async function listObjectives(_req, res, next) {
  try {
    const objectives = await profileModel.getObjectives()
    res.json({
      objectives: objectives.map((o) => ({
        objectiveId: o.objective_id,
        name: o.name,
        description: o.description,
      })),
    })
  } catch (error) {
    next(error)
  }
}

export async function updateProfile(req, res, next) {
  try {
    const errors = validateProfile(req.body)
    if (errors.length) {
      throw createError(400, 'Validation failed', errors)
    }

    await profileModel.upsertProfile(req.user.userId, {
      fullName: req.body.fullName,
      age: req.body.age != null ? Number(req.body.age) : undefined,
      heightCm: req.body.heightCm != null ? Number(req.body.heightCm) : undefined,
      weightKg: req.body.weightKg != null ? Number(req.body.weightKg) : undefined,
      sex: req.body.sex,
      activityLevel: req.body.activityLevel,
      intensity: req.body.intensity,
      preferences: Array.isArray(req.body.preferences)
        ? req.body.preferences.join(',')
        : req.body.preferences,
      objectiveId:
        req.body.objectiveId != null ? Number(req.body.objectiveId) : undefined,
      onboardingDone: req.body.onboardingDone,
    })

    const full = await userModel.getUserWithProfile(req.user.userId)
    res.json({
      message: 'Profile updated',
      user: publicUser(full),
    })
  } catch (error) {
    next(error)
  }
}

export async function completeOnboarding(req, res, next) {
  try {
    const errors = validateProfile(req.body)
    if (errors.length) {
      throw createError(400, 'Validation failed', errors)
    }

    if (!req.body.age || !req.body.heightCm || !req.body.weightKg) {
      throw createError(400, 'Age, height and weight are required to generate a plan')
    }

    if (!req.body.objectiveId) {
      throw createError(400, 'Training objective is required')
    }

    if (!req.body.intensity) {
      throw createError(400, 'Training intensity is required')
    }

    await profileModel.upsertProfile(req.user.userId, {
      fullName: req.body.fullName,
      age: Number(req.body.age),
      heightCm: Number(req.body.heightCm),
      weightKg: Number(req.body.weightKg),
      sex: req.body.sex || 'Other',
      activityLevel: req.body.activityLevel || 'moderate',
      intensity: req.body.intensity,
      preferences: Array.isArray(req.body.preferences)
        ? req.body.preferences.join(',')
        : req.body.preferences || '',
      objectiveId: Number(req.body.objectiveId),
      onboardingDone: true,
    })

    const full = await userModel.getUserWithProfile(req.user.userId)
    const planPayload = await generatePersonalizedPlan(full)
    const saved = await saveGeneratedPlan(req.user.userId, planPayload)

    res.json({
      message: 'Onboarding completed and training plan generated',
      user: publicUser(full),
      plan: {
        planId: saved.planId,
        source: planPayload.source,
        routines: saved.routines,
      },
    })
  } catch (error) {
    next(error)
  }
}

export async function addWeight(req, res, next) {
  try {
    const errors = validateWeight(req.body)
    if (errors.length) {
      throw createError(400, 'Validation failed', errors)
    }

    const log = await profileModel.addWeightLog(
      req.user.userId,
      Number(req.body.weightKg)
    )

    res.status(201).json({
      message: 'Weight registered',
      log: {
        logId: log.log_id,
        weightKg: Number(log.weight_kg),
        recordedAt: log.recorded_at,
      },
    })
  } catch (error) {
    next(error)
  }
}

export async function weightHistory(req, res, next) {
  try {
    const history = await profileModel.getWeightHistory(req.user.userId)
    res.json({
      history: history.map((item) => ({
        logId: item.log_id,
        weightKg: Number(item.weight_kg),
        recordedAt: item.recorded_at,
      })),
    })
  } catch (error) {
    next(error)
  }
}