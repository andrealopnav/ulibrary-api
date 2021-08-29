const express = require('express')
const mongoose = require('mongoose')
const User = require('../models/User')
const auth = require('../middleware/auth')

const router = express.Router()

// Create a new user
router.post('/api/user', auth, async (req, res) => {
    try {
        if(req.user.role == 'librarian') {
            const user = new User(req.body)
            await user.save()
            const token = await user.generateAuthToken()
            res.status(201).send({ user, token })
        } else {
            return res.status(403).send({error: 'Access to the requested resource is forbidden!'})
        }
    } catch (error) {
        res.status(400).send(error)
    }
})

// Login
router.post('/api/users/login', async(req, res) => {
    try {
        const { email, password } = req.body
        const user = await User.findByCredentials(email, password)
        if (!user) {
            return res.status(401).send({error: 'Login failed! Check authentication credentials'})
        }
        const token = await user.generateAuthToken()
        res.send({ user, token })
    } catch (error) {
        res.status(400).send(error)
    }

})

// Get info about logged user
router.get('/api/users/me', auth, async(req, res) => {
    res.send(req.user)
})

router.get("/", (req, res) => {
    res.setHeader("Access-Control-Allow-Origin", "*")
    res.setHeader("Access-Control-Allow-Credentials", "true");
    res.setHeader("Access-Control-Max-Age", "1800");
    res.setHeader("Access-Control-Allow-Headers", "content-type");
    res.setHeader( "Access-Control-Allow-Methods", "PUT, POST, GET, DELETE, PATCH, OPTIONS" ); 
});

module.exports = router