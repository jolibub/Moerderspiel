const sqlite = require('better-sqlite3')
let db = undefined

module.exports = {
    loadDB: function(DBPath)
    {
        db = new sqlite(DBPath)
    },
    getDBKillStyles: function()
    {
        return db.prepare('SELECT * FROM Killstyles').all()
    },
    getDBUserById: function(id){
        return db.prepare('SELECT * FROM Users WHERE Id = (?)').get(id)
    },
    getDBUserByName: function(name){
        return db.prepare('SELECT * FROM Users WHERE Name = (?)').get(name)
    },
    getDBUserByEmail: function(email){
        return db.prepare('SELECT * FROM Users WHERE email = (?)').get(email)
    },
    createDBUser: function(name, pwhash, email){
        let defaultDate = new Date()
        defaultDate.setHours(defaultDate.getHours() - 24)

        db.prepare('INSERT INTO Users (Name, Password, Email, RefreshedAt, RespawnsAt) VALUES (?, ?, ?, ?, ?)')
            .run(name, pwhash, email, defaultDate.toString(), defaultDate.toString())
        
        return module.exports.getDBUserByName(name)
    },
    getAllDBUsers: function(){
        return db.prepare('SELECT * FROM Users').all();
    },
    updateDBUsers: function(userList){
        userList.forEach(user => {
            module.exports.updateDBUser(user)
        });
    },
    updateDBUser: function(user){
        db.prepare('UPDATE Users SET Name = (?), Password = (?), Email = (?), Target = (?), Style = (?), RefreshedAt = (?), RespawnsAt = (?), Kills = (?), Refreshed = (?) WHERE Id = (?)')
            .run(user.Name, user.Password, user.Email, user.Target, user.Style, user.RefreshedAt, user.RespawnsAt, user.Kills, user.Refreshed, user.Id)
    }
}