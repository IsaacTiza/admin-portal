import dotenv from 'dotenv'
dotenv.config({ path: './.env' })
import mongoose from 'mongoose'
import app from './app.js'

async function connectDB() {
    await mongoose.connect(process.env.MONGODB_URI)
    console.log('Connected to MongoDB')
}

app.listen(process.env.PORT, () => {
    connectDB()
    console.log(`Server is running on port ${process.env.PORT}`)
 })

