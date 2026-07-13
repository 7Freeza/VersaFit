import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { query } from '../config/db.js';

const JWT_SECRET = process.env.JWT_SECRET || 'versafit_secret_key'

export async function register(req, res) {
    try {
        const { name, email, password, weight, height, goal } = req.body
    
        if (!name || !email || !password) {
            return res.status(400).json({ message: 'Name, email and password are required' })
        }

        const existingUser = await query('SELECT id FROM users WHERE email = $1', [email])
        
        if (existingUser.rows.length > 0) {
            return res.status(409).json({ message: 'This email is already registered' })
        }

        const passwordHash = await bcrypt.hash(password, 10)

        const newUser = await query(
            'INSERT INTO users (name, email, password_hash, weight, height, goal) VALUES ($1, $2, $3, $4, $5, $6) RETURNING id, name, email, weight, height, goal, created_at',
            [name, email, passwordHash, weight || null, height || null, goal || 'keep']
        )

        const user = newUser.rows[0]

        const token = jwt.sign({ id: user.id, email: user.email }, JWT_SECRET, { 
            expiresIn: '1d',
        })

        return res.status(201).json({
            message: 'User registered successfully',
            user,
            token,
        })
    } catch (error) {
        console.error('Error during user registration:', error.message)
        return res.status(500).json({ message: 'Internal server error' })
    }
}

export async function login(req, res) {
    try {
        const { email, password } = req.body

        if (!email || !password) {
            return res.status(400).json({ message: 'Email and password are required' })
        }

        const result = await query('SELECT * FROM users WHERE email = $1', [email])

        if (result.rows.length === 0) {
            return res.status(401).json({ message: 'Invalid email or password' })
        }

        const user = result.rows[0]

        const isPasswordValid = await bcrypt.compare(password, user.password_hash)

        if (!isPasswordValid) {
            return res.status(401).json({ message: 'Invalid email or password' })
        }

        const token = jwt.sign({ id: user.id, email: user.email }, JWT_SECRET, {
            expiresIn: '1d',
        })

        return res.status(200).json({
            message: 'Login successful',
            user: {
                id: user.id,
                name: user.name,
                email: user.email,
                weight: user.weight,
                height: user.height,
                goal: user.goal
            },
            token,
        })
    } catch (error) {
        console.error('Error during user login:', error.message)
        return res.status(500).json({ message: 'Internal server error' })
    }
}
