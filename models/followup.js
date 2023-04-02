const mongoose = require('mongoose')

const Schema = mongoose.Schema
var objectId = Schema.objectId
const followupSchema = new Schema({
    text: [{
        type: String, required: true, default:[]
    }],
    date:{
        type: Date, required: true
    },

    email: {
        type: String, unique: true, required: true
    },
    adminId: {
        type:mongoose.Schema.Types.ObjectId
    }
    ,
    eemail: {
        type: String, default:null, required: true
    }

}, { timestamps: true })

const followup = mongoose.model('followups', followupSchema)
module.exports = followup