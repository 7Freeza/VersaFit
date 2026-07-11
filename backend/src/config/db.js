/** 
 * Database connection using node-postges
 * Reads credentials from enviroment variables
*/

import pg from'pg'
import dotenv from 'dotenv'

dotenv.config()
