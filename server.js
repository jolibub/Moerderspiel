require('dotenv').config()

const sqlite = require('sqlite3').verbose()
const { open } =  require("sqlite")

const dbPromise = open({
    filename: 'db/stuff.db',
    driver: sqlite.Database
})

const express = require('express')
const app = express()
const jwt = require('jsonwebtoken')
const { application } = require('express')
app.use(express.json())

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

app.get('/posts', authenitcateToken, (req, res) => {
   res.json(posts.filter(post => post.username === req.user.name))
})

app.get('/test', async (req, res) => {
    await dbacc.createUser({name: 'aef', password: 'adcwd', email: 'awdawda'})
    users = await dbacc.getUserById(2)
    res.json(users)
})

let dbacc = {
    getUsers: async() =>{
        const db = await dbPromise;
        const users = await db.all('SELECT * FROM Users')
        return users
    },
    getUserByName: async(name) => {
        const db = await dbPromise;
        const user = await db.all('SELECT * FROM Users WHERE Name =\'' + name + '\'')
        return user
    },
    getUserById: async(Id) => {
        const db = await dbPromise;
        const user = await db.all('SELECT * FROM Users WHERE Id =' + Id)
        return user
    },
    createUser: async(userData) =>{
        const db = await dbPromise;
        await db.all('INSERT INTO Users (Name, Password, Email) VALUES (' + '\'' + 
                                   userData.name + '\',' + '\'' + userData.password + '\',' + '\'' + 
                                   userData.email + '\'' + ')'
                                 )
    },
    getKillStyles: async() => {
        const db = await dbPromise;
        const styles = await db.all('SELECT * FROM Killstyles')
        return styles
    },
    getKillStyleById: async(Id) => {
        const db = await dbPromise;
        const style = await db.all('SELECT * FROM Killstyles WHERE Id =' + Id)
        return style
    }
}

app.get('/register', (req, res) => {
    //Implement me!
})

app.post('/register', (req, res) => {

})

app.post('/login', (req, res) => {
    //auth user
    const username = req.body.username
    const user = { name: username }

    const accessToken = jwt.sign(user, process.env.ACCESS_TOKEN_SECRET)
    res.json({ accessToken: accessToken })
})

function authenitcateToken(req, res, next){
    const authHeader = req.headers['authorization']
    const token = authHeader && authHeader.split(' ')[1]

    if (token == null) return res.sendStatus(401)

    jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, (err, user) => {
        if (err) return res.sendStatus(403)
        req.user = user
        next()
    })
}

const setup = async () => {
    const db = await dbPromise
    app.listen(8080)
}

setup()