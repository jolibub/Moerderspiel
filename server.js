require('dotenv').config()

const bcrypt = require("bcrypt")
const saltRounds = 10

const express = require('express')
const app = express()
app.use(express.json())
app.use(express.static('dist'))

const jwt = require('jsonwebtoken')

import {loadDB, createDBUser, getAllDBUsers, getDBUserById, updateDBUsers, updateDBUser, getDBUserByName, getDBUserByEmail, getDBKillStyles} from './dbacces.js'

let gamestarted = true

let helper =
{
    authenticateToken: (req, res, next) => {
        const authHeader = req.headers['authorization']
        const token = authHeader && authHeader.split(' ')[1]

        if (token == null) 
            return res.sendStatus(401)

        jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, (err, user) => {
            if (err) return res.sendStatus(403)
            req.user = user
            next()
        })
    },
    checkPassword: (pw, hash) => {
        return bcrypt.compareSync(pw, hash)
    },
    hashPassword: (pw) => {
        const salt = bcrypt.genSaltSync(saltRounds)
        return bcrypt.hashSync(String(pw), salt)
    },
    validateEmail: (email) => {
        const re = /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
        return re.test(String(email).toLowerCase());
    },
    validateUsername: (name) => {
        return /^[a-zA-Z ]+$/.test(name);
    },
    isDead: (dbuser) => {
        const respawnTime = new Date(dbuser.RespawnsAt).getTime()
        return respawnTime >= Date.now()
    },
    kill: (id) => {
        dbuser = getDBUserById(id)

        if (isDead(dbuser))
            throw 'Subject is already dead'

        let date = new Date()
        date.setHours(date.getHours() + 2)

        dbuser.respawnTime = date.toString()
        updateDBUser(dbuser)
    },
    isRefreshing: (dbuser) => {
        const refreshTime = new Date(dbuser.RefreshedAt).getTime()
        return refreshTime <= Date.now()
    },
    refresh: (dbuser) => {
        if (isRefreshing(dbuser))
            throw 'User is already refreshing'

        let date = new Date()
        date.setHours(date.getHours() + 2)

        dbuser.refreshedAt(date.toString())
        dbuser.Refreshed = 0
        updateDBUser(dbuser)
    },
    getRandomKillStyle: () => {
        const killStyles = getDBKillStyles()
        const pick = killStyles.length * Math.random() << 0
        return killStyles[pick]
    },
    setNewTarget: (dbuser) => {
        const users = getAllDBUsers().filter(user => (user.Id != dbuser.Id) && (dbuser.Target != user.Id))
        const pick = users.length * Math.random() << 0
        dbuser.Target = users[pick]
        dbuser.Style = helper.getRandomKillStyle()
        updateDBUser(dbuser)
    },
    checkRefresh: (dbuser) => {
        if (isRefreshing(dbuser))
            return

        if(dbuser.Refreshed == 1)
            return

        setNewTarget(dbuser);
        dbuser.Refreshed = 1
        updateDBUser(dbuser)
    }
}

app.get('/dashboarddata', (req, res) => {
    const users = getAllDBUsers()
    scoreboarddata = []

    users.forEach( user => {
        scoreboarddata.push( {
                               name: user.Name
                             , kills: user.Kills
                             , dead: helper.isDead(user)
                             }
                           )
    })

    res.json(scoreboarddata)
})

app.get('/ingamedata', helper.authenticateToken, (req, res) =>{
    const dbuser = getDBUserById(req.user.id)
    helper.checkRefresh(dbuser)
    const data = { name: dbuser.Name
                 , target: getDBUserById(dbuser.Target).Name
                 , style: dbuser.Style
                 , refreshedAt: dbuser.RefreshedAt
                 , respawnsAt: dbuser.RespawnsAt
                 , kills: dbuser.Kills
                 }

    res.json(data)
})

app.post('/refresh', helper.authenticateToken, (req, res) => {
    dbuser = getDBUserById(req.user.id)
    
    if (!helper.isRefreshing(dbuser))
    {
        helper.refresh(dbuser)
        updateDBUser(dbuser)
    }
    
    res.json(dbuser.RefreshedAt)
})

app.post('/kill', helper.authenticateToken, (req, res) => {
    let dbuser = getDBUserById(req.user.id)
    
    if (helper.isDead(dbuser))
        return res.json({error: "killer is dead"})

    if (helper.isRefreshing(dbuser))
        return res.json({error: "killer is refreshing at the moment"})
    
    if (helper.isDead(dbuser.Target))
        return res.json({error: "target is already dead"})

    helper.kill(dbuser.Target)
    dbuser.Kills += 1
    helper.setNewTarget(dbuser)
    updateDBUser(dbuser)
})

app.post('/register', (req, res) => {
    const username = req.body.username
    const email = req.body.email
    const password = helper.hashPassword(req.body.password)

    if (!helper.validateUsername(username))
        return res.json({error: "username must contain only letters"})
    
    if (!helper.validateEmail(email))
        return res.json({error: "enter a valid email"})

    if (getDBUserByName(username) != undefined)
        return res.json({error: "username already taken"})
    
    if (getDBUserByEmail(email) != undefined)
        return res.json({error: "email already taken"})
    
    createDBUser(username, password, email)
    res.sendStatus(200);
})

app.post('/login', (req, res) => {

    const username = req.body.username
    const password = req.body.password

    const dbuser = getDBUserByName(username)

    if (dbuser == undefined)
        return res.json({error: "this user doesnt exist"})
    
    const pwhash = dbuser.Password

    if (!helper.checkPassword(password, pwhash))
        return res.json({error: "username or password wrong"})

    const accessToken = jwt.sign({id: dbuser.Id}, process.env.ACCESS_TOKEN_SECRET)
    res.json({ accessToken: accessToken })
})

// post restart

app.post('/start', (req, res) => {
    if (gamestarted)
        return res.json({error: "the game already started"})
})

// post stop

const setup = () => {
    loadDB('./db/stuff.db')
    app.listen(8080)
}

setup()
