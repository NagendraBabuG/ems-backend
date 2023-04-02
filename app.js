const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose')
//const middleware = require('./middleware/index.js')
const admin = require('./config/firebase-config')
const AdminRole = require('./models/admin')
const app = express();
const PORT = process.env.port || 5000;
const CONNECTION_URL = 'mongodb+srv://nagendra:1234@cluster0.fucrlal.mongodb.net/?retryWrites=true&w=majority'
app.use(cors());
app.use(express.json())


app.use('/api/admin', require('./routes/admin'))
app.use('/api/employee', require('./routes/employee'))
app.get('/',(req,res) => {
   // console.log(req);
    res.send('Hello World');
})
//signup

app.post('/addAdmin', async (req, res) => {
    const useremail = req.body.email, username = req.body.name, password = req.body.password
    if(!useremail || !username || !password) return res.status(400).json({status : 'failed', data: "missing data"})
    try{
        const adminCreated = await AdminRole.create({
            name : username,
            email: useremail,
           // employees:[]
        })
        if(!adminCreated) return res.status(400).json({status: 'failed'})
        res.status(200).json({status : 'success', data : userAdded})
    }
    catch(error)
    {

        console.log(error)
        res.status(400).json({status : "error in connected Database"})
    }
})
app.post('/createAdmin', async(req, res) => {
    console.log(req.body, "body")
    const useremail = req.body.email, username = req.body.name, password = req.body.password
    if(!useremail || !username || !password) return res.status(400).json({status : 'failed', data: "missing data"});

    const session = await mongoose.startSession();
    session.startTransaction();
    let userAdded = undefined
    
    try{
        // make it like transaction
        // still u didn't add employee details for authentication
        userAdded = await admin.auth().createUser(
            {
                email: useremail,
                displayName: username,
                password: password, 
            }, {session})
            console.log(userAdded)
            const db = admin.firestore()
            const userRef = db.collection('employees').doc(userAdded.uid);

            // Create the user document with some initial data
            await userRef.set({
              email: useremail,
              displayName:username,
              role: 'admin',
              createdAt: admin.firestore.FieldValue.serverTimestamp(),
              // Add any 
            })
        
        const adminCreated = await AdminRole.create({
                name : username,
                email: useremail,
               //employees:[]
            })
        console.log(adminCreated)
        await session.commitTransaction();
        console.log(userAdded)
        res.status(200).json({status : 'success', data : userAdded})
        
    }
    catch(error)
    {
        if(error.code == 'auth/email-already-exists') return res.status(400).json({status : 'email already exits'})
        // If an error occurs during the transaction, delete the user in Firebase Authentication
        if(userAdded) await admin.auth().deleteUser(userAdded.uid);
        await session.abortTransaction();
        console.error('Transaction aborted:', error);
      
        res.status(400).json({status : "error in connected Database", data: 'error'})   
    }

})
mongoose.set('strictQuery', false)
mongoose.connect(CONNECTION_URL, { useNewUrlParser: true, useUnifiedTopology: true }).then(() => {
    app.listen(PORT, () => {
        console.log(`Server is running on Port : ${PORT}`)
    })
}).catch((error) => console.log(error.message))