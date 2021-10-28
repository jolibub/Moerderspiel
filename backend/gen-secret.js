const fs = require('fs')
const cr = require('crypto')

filename = ".env"
newdata = ""
const token = cr.randomBytes(64).toString("hex")

data = fs.readFileSync(filename, 'UTF-8')
const lines = data.split(/\r?\n/);

found = false

lines.forEach((line) => {
    if (line.includes("ACCESS_TOKEN_SECRET="))
    {
        newdata = newdata + "ACCESS_TOKEN_SECRET=" + token
        found = true
    }
    else if (line === "")
    {
        newdata = newdata + "ACCESS_TOKEN_SECRET=" + token
        found = true
    }
    else
    {
        newdata = newdata + line + "\n"
    }
});

if (found == false)
    newdata = newdata + "ACCESS_TOKEN_SECRET=" + token

fs.writeFileSync(filename, newdata)