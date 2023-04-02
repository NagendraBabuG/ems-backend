const express = require('express')
const bodyparser = require('body-parser')
const mongoose = require('mongoose')
const cors = require('cors')

const {Employee} = require('./db/firebaseUtil')
const app = express()
app.use(express.json())

app.use(cors())
app.use('/employee', require('./routes/employee'))
app.use('/admin', require('./routes/admin'))

app.get('/', (req, res) => {
    //res.redirect()
    //  console.log('hello')
    res.send('<h1>hello<h1>')
});

app.post('/post', (req, res) => {
    res.redirect('/')
});

app.get('/getEmployees', async (req, res) => {
    const snapshot = await Employee.get();
    const list = snapshot.docs.map((doc) => ({id: doc.id, ...doc.data()}));
    res.send(list);
});
app.post('/updateEmployee', async (req, res) => {
    const id = req.body.id;
    delete req.body.id;
    await Employee.doc(id).update(req.body);
})
app.post('/create', async (req, res) => {
    console.log(req)
    console.log(req.body)
    if(!req.body) {
        res.send({msg : "Data is undefined!!!"})
        return;
    }
    const data = req.body;
    await Employee.add({data});
    console.log("Data of Employees", data);
    res.send({msg : "Employee added"});
})

const PORT = process.env.PORT || 3000;












app.listen(PORT, ()=> {
    console.log(`Server is running on Port ${PORT}`)
})