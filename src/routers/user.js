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

            res.json({code: 200, result: { user, token }});

        } else {
            res.json({code: 403, error: 'Access to the requested resource is forbidden!'});
        }
    } catch (error) {
        res.json({code: 400, error: error});
    }
})

// Login
router.post('/api/users/login', async(req, res) => {
    try {
        const { email, password } = req.body
        const user = await User.findByCredentials(email, password)
        if (!user) {
            res.json({code: 401, error: 'Login failed! Check authentication credentials'});
        }
        
        const token = await user.generateAuthToken()
        
        const userInfo = {
            id: user._id,
            name: user.first_name + ' ' + user.last_name,
            role: user.role,
            token: token
        };
        
        res.json({code: 200, result: userInfo});
        
    } catch (error) {
        res.json({code: 400, error: error});
    }

})

// Get info about logged user
router.get('/api/users/me', auth, async(req, res) => {
    res.send(req.user)
})

// Logout
router.post('/api/users/me/logout', auth, async (req, res) => {
    try {
        req.user.tokens = req.user.tokens.filter((token) => {
            return token.token != req.token
        })

        await req.user.save()
        
        res.json({code: 200})
    } catch (error) {
        res.json({code: 500, error: error});
    }
})

router.get("/", (req, res) => {
    res.setHeader("Access-Control-Allow-Origin", "*")
    res.setHeader("Access-Control-Allow-Credentials", "true");
    res.setHeader("Access-Control-Max-Age", "1800");
    res.setHeader("Access-Control-Allow-Headers", "content-type");
    res.setHeader( "Access-Control-Allow-Methods", "PUT, POST, GET, DELETE, PATCH, OPTIONS" ); 
});

module.exports = router