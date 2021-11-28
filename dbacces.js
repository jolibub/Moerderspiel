const sqlite = require('better-sqlite3')
let db = undefined

/* function User(id, name, pwhash, email, target, style, refreshedAt, respawnsAt, kills, refreshed){
    this.Id = id //Int Never change this in sourcecode!
    this.Name = name //String
    this.Password = pwhash //String
    this.Email = email //String
    this.Target = target //Int
    this.Style = style //String
    this.RefreshedAt = refreshedAt //String
    this.RespawnsAt = respawnsAt //String
    this.Kills = kills //Int
    this.Refreshed = refreshed //Bool
} */

export function loadDB(DBPath)
{
    db = new sqlite(DBPath)
}

export function getDBKillStyles()
{
    return db.prepare('SELECT * FROM Killstyles').all()
}

export function getDBUserById(id){
    return db.prepare('SELECT * FROM Users WHERE Id = (?)').get(id)
}

export function getDBUserByName(name){
    return db.prepare('SELECT * FROM Users WHERE Name = (?)').get(name)
}

export function getDBUserByEmail(email){
    return db.prepare('SELECT * FROM Users WHERE email = (?)').get(email)
}

export function createDBUser(name, pwhash, email){
    let defaultDate = new Date()
    defaultDate.setHours(defaultDate.getHours() - 24)

    db.prepare('INSERT INTO Users (Name, Password, Email, RefreshedAt, RespawnsAt) VALUES (?, ?, ?, ?, ?)')
        .run(name, pwhash, email, defaultDate.toString(), defaultDate.toString())
    
    return getDBUserByName(name)
}

export function getAllDBUsers(){
    return db.prepare('SELECT * FROM Users').all();
}

export function updateDBUsers(userList){
    userList.forEach(user => {
        updateDBUser(user)
    });
}

export function updateDBUser(user){
    db.prepare('UPDATE Users SET Name = (?), Password = (?), Email = (?), Target = (?), Style = (?), RefreshedAt = (?), RespawnsAt = (?), Kills = (?), Refreshed = (?) WHERE Id = (?)')
        .run(user.Name, user.Password, user.Email, user.Target, user.Style, user.RefreshedAt, user.RespawnsAt, user.Kills, user.Refreshed, user.Id)
}