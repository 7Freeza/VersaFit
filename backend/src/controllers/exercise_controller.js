import * as exerciseModel from '../models/exercise.model.js'
import * as userModel from '../models/user.model.js'
import { generatePersonalizedPlan } from '../utils/planGenerator.js'
import { validateScheduleDay} from '../middleware/errorHandler.js'

function mapRoutine (row) {
  return {
    routineId: row.routine_id,
    planId: row.plan_id,
    name: row.name,
    description: row.description,
    category: row.category,
    difficulty: row.difficulty,
    durationMin: row.duration_min,
    estimateKcal: row.estimate_kcal,
  }
}

export async function getDashboard(req, res) {
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
        console.error('Error in getDashboard:', error.message)
        return res.status(500).json({ message: 'Internal server error' })
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
