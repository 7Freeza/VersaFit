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