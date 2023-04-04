const express = require("express")
const mongoose = require('mongoose')
const AdminRole = require("../models/admin")
const Employee = require("../models/employee")
const admin = require('../config/firebase-config')
const Task = require('../models/tasks')
const middleware = require('../middleware/index')
const moment = require('moment')
const Followup = require('../models/followup')

const router = express.Router()

router.use(middleware)

router.get('/myDetails', async (req, res) => {
    const email = req.query.email;
    if (!email) res.status(400).json({ status: 'failed', data: "missing data" })
    try {
        const employeeObject = await Employee.findOne({ email: email })
        if (!employeeObject) res.status(400).json({ status: 'failed', data: "user not found" })
        res.status(200).json({ status: "success", data: employeeObject })
    }
    catch (error) {
        console.log(error)
        res.status(400).json({ status: "error", error: error })
    }

})
router.post('/addTask', async (req, res) => {
    const description = req.body.description, taskCategory = req.body.taskCategory, startTime = req.body.startTime
    const numberMinutes = req.body.minutes, employeeEmail = req.body.email;
    if (!description || !taskCategory || !startTime || !numberMinutes || !employeeEmail) {
        return res.status(400).json({ status: 'failed', data: 'missing data' })
    }
    try {
        const getEmployee = await Employee.findOne({email : employeeEmail})
        const employeeId = getEmployee._id
        const taskAdded = await Task.create({
            Description: description,
            task_category: taskCategory,
            starttime: startTime,
            totalminutes: numberMinutes,
            employeeId: employeeId
        })
        if (!taskAdded) return res.status(400).json({ status: 'failed', error: 'error in creating task' })

        res.status(200).json({ status: 'success', data: 'taskAdded' })

    }
    catch (error) {
        console.log(error)
        res.status(400).json({ status: "error", error: error })
    }
})

router.post('/editDetails', async(req, res)=> {
    const contact = req.body.contact, name = req.body.name;
    const email = req.body.email
    try{
        let UpdatedEmployee;
        if(contact) UpdatedEmployee = await Employee.updateOne({email : email}, {contact : contact})
        if(name) UpdatedEmployee = await Employee.updateOne({email : email}, {name : name})
        if(!UpdatedEmployee) return res.status(400).json({status : 'failed', error : 'cannot perfom the operation'})
       return  res.status(200).json({status : 'success', data : UpdatedEmployee})
    }
    catch(error)
    {
        return res.status(400).json({status: "failed", error: error})
    }
})
router.get('/getTasksDay', async (req, res) => {
    const eid = req.body.id, date = req.body.date;
    if (!eid || !date) res.status(400).json({ status: 'failed', data: "missing data" })
    // const queryDate = moment(date).format('YYYY:MM:DD');
    console.log(date)
    const queryDate = new Date(date);
    console.log('queryDate ', queryDate)
    const startOfDay = new Date(queryDate.getFullYear(), queryDate.getMonth(), queryDate.getDate());
    const endOfDay = new Date(startOfDay.getTime() + (24 * 60 * 60 * 1000));
    console.log(queryDate)
    console.log('startofDay ', startOfDay);
    console.log('endofDay ', endOfDay)
    console
    try {
        //const tasks = await Task.find({employeeId:eid, date:date})
        const tasks = await Task.find(

            {
                date: { $gte: startOfDay, $lt: endOfDay },
                employeeId: eid

            }
        )
        console.log(tasks)
        //console.log(result)
        if (!tasks) res.status(400).json({ status: 'failed', data: "tasks not found" })
        res.status(200).json({ status: "success", data: tasks })
    }
    catch (error) {
        console.log(error)
        res.status(400).json({ status: "error", error: error })
    }
})
router.get('/allTasks', async (req, res)=>{
    
    //console.log(req.body)
    const email = req.query.email;
    if (!email) return res.status(400).json({ status: 'failed', data: "missing data" })
    // const queryDate = moment(date).format('YYYY:MM:DD');
   
    try {
        const employeeObject = await Employee.findOne({email: email})
        if(!employeeObject) return res.status(400).json({status:'failed', data: 'employee not found'})
        //const tasks = await Task.find({employeeId:eid, date:date})
        const tasks = await Task.find(

            {
                
                employeeId: employeeObject._id

            }
        )
        console.log(tasks)
        //console.log(result)
        if (!tasks) res.status(400).json({ status: 'failed', data: "tasks not found" })
        res.status(200).json({ status: "success", data: tasks })
    }
    catch (error) {
        console.log(error)
        res.status(400).json({ status: "error", error: error })
    }
})
router.get('/getTaskRange', async (req, res) => {
    const eid = req.body.id, startDate = req.body.startDate, endDate = req.body.endDate;
    if (!eid || !startDate || !endDate) res.status(400).json({ status: 'failed', data: "missing data" })
    const sDate = new Date(startDate)
    sDate.setHours(0, 0, 0, 0);
    const eDate = new Date(endDate)
    eDate.setHours(23, 59,59, 59);
    console.log("start Date ", sDate)
    console.log("end Date ", eDate)
 //   const eDate = new Date(edate.getTime() + (24 * 60 * 60 * 1000));
    try {
        const tasks = await Task.find(

            {
                date: { $gte: sDate, $lte: eDate },
                employeeId: eid

            }
        )
        console.log(tasks)
        if (!tasks) res.status(400).json({ status: 'failed', data: "tasks not found" })
        res.status(200).json({ status: "success", data: tasks })
    }
    catch (error) {
        console.log(error)
        res.status(400).json({ status: "error", error: error })

    }
})

router.get('/getfollowups', async (req, res) => {
    const email = req.query.email
    let now = new Date();
    console.log(email)
    let end = new Date(now.getFullYear(), now.getMonth(), now.getDate() - 2);
    now.setHours(0, 0, 0, 0);
    end.setHours(23,59,59, 59)
    if(!email) return res.status(400).json({ status: "error", error: "missing data" })
    try{
        const followups = await Followup.find({
            createdAt: { $gte: end, $lte: now },
                eemail: email
        })
        console.log('followups ',followups)
        if (!followups) res.status(400).json({ status: 'failed', data: "tasks not found" })
        return res.status(200).json({ status: "success", data: followups })
    }
    catch (error){
        res.status(400).json({ status: "error", error: error })
    }
})

module.exports = router