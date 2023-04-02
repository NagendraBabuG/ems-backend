const mongoose = require('mongoose')

const Schema = mongoose.Schema
var objectId = Schema.objectId
const employeeSchema = new Schema({
    name: {
        type: String, required: true
    },

    email: {
        type: String, required: true
    },
    role: {
        type: String
    },
    contact: {
        type: String, required: true
    },
    department: {
        type: String
    },
    dateOfJoin: {
        type: Date, required: true
    }
    ,
    adminId: {
        type: mongoose.Schema.Types.ObjectId, default: null
    }


}, { timestamps: true })

const employee = mongoose.model('employees', employeeSchema)
module.exports = employee