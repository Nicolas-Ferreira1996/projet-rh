const mongoose = require('mongoose')

const employeeSchema = new mongoose.Schema({
    photo: {
        type: String,
        required: [true, "la photo est requise"]
    },
    name: {
        type: String,
        required: [true, "Le titre est requis"],
    },
    position: {
        type: String,
        required: [true, "l'auteur est requis"]
    },
    blame: {
        type: Number,
        default: 0
    }
})



const employeeModel = mongoose.model('employee', employeeSchema)

module.exports = employeeModel