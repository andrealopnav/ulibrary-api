require('dotenv').config();
const express = require('express')
const userRouter = require('./routers/user')
const bookRouter = require('./routers/book')
const port = process.env.PORT
require('./db/db')

const app = express()

app.use(express.json())
app.use(userRouter)
app.use(bookRouter)

app.listen(port, () => {
    console.log(`Server running on port ${port}`)
})