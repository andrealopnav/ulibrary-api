require('dotenv').config();
const express = require('express')
const userRouter = require('./routers/user')
const bookRouter = require('./routers/book')
const port = process.env.PORT
require('./db/db')
const cors = require('cors');

const app = express()

const corsOptions ={
    origin:'http://localhost:3000', 
    credentials:true,            //access-control-allow-credentials:true
    optionSuccessStatus:200
}
app.use(cors());

app.use(express.json())
app.use(userRouter)
app.use(bookRouter)

app.listen(port, () => {
    console.log(`Server running on port ${port}`)
})