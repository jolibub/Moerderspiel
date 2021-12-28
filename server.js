require('dotenv').config()

const bcrypt = require("bcrypt")
const saltRounds = 10

const express = require('express')
const app = express()
app.use(express.json())
app.use(express.static('dist'))

const jwt = require('jsonwebtoken')

let db = require('./dbacces.js')

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
        return re.test(String(email).toLowerCase())
    },
    validateUsername: (name) => {
        return /^[a-zA-Z ]+$/.test(name)
    },
    isDead: (dbuser) => {
        const respawnTime = new Date(dbuser.RespawnsAt).getTime()
        return respawnTime >= Date.now()
    },
    kill: (id) => {
        dbuser = db.getDBUserById(id)
        if (helper.isDead(dbuser))
            throw 'Subject is already dead'

        let date = new Date()
        date.setHours(date.getHours() + 2)

        dbuser.RespawnsAt = date.toString()
        db.updateDBUser(dbuser)
    },
    isRefreshing: (dbuser) => {
        const refreshTime = new Date(dbuser.RefreshedAt).getTime()
        return refreshTime > Date.now()
    },
    refresh: (dbuser) => {
        if (helper.isRefreshing(dbuser))
            throw 'User is already refreshing'

        let date = new Date()
        date.setHours(date.getHours() + 2)

        dbuser.RefreshedAt = date.toString()
        dbuser.Refreshed = 0
        db.updateDBUser(dbuser)
    },
    getRandomKillStyle: () => {
        const killStyles = db.getDBKillStyles()
        const pick = killStyles.length * Math.random() << 0
        return killStyles[pick]
    },
    setNewTarget: (dbuser) => {
        const users = db.getAllDBUsers().filter(user => (user.Id != dbuser.Id) && (dbuser.Target != user.Id))
        const pick = users.length * Math.random() << 0
        dbuser.Target = users[pick].Id
        dbuser.Style = helper.getRandomKillStyle().Style
        db.updateDBUser(dbuser)
    },
    checkRefresh: (dbuser) => {
        if (helper.isRefreshing(dbuser))
            return

        if(dbuser.Refreshed == 1)
            return

        helper.setNewTarget(dbuser)
        dbuser.Refreshed = 1
        db.updateDBUser(dbuser)
    },
    resetUser: (dbuser) => {
        dbuser.Kills = 0
        dbuser.RespawnTime = Date.now().toString()

        let tmpDt = new Date()
        tmpDt.setHours(tmpDt.getHours() - 24)
        dbuser.RefreshedAt = tmpDt.toString()
    },
    login: (username,pw) => {
        const dbuser = db.getDBUserByName(username)

        if (dbuser == undefined)
            return {error: "this user doesnt exist"}
    
        const pwhash = dbuser.Password

        if (!helper.checkPassword(pw, pwhash))
            return {error: "username or password wrong"}

        const accessToken = jwt.sign({id: dbuser.Id}, process.env.ACCESS_TOKEN_SECRET)
        return accessToken
    }
}

app.get('/dashboarddata', (req, res) => {
    const users = db.getAllDBUsers()
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
    const dbuser = db.getDBUserById(req.user.id)
    helper.checkRefresh(dbuser)
    const data = { name: dbuser.Name
                 , target: db.getDBUserById(dbuser.Target).Name
                 , style: dbuser.Style
                 , refreshedAt: dbuser.RefreshedAt
                 , respawnsAt: dbuser.RespawnsAt
                 , kills: dbuser.Kills
                 }

    res.json(data)
})

app.post('/refresh', helper.authenticateToken, (req, res) => {
    dbuser = db.getDBUserById(req.user.id)
    
    if (!helper.isRefreshing(dbuser))
    {
        helper.refresh(dbuser)
        db.updateDBUser(dbuser)
    }

    const data = { name: dbuser.Name
        , target: db.getDBUserById(dbuser.Target).Name
        , style: dbuser.Style
        , refreshedAt: dbuser.RefreshedAt
        , respawnsAt: dbuser.RespawnsAt
        , kills: dbuser.Kills
        }

    res.json(data)
})

app.post('/kill', helper.authenticateToken, (req, res) => {
    let dbuser = db.getDBUserById(req.user.id)
    
    if (helper.isDead(dbuser))
        return res.json({error: "killer is dead"})

    if (helper.isRefreshing(dbuser))
        return res.json({error: "killer is refreshing at the moment"})
    
    if (helper.isDead(db.getDBUserById(dbuser.Target)))
        return res.json({error: "target is already dead"})

    helper.kill(dbuser.Target)
    dbuser.Kills += 1
    helper.setNewTarget(dbuser)
    db.updateDBUser(dbuser)
    const data = { name: dbuser.Name
        , target: db.getDBUserById(dbuser.Target).Name
        , style: dbuser.Style
        , refreshedAt: dbuser.RefreshedAt
        , respawnsAt: dbuser.RespawnsAt
        , kills: dbuser.Kills
        }

    res.json(data)
})

app.post('/register', (req, res) => {
    const username = req.body.username
    const email = req.body.email
    const password = helper.hashPassword(req.body.password)

    if (!helper.validateUsername(username))
        return res.json({error: "username must contain only letters"})
    
    if (!helper.validateEmail(email))
        return res.json({error: "enter a valid email"})

    if (db.getDBUserByName(username) != undefined)
        return res.json({error: "username already taken"})
    
    if (db.getDBUserByEmail(email) != undefined)
        return res.json({error: "email already taken"})
    
    db.createDBUser(username, password, email)
    res.sendStatus(200)
})

app.post('/login', (req, res) => {
    res.json({ accessToken: helper.login(req.body.username, req.body.password)})
})

app.get('/restart', helper.authenticateToken, (req, res) => {
    const dbuser = db.getDBUserById(req.user.id)

    if (!(dbuser.Name == 'Tim' || dbuser.Name == 'Tobi')) return

    users = db.getAllDBUsers()

    users.forEach(user => {
        helper.resetUser(user)
        helper.setNewTarget(user)
    })

    db.updateDBUsers(users)

    res.sendStatus(200)
})

app.post('/killstyle', helper.authenticateToken, (req, res) => {
    const dbuser = db.getDBUserById(req.user.id)

    if (!(dbuser.Name == 'Tim' || dbuser.Name == 'Tobi')) return
    
    db.setDBKillStyle(req.body.style)

})

app.get('/killstyles',  (req, res) => {
    res.json(db.getDBKillStyles())

})

const setup = () => {
    db.loadDB('./db/stuff.db')
    app.listen(80)
}

setup()
