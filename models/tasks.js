const mongoose = require('mongoose');

const taskSchema = new mongoose.Schema({

    Description: {
        type: String,
        required: true,

    },
    task_category: {
        type: String,
        required: true,
    },
    starttime: {
        type: Date,
        required: true,
    },
    totalminutes: {
        type: Number,
        required: true,
    },
    employeeId: {
        type: mongoose.Schema.Types.ObjectId, default: null
    },
    date:{
        type:Date,
        default: new Date()
    }
}, { timestamps: true })

const Employeetask = new mongoose.model("Employeetask", taskSchema);
module.exports = Employeetask;