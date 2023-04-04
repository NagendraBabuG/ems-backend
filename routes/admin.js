const express = require("express")
const mongoose = require('mongoose')
const AdminRole = require("../models/admin")
const Employee = require("../models/employee")
const Followup = require("../models/followup")
const admin = require('../config/firebase-config')
const middleware = require('../middleware/index')


const router = express.Router()

router.use(middleware)

router.get('/', async (req, res)=> {
    res.status(200).json({status : "it's working!!!"})
})


router.post('/addEmployee', async (req, res) => {
    const adminEmail = req.body.adminEmail
    const username = req.body.name, password = req.body.password, contact = req.body.contact, doj = req.body.doj
    const role = req.body.role
    const Deparment = req.body.Department, email = req.body.email
    //const firebaseTransaction =  firebaseAdmin.database().ref().transaction();
    if(!adminEmail || !username || !role || !password || !contact || !doj || !Deparment || !email) return res.status(400).json({status: "missing details"})
    const session = await mongoose.startSession();
    session.startTransaction();
    let userAdded = undefined
    
    try{
        // make it like transaction
        // still u didn't add employee details for authentication
        userAdded = await admin.auth().createUser(
            {
                email: email,
                role: "employee",
                displayName: username,
                password: password}, {session})
        
    const findAdmin = await AdminRole.findOne({email : adminEmail});
    if(!findAdmin) return res.status(400).json({status : 'error cannot find admin'});
    console.log(findAdmin)
    console.log(findAdmin._id, 'admin id');
    const employeeAdded = await Employee.create({
        name : username, 
        email : email, 
        department : Deparment,
        role : role,
        contact: contact,
        dateOfJoin: doj,
        adminId : findAdmin._id
    })
    console.log('employe Added ', employeeAdded)
    const db = admin.firestore()
    const userRef = db.collection('employees').doc(userAdded.uid);

    // Create the user document with some initial data
    await userRef.set({
    
      email: email,
      displayName:username,
      role: 'employee',
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
      // Add any 
    })
    const UpdatedAdmin = await AdminRole.updateOne({email : adminEmail}, {$push : {employees : employeeAdded._id}});
    
    console.log(UpdatedAdmin)
    //const userAdded = await createUser(username, email, password)
    await session.commitTransaction();
    console.log('Transaction committed successfully.');
    res.status(200).json({status: "successfully Added Employee"})
    }
    catch(error)
    {
        console.log(error)
        if(error.code == 'auth/email-already-exists') return res.status(400).json({status : 'email already exits'})
          // If an error occurs during the transaction, delete the user in Firebase Authentication
        if(userAdded) await admin.auth().deleteUser(userAdded.uid);
        await session.abortTransaction();
        console.error('Transaction aborted:', error);
        
        res.status(400).json({status : "error in connected Database"})
    }

})

router.get('/myEmployees', async (req, res) => {
   // console.log(req)
    if(!req.query) return res.status(400).json({status: "error"});
    console.log('req body', req.query)
    const adminEmail = req.query.email
    
    try{
        const adminObject = await AdminRole.findOne({email : adminEmail})
        console.log(adminObject)
        if(!adminObject) return res.status(400).json({status : 'admin email is not present in database'}) 
        const adminId = adminObject._id
        const employees = await Employee.find({adminId : adminId})
        console.log(employees)
        res.status(200).json({status : "success", data: employees})

    }
    catch(error)
    {
        console.log(error)
        res.status(400).json({status : "error" , error : error})
    }
})
/*
on signup user should get replies popup and then should get redirected login page


*/

router.put('/editMyName', async (req, res) => {
    const email = req.body.email, username = req.body.name
    try{
        const UpdatedAdmin = await AdminRole.updateOne({email : email}, {name : username});
        if(!UpdatedAdmin) return res.status(400).json({status : 'failed', error : 'cannot perfom the operation'})
        res.status(200).json({status : 'success', data : UpdatedAdmin})
    }
    catch(error)
    {
        res.status(400).json({status : 'failed', error : error})
    }
})
router.put('/editMyContact', async(req, res) => {
    const contact = req.body.contact, useremail = req.body.email
    try{
        const UpdatedAdmin = await AdminRole.updateOne({email : useremail}, {contact : contact})
        if(!UpdatedAdmin) return res.status(400).json({status : 'failed', error : 'cannot perfom the operation'})
        res.status(200).json({status : 'success', data : UpdatedAdmin})
    }
    catch(error)
    {
        res.status(400).json({status : 'failed', error : error})

    }
})
router.post('/editDetails', async(req, res)=> {
    const contact = req.body.contact, organization = req.body.Organization, name = req.body.name;
    const email = req.body.email
    try{
        let UpdatedAdmin;
        if(contact) UpdatedAdmin = await AdminRole.updateOne({email : email}, {contact : contact})
        if(organization) UpdatedAdmin = await AdminRole.updateOne({email : email}, {Organization: organization})
        if(name) UpdatedAdmin = await AdminRole.updateOne({email : email}, {name : name})
        if(!UpdatedAdmin) return res.status(400).json({status : 'failed', error : 'cannot perfom the operation'})
       return  res.status(200).json({status : 'success', data : UpdatedAdmin})
    }
    catch(error)
    {
        return res.status(400).json({status: "failed", error: error})
    }
})

router.get('/getDetails', async(req, res) => {
    const employeeEmail = req.query.employeeEmail
    if(!employeeEmail) return res.status(400).json({status : 'failed', data : "missing data"})
    try{
        const employee = await Employee.findOne({email : employeeEmail})
        if(!employee) return res.status(400).json({status : 'failed', data : "user not found"})
        return res.status(200).json({status : "success", data: employee})
    }
    catch(error)
    {
        console.log(error)
        return res.status(400).json({status : "error" , error : error})
    }
})
router.get('/myDetails', async (req, res) => {
    const email = req.query.email
    if(!email) return res.status(400).json({status : 'failed', data : "missing data"})
    try{
        const adminObject = await AdminRole.findOne({email : email})
        if(!adminObject) return res.status(400).json({status : 'failed', data : "user not found"})
        return res.status(200).json({status : "success", data: adminObject})
    }
    catch(error)
    {
        console.log(error)
        return res.status(400).json({status : "error" , error : error})
    }
})

router.post('/deleteEmployee', async (req, res) => {
    console.log(req.body)
    console.log('inside')
    const adminEmail = req.body.email, eemail = req.body.eemail;
    console.log(adminEmail, eemail)
    if(!adminEmail || !eemail) return res.status(400).json({status : 'error in data'})
    try{
        /*
        i have to delete creditails in firebase of employee
        and delete employee details in employee records 
        and delete employee id in admin object

        */
        const userRecord = await admin.auth().getUserByEmail(eemail)
        console.log(userRecord, 'userRecord')
        //const db = admin.firestore()
       // await db.collection("employees").document(userRecord.uid).delete()
        if(userRecord){
          await admin.auth().deleteUser(userRecord.uid);
        }
        const empoyeetobedeleted = await Employee.findOne({email:eemail});
        await Employee.deleteOne({email : eemail})
        const adminObject = await AdminRole.findOne({email: adminEmail})     
        AdminRole.findByIdAndUpdate(
            adminObject._id,
            { $pull: { employees: empoyeetobedeleted._id } },
            { new: true },
            function (err, doc) {
              if (err) {
                console.error(err);
              } else {
                console.log('Item removed from array:', doc);
              }
            }
          ); 
      
        return res.status(200).json({status : 'success'})
    }
    catch(error)
    {
        console.log(error)
        res.status(400).json({status : "error" , error : error})
    }
})




router.post('/addFollowups', async(req, res)=> {
    console.log('inside function')
    console.log(req.body)
    const text = req.body.text, date = req.body.date, email = req.body.email
    const eemail = req.body.eemail
    if(!text || !date || !email || !eemail) {
        return res.status(400).json({status: 'error', error: 'missing data'})
    }
    try{
        const findAdmin = await AdminRole.findOne({email: email})
        console.log('admin ', findAdmin)
        if(!findAdmin) return res.status(400).json({status: 'error', error: 'cannot find admin'})
        const followupObject = await Followup.create({
            text : text, 
            email : email, 
            date : date,
            adminId : findAdmin._id,
            eemail : eemail
        })   
        console.log(followupObject)

        return res.status(200).json({status:'success', data: followupObject})
    }
    catch{
        return res.status(400).json({status: 'error', error: 'error wrong'})
    }

})

module.exports = router