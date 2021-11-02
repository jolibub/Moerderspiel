require('dotenv').config()

const bcrypt = require("bcrypt")
const saltRounds = 10

const sqlite = require('better-sqlite3')
let db = new sqlite("./db/stuff.db")

const express = require('express')
const app = express()
app.use(express.json())
app.use(express.static('dist'))

const jwt = require('jsonwebtoken')

let dbacc = {
    getUsers: () =>{
        const users = db.prepare('SELECT * FROM Users').all()
        return users
    },
    getUserByName: (name) => {
        const user = db.prepare('SELECT * FROM Users WHERE Name = ?').get(name)
        return user
    },
    getUserById: (Id) => {
        const user = db.prepare('SELECT * FROM Users WHERE Id = ?').get(Id)
        return user
    },
    getUserByEmail: (email) => {
        const user = db.prepare('SELECT * FROM Users WHERE Id = ?').get(email)
        return user
    },
    createUser: (userData) =>{
        db.prepare('INSERT INTO Users (Name, Password, Email, RefreshedAt, RespawnsAt) VALUES (?, ?, ?, ?, ?)')
            .run(userData.username, userData.password, userData.email, userData.datestring, userData.datestring)
    },
    getKillStyles: () => {
        const styles = db.prepare('SELECT * FROM Killstyles').all()
        return styles
    },
    getKillStyleById: (Id) => {
        const style = db.prepare('SELECT * FROM Killstyles WHERE Id =').get(Id)
        return style
    },
    createKillStyle: (style) => {
        db.prepare('INSERT INTO Killstyles (Style) VALUES (?)').run(style)
    },
    setUserRespawnTime: (Id, datestring) => {
        db.prepare('UPDATE Users SET RespawnsAt = (?) WHERE Id = (?)').run(datestring, Id)
    },
    setUserRefreshedTime: (Id, datestring) => {
        db.prepare('UPDATE Users SET RefreshedAt = (?) WHERE Id = (?)').run(datestring, Id)
    },
    getUserIds: () => {
        const userIds = db.prepare('SELECT Id FROM Users').all()
        return userIds
    }
}

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
        return bcrypt.hashSync(pw, salt)
    },
    validateEmail: (email) => {
        const re = /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
        return re.test(String(email).toLowerCase());
    },
    validateUsername: (name) => {
        return /^[a-zA-Z ]+$/.test(name);
    },
    isDead: (id) => {
        const dbuser = helper.getUserById(id)
        const respawnTime = new Date(dbuser.RespawnsAt).getTime()
        return respawnTime <= Date.now()
    },
    kill: (id) => {
        if (isDead(id))
            throw 'Subject is already dead'

        let date = new Date()
        date.setHours(date.getHours() + 2)

        dbacc.setUserRespawnTime(id, date.toString())
    },
    isRefreshing: (id) => {
        const dbuser = helper.getUserById(id)
        const refreshTime = new Date(dbuser.RefreshedAt).getTime()
        return refreshTime <= Date.now()
    },
    refresh: (id) => {
        if (isRefreshing(id))
            throw 'User is already refreshing'

        let date = new Date()
        date.setHours(date.getHours() + 2)

        dbacc.setUserRefreshedTime(id, date.toString())
    },
    setNewTarget: (id) => {

    }
}

app.get('/dashboarddata', (req, res) => {
    const users = dbacc.getUsers()
    scoreboarddata = []

    users.forEach( user => {
        scoreboarddata.push({name: user.Name, kills: user.Kills, dead: helper.isDead(user.Id)})
    })
})

app.get('/ingamedata', authenticateToken, (req, res) =>{
    const dbUser = dbacc.getUserById(req.user.id)

    const data = { name: dbUser.Name
                 , target: dbUser.Target
                 , style: dbUser.Style
                 , refreshedAt: dbUser.RefreshedAt
                 , respawnsAt: dbUser.RespawnsAt
                 , kills: dbUser.Kills
                 }

    res.json(data)
})

app.post('/refresh', helper.authenticateToken, (req, res) => {
    if (helper.isRefreshing(req.user.id))
        return res.json({error: "already refreshing"})

    helper.refresh(req.user.id)
})

app.post('/kill', helper.authenticateToken, (req, res) => {
    const dbuser = dbacc.getUserById(req.user.id)
    
    if (helper.isDead(req.user.id))
        return res.json({error: "killer is dead"})

    if (helper.isRefreshing(req.user.id))
        return res.json({error: "killer is refreshing at the moment"})
    
    if (helper.isDead(dbuser.Target))
        return res.json({error: "target is already dead"})

    helper.kill(dbuser.Target)

})

app.post('/register', (req, res) => {
    const username = req.body.username
    const email = req.body.email
    const password = helper.hashPassword(req.body.password)

    if (!helper.validateUsername(username))
        return res.json({error: "username must contain only letters"})
    
    if (!helper.validateEmail(email))
        return res.json({error: "enter a valid email"})

    if (dbacc.getUserByName(username) != undefined)
        return res.json({error: "username already taken"})
    
    if (dbacc.getUserByEmail(email) != undefined)
        return res.json({error: "email already taken"})
    
    dbacc.createUser({username: username, email: email, password: password, datestring: Date()})
    res.sendStatus(200);
})

app.post('/login', (req, res) => {

    const username = req.body.username
    const password = req.body.password

    const dbuser = dbacc.getUserByName(username)

    if (dbuser == undefined)
        return res.json({error: "this user doesnt exist"})
    
    const pwhash = dbuser.Password

    if (!helper.checkPassword(password, pwhash))
        return res.json({error: "username or password wrong"})

    const accessToken = jwt.sign({id: dbuser.Id}, process.env.ACCESS_TOKEN_SECRET)
    res.json({ accessToken: accessToken })
})

const setup = () => {
    app.listen(8080)
}

setup()
