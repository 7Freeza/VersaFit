const WGER_BASE = 'https://wger.de/api/v2'

const FALLBACK_LIBRARY = {
    strength: [
        { name: 'Bench Press', muscleGroup: 'Chest', description: 'Flat barbell press' },
        { name: 'Pull-ups', muscleGroup: 'Back', description: 'Bodyweight vertical pull' },
        { name: 'Military Press', muscleGroup: 'Shoulders', description: 'Overhead press' },
        { name: 'Bicep Curl', muscleGroup: 'Arms', description: 'Dumbbell curls' },
        { name: 'Squats', muscleGroup: 'Legs', description: 'Barbell or bodyweight squats' },
        { name: 'Deadlift', muscleGroup: 'Legs', description: 'Hip hinge strength lift' },
        { name: 'Lunges', muscleGroup: 'Legs', description: 'Single leg strength' },
        { name: 'Plank', muscleGroup: 'Core', description: 'Isometric core hold' },
    ],
    cardio: [
        { name: 'Running Intervals', muscleGroup: 'Cardio', description: 'Sprint and jog intervals' },
        { name: 'Jumping Jacks', muscleGroup: 'Cardio', description: 'Full body cardio warm-up' },
        { name: 'Mountain Climbers', muscleGroup: 'Cardio', description: 'Core driven cardio' },
        { name: 'Cycling', muscleGroup: 'Cardio', description: 'Steady or interval cycling' },
        { name: 'High Knees', muscleGroup: 'Cardio', description: 'In-place cardio drill' },
    ],
    hiit: [
        { name: 'Burpees', muscleGroup: 'Full body', description: 'Explosive full body move' },
        { name: 'Mountain Climbers', muscleGroup: 'Cardio', description: 'Fast core cardio' },
        { name: 'Jump Squats', muscleGroup: 'Legs', description: 'Plyometric squat' },
        { name: 'Push-up to Plank', muscleGroup: 'Core', description: 'Upper body and core combo' },
    ],
}

/**
 * Fetch a few exercises from wger (free, no API key).
 * Returns an empty array if the network call fails.
 */
async function fetchWgerExercises(limit = 12) {
    try {
        const url = `${WGER_BASE}/exerciseinfo/?language=2&limit=${limit}`
        const controller = new AbortController()
        const timer = setTimeout(() => controller.abort(), 5000)

        try {
            const response = await fetch(url, {
                headers: { Accept: 'application/json' },
                signal: controller.signal,
            })

            if (!response.ok) {
                return []
            }

            const data = await response.json()
            const results = data.results || []

            return results
                .map((item) => {
                    const translation =
                        (item.translations || []).find((t) => t.language === 2) ||
                        (item.translations || [])[0]

                    if (!translation || !translation.name) {
                        return null
                    }

                    const muscle =
                        (item.muscles && item.muscles[0] && item.muscles[0].name_en) ||
                        'General'

                    return {
                        name: translation.name,
                        muscleGroup: muscle,
                        description: (translation.description || '')
                            .replace(/<[^>]+>/g, '')
                            .slice(0, 180),
                        externalId: String(item.id),
                    }
                })
                .filter(Boolean)
        } finally {
            clearTimeout(timer)
        }
    } catch (error) {
        console.warn('wger API unavailable, using local exercise library:', error.message)
        return []
    }
}

function pickExercises(list, count) {
    if (!list.length) {
        return []
    }

    const copy = [...list]
    const selected = []

    while (selected.length < count && copy.length > 0) {
        const index = Math.floor(Math.random() * copy.length)
        selected.push(copy.splice(index, 1)[0])
    }

    return selected
}

function setsRepsForIntensity(intensity, category) {
  if (category === 'cardio') {
    if (intensity === 'high') return { sets: 4, reps: 20, restSeconds: 30 }
    if (intensity === 'low') return { sets: 2, reps: 15, restSeconds: 45 }
    return { sets: 3, reps: 18, restSeconds: 40 }
  }

  if (category === 'hiit') {
    if (intensity === 'high') return { sets: 5, reps: 15, restSeconds: 20 }
    if (intensity === 'low') return { sets: 3, reps: 10, restSeconds: 40 }
    return { sets: 4, reps: 12, restSeconds: 30 }
  }

  // strength
  if (intensity === 'high') return { sets: 4, reps: 8, restSeconds: 90 }
  if (intensity === 'low') return { sets: 3, reps: 12, restSeconds: 60 }
  return { sets: 3, reps: 10, restSeconds: 75 }
}

function difficultyFromProfile(activityLevel, intensity) {
  if (activityLevel === 'sedentary' || intensity === 'low') {
    return 'beginner'
  }
  if (activityLevel === 'active' && intensity === 'high') {
    return 'advanced'
  }
  if (activityLevel === 'light') {
    return 'beginner'
  }
  return 'intermediate'
}

function durationAndCalories(category, intensity, age) {
  let duration = 35
  let kcal = 280

  if (category === 'hiit') {
    duration = intensity === 'high' ? 25 : 20
    kcal = intensity === 'high' ? 320 : 260
  } else if (category === 'cardio') {
    duration = intensity === 'high' ? 40 : 30
    kcal = intensity === 'high' ? 380 : 300
  } else {
    duration = intensity === 'high' ? 50 : intensity === 'low' ? 35 : 45
    kcal = intensity === 'high' ? 420 : intensity === 'low' ? 280 : 360
  }

  // Slight reduction for older users
  if (age && age >= 50) {
    duration = Math.max(20, duration - 5)
    kcal = Math.max(100, kcal - 40)
  }

  return { durationMin: duration, estimatedKcal: kcal }
}

function buildRoutineShells(objectiveName, preferences) {
  const pref = (preferences || '').toLowerCase()
  const goal = (objectiveName || '').toLowerCase()

  const shells = []

  if (goal.includes('muscle') || goal.includes('force') || pref.includes('gym')) {
    shells.push(
      {
        name: 'Full Upper Body',
        description: 'Chest, back, shoulders and arms in one solid session.',
        category: 'strength',
        pool: 'strength',
      },
      {
        name: 'Legs and Glutes',
        description: 'Squats, hinges and lunges for strong lower body.',
        category: 'strength',
        pool: 'strength',
      }
    )
  }

  if (goal.includes('weight') || goal.includes('cardio') || pref.includes('run')) {
    shells.push({
      name: 'Interval Cardio',
      description: 'Burn fat and improve cardiovascular endurance.',
      category: 'cardio',
      pool: 'cardio',
    })
  }

  if (pref.includes('hiit') || goal.includes('cardio') || goal.includes('active')) {
    shells.push({
      name: 'HIIT Full Body',
      description: 'High intensity work for maximum results in less time.',
      category: 'hiit',
      pool: 'hiit',
    })
  }

  // Always ensure at least a few varied routines (no flexibility category)
  const defaults = [
    {
      name: 'Full Body Strength',
      description: 'Balanced strength session for the whole body.',
      category: 'strength',
      pool: 'strength',
    },
    {
      name: 'Steady Cardio',
      description: 'Moderate cardio to build endurance.',
      category: 'cardio',
      pool: 'cardio',
    },
    {
      name: 'Express HIIT',
      description: 'Short and intense metabolic conditioning.',
      category: 'hiit',
      pool: 'hiit',
    },
    {
      name: 'Core and Stability',
      description: 'Core strength to support the rest of your training.',
      category: 'strength',
      pool: 'strength',
    },
  ]

  for (const item of defaults) {
    if (shells.length >= 6) break
    if (!shells.find((s) => s.category === item.category && s.name === item.name)) {
      shells.push(item)
    }
  }

  return shells.slice(0, 6)
}

function weeklyAssignmentFromActivity(activityLevel, routineCount) {
  // Values are routine indexes or 'rest'
  if (activityLevel === 'sedentary' || activityLevel === 'light') {
    return [
      0,
      'rest',
      1,
      'rest',
      Math.min(2, routineCount - 1),
      'rest',
      'rest',
    ]
  }

  if (activityLevel === 'active') {
    return [
      0,
      1,
      'rest',
      Math.min(2, routineCount - 1),
      0,
      Math.min(3, routineCount - 1),
      'rest',
    ]
  }

  // moderate
  return [
    0,
    1,
    'rest',
    Math.min(2, routineCount - 1),
    Math.min(3, routineCount - 1),
    'rest',
    'rest',
  ]
}

/**
 * Generate a full plan payload for the current user profile.
 */
export async function generatePersonalizedPlan(profile) {
  const intensity = profile.intensity || 'medium'
  const activityLevel = profile.activity_level || 'moderate'
  const age = profile.age || 30
  const objectiveName = profile.objective_name || 'Stay active'
  const preferences = profile.preferences || ''
  const difficulty = difficultyFromProfile(activityLevel, intensity)

  const external = await fetchWgerExercises(15)
  const shells = buildRoutineShells(objectiveName, preferences)

  const routines = shells.map((shell) => {
    const localPool = FALLBACK_LIBRARY[shell.pool] || FALLBACK_LIBRARY.strength
    const mixed = [...localPool]

    // Blend a couple of external exercises when available
    for (const item of external.slice(0, 4)) {
      if (!mixed.find((m) => m.name.toLowerCase() === item.name.toLowerCase())) {
        mixed.push(item)
      }
    }

    const count = 4
    const chosen = pickExercises(mixed, count)
    const load = setsRepsForIntensity(intensity, shell.category)
    const metrics = durationAndCalories(shell.category, intensity, age)

    return {
      name: shell.name,
      description: shell.description,
      category: shell.category,
      difficulty,
      durationMin: metrics.durationMin,
      estimatedKcal: metrics.estimatedKcal,
      exercises: chosen.map((ex) => ({
        name: ex.name,
        muscleGroup: ex.muscleGroup || ex.muscle_group || 'General',
        description: ex.description || '',
        externalId: ex.externalId || null,
        sets: load.sets,
        reps: load.reps,
        restSeconds: load.restSeconds,
      })),
    }
  })

  const targetFrequency =
    activityLevel === 'sedentary'
      ? 2
      : activityLevel === 'light'
        ? 3
        : activityLevel === 'active'
          ? 5
          : 4

  return {
    objectiveId: profile.objective_id || null,
    durationWeeks: 4,
    targetFrequency,
    weeklyAssignment: weeklyAssignmentFromActivity(activityLevel, routines.length),
    routines,
    source: external.length > 0 ? 'versafit-ai + wger' : 'versafit-ai',
  }
}
