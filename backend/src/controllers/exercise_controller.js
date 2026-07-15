import * as exerciseModel from '../models/exercise.model.js'
import * as userModel from '../models/user.model.js'
import { generatePersonalizedPlan } from '../services/aiRoutine.service.js'
import { validateScheduleDay } from '../utils/validators.js'
import { createError } from '../middleware/errorHandler.js'

function mapRoutine(row) {
    return {
        routineId: row.routine_id,
        planId: row.plan_id,
        name: row.name,
        description: row.description,
        category: row.category,
        difficulty: row.difficulty,
        durationMin: row.duration_min,
        estimatedKcal: row.estimated_kcal,
    }
}

export async function getDashboard(req, res, next) {
    try {
        let plan = await exerciseModel.getActivePlanForUser(req.user.userId)

        if (!plan) {
            const profile = await userModel.getUserWithProfile(req.user.userId)
            if (profile && profile.onboarding_done) {
                const payload = await generatePersonalizedPlan(profile)
                await exerciseModel.saveGeneratedPlan(req.user.userId, payload)
                plan = await exerciseModel.getActivePlanForUser(req.user.userId)
            }
        }

        if (!plan) {
            return res.json({
                hasPlan: false,
                plan: null,
                routines: [],
                schedule: [],
                completedThisWeek: 0,
                totalDays: 7,
                today: null,
            })
        }

        const category = req.query.category || 'all'
        let routines = await exerciseModel.getRoutinesByPlan(plan.plan_id, category)

        routines = routines.filter((r) => r.category !== 'flexibility')

        await exerciseModel.ensureDefaultSchedule(req.user.userId)
        const weekStatus = await exerciseModel.getWeeklyPlanStatus(req.user.userId)

        res.json({
            hasPlan: true,
            plan: {
                planId: plan.plan_id,
                durationWeeks: plan.duration_weeks,
                objectiveId: plan.objective_id,
            },
            routines: routines.map(mapRoutine),
            schedule: weekStatus.schedule.map((day) => ({
                scheduleId: day.schedule_id,
                dayName: day.day_name,
                isRestDay: day.is_rest_day,
                routineId: day.routine_id,
                routineName: day.routine_name,
                category: day.category,
                date: day.date,
                status: day.status,
            })),
            completedThisWeek: weekStatus.completedThisWeek,
            totalDays: weekStatus.totalDays,
            today: weekStatus.today,
        })
    } catch (error) {
        next(error)
    }
}

export async function getRoutineDetail(req, res, next) {
    try {
        const routineId = Number(req.params.routineId)
        if (Number.isNaN(routineId)) {
            throw createError(400, 'Invalid routine id')
        }

        const routine = await exerciseModel.getRoutineById(routineId, req.user.userId)
        if (!routine) {
            throw createError(404, 'Routine not found')
        }

        const exercises = await exerciseModel.getRoutineExercises(routineId)

        const session = await exerciseModel.getSessionForToday(
            req.user.userId,
            routineId
        )

        let checkoffs = []
        if (session) {
            checkoffs = await exerciseModel.getSessionCheckoffs(session.session_id)
        }

        res.json({
            routine: mapRoutine(routine),
            exercises: exercises.map((ex) => ({
                exerciseId: ex.exercise_id,
                name: ex.name,
                muscleGroup: ex.muscle_group,
                description: ex.description,
                sets: ex.sets,
                reps: ex.reps,
                restSeconds: ex.rest_seconds,
                sortOrder: ex.sort_order,
            })),
            session: session
                ? {
                    sessionId: session.session_id,
                    isCompleted: session.is_completed,
                    sessionDate: session.session_date,
                }
                : null,
            checkoffs: checkoffs.map((c) => ({
                exerciseId: c.exercise_id,
                name: c.name,
                isDone: c.is_done,
            })),
        })
    } catch (error) {
        next(error)
    }
}

export async function updateSchedule(req, res, next) {
    try {
        const errors = validateScheduleDay(req.body)
        if (errors.length) {
            throw createError(400, 'Validation failed', errors)
        }
        const isRestDay = Boolean(req.body.isRestDay)
        const routineId = isRestDay ? null : Number(req.body.routineId)
        if (!isRestDay) {
            const routine = await exerciseModel.getRoutineById(routineId, req.user.userId)
            if (!routine) {
                throw createError(404, 'Routine not found for this user')
            }
        }
        const day = await exerciseModel.upsertScheduleDay(
            req.user.userId,
            req.body.dayName,
            routineId,
            isRestDay
        )
        res.json({
            message: 'Schedule updated',
            day: {
                scheduleId: day.schedule_id,
                dayName: day.day_name,
                routineId: day.routine_id,
                isRestDay: day.is_rest_day,
            },
        })
    } catch (error) {
        next(error)
    }
}

export async function startRoutine(req, res, next) {
    try {
        const routineId = Number(req.params.routineId)
        const routine = await exerciseModel.getRoutineById(routineId, req.user.userId)

        if (!routine) {
            throw createError(404, 'Routine not found')
        }

        const session = await exerciseModel.startSession(req.user.userId, routineId)
        const checkoffs = await exerciseModel.getSessionCheckoffs(session.session_id)

        res.status(201).json({
            message: 'Routine started',
            session: {
                sessionId: session.session_id,
                routineId: session.routine_id,
                isCompleted: session.is_completed,
                sessionDate: session.session_date,
            },
            checkoffs: checkoffs.map((c) => ({
                exerciseId: c.exercise_id,
                name: c.name,
                isDone: c.is_done,
            })),
        })
    } catch (error) {
        next(error)
    }
}
export async function toggleExercise(req, res, next) {
    try {
        const sessionId = Number(req.params.sessionId)
        const exerciseId = Number(req.params.exerciseId)
        const isDone = Boolean(req.body.isDone)

        const ownership = await exerciseModel.getSessionCheckoffs(sessionId)
        if (!ownership.length) {

        }
        const updated = await exerciseModel.toggleCheckoff(sessionId, exerciseId, isDone)
        if (!updated) {
            throw createError(404, 'Checkoff not found for this session')
        }

        const all = await exerciseModel.getSessionCheckoffs(sessionId)
        const allDone = all.length > 0 && all.every((item) => item.is_done)
        let session = null
        if (allDone) {
            session = await exerciseModel.completeSession(sessionId, req.user.userId)
        }
        res.json({
            message: 'Exercise updated',
            checkoff: {
                sessionId: updated.session_id,
                exerciseId: updated.exercise_id,
                isDone: updated.is_done,
            },
            sessionCompleted: Boolean(session),
        })
    } catch (error) {
        next(error)
    }
}

export async function regeneratePlan(req, res, next) {
    try {
        const profile = await userModel.getUserWithProfile(req.user.userId)
        if (!profile || !profile.onboarding_done) {
            throw createError(400, 'Complete onboarding before generating a plan')
        }
        const payload = await generatePersonalizedPlan(profile)
        const saved = await exerciseModel.saveGeneratedPlan(req.user.userId, payload)
        res.json({
            message: 'New training plan generated',
            source: payload.source,
            planId: saved.planId,
            routines: saved.routines.map(mapRoutine),
        })
    } catch (error) {
        next(error)
    }
}

export async function getMotivation(_req, res, next) {
    try {
        const controller = new AbortController()
        const timer = setTimeout(() => controller.abort(), 4000)
        const response = await fetch(
            'https://api.quotable.io/random?tags=motivational|sports|success',
            { signal: controller.signal }
        )
        clearTimeout(timer)
        if (!response.ok) {
            return res.json({
                quote: 'Small steps, big changes.',
                author: 'VersaFit',
            })
        }
        const data = await response.json()
        res.json({
            quote: data.content,
            author: data.author,
        })
    } catch (error) {
        res.json({
            quote: 'Discipline today, strength forever.',
            author: 'VersaFit',
        })
    }
}