const express = require("express")
const mongoose = require('mongoose')
const session = require('express-session')
const companyRouter = require("./routes/companyRouter")
const employeeRouter = require("./routes/employeeRouter")
require('dotenv').config()

const app = express()
app.use(express.static('./publics'))
app.use(session({
    saveUninitialized: true,
    resave: true,
    secret: process.env.CRYPTSESS
}))
app.use(express.urlencoded({ extended: true }))
app.use(companyRouter)
app.use(employeeRouter)

app.listen(process.env.PORT, (err) => {
    if (err) {
        console.log(err);
    } else {
        console.log("connecté");
    }
})

console.log("server");


mongoose.connect(process.env.MONGO)
