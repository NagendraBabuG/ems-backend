const mongoose = require('mongoose')

const Schema = mongoose.Schema
var objectId = Schema.objectId
const adminSchema = new Schema({
    name: {
        type: String, required: true
    },

    email: {
        type: String, unique: true, required: true
    },
    contact: {
        type: String, default: null
    },
    Organization: {
        type: String, default:null
    },
    // employees: [{
    //     type: mongoose.Schema.Types.objectId
    // }]
    employees:[{type: mongoose.Schema.Types.ObjectId,unique : true, default:[]}]

}, { timestamps: true })

const admin = mongoose.model('admins', adminSchema)
module.exports = admin