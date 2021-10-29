require('dotenv').config()

const bcrypt = require("bcrypt")
const saltRounds = 10

const sqlite = require('better-sqlite3')
let db = new sqlite("./db/stuff.db")

const express = require('express')
const app = express()
const jwt = require('jsonwebtoken')
const { application } = require('express')
app.use(express.json())

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
        db.prepare('INSERT INTO Users (Name, Password, Email) VALUES (' + '\'' + 
                                   userData.username + '\',' + '\'' + userData.password + '\',' + '\'' + 
                                   userData.email + '\'' + ')'
                                 ).run()
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
         db.prepare('INSERT INTO Killstyles (Style) VALUES (' + '\'' + 
                                   style + '\')'
                                 ).run()
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
    validateUsername:(name) => {
        return /^[a-zA-Z ]+$/.test(name);
    }

}

const posts = [
    {
        username:"Kyle",
        title:'Post 1'
    },
    {
        username:"Tim",
        title:'Post 2'
    }
]

app.get('/posts', helper.authenticateToken, (req, res) => {
   res.json(posts.filter(post => post.username === req.user.name))
})

app.get('/test', (req, res) => {
    dbacc.createKillStyle('safsae');
})

app.get('/dashboard', (req, res) => {
    //Render frontend
})

app.get('/ingamedata', (req, res) =>{
    //Send user data
})

app.get('/ingame', (req, res) => {
    //Render frontend
})

app.get('/register', (req, res) => {
    //Render frontend
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
    
    dbacc.createUser({username: username, email: email, password: password})
    res.sendStatus(200);
})

app.get('/login' , (req, res) => {
    //Render frontend
})

app.post('/login', (req, res) => {

    const username = req.body.username
    const password = req.body.password
    const user = { name: username }

    const dbuser = dbacc.getUserByName(username)

    if (dbuser == undefined)
        return res.json({error: "this user doesnt exist"})
    
    const pwhash = dbuser.Password

    if (!helper.checkPassword(password, pwhash))
        return res.json({error: "username or password wrong"})

    const accessToken = jwt.sign(user, process.env.ACCESS_TOKEN_SECRET)
    res.json({ accessToken: accessToken })
})

const setup = () => {
    app.listen(8080)
}

setup()