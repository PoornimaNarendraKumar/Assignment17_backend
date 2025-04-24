const express = require('express')
const mongoose = require('mongoose')
const Users = require('./model/User')
const app = express()
const port = 3000;

const jwt = require('jsonwebtoken')
require('dotenv').config()
const secret_keys = process.env.JWT_SECRET_KEY
const cors = require('cors')
app.use(cors({
    origin:'http://localhost:5173',//allow only frontend origin
    methods:['GET','POST','PUT','DELETE','OPTIONS'],
    allowedHeaders:['Content-Type','Authorization']
}))
app.use(express.json())
async function main() {
    await mongoose.connect(
        'mongodb+srv://poornimanarendransn:lM5V5CwvOHmVknzW@cluster0.gelcp.mongodb.net/ProductsDb?retryWrites=true&w=majority&appName=Cluster0'
    );
}
main()
    .then(() => console.log("DB Connected"))
    .catch(err => console.log(err))

    const authenticateToken =(req,res,next)=>{
        const token= req.headers['authorization']?.split(' ')[1]
        if(!token) res.sendStatus(401)
    
            jwt.verify(token,secret_keys,(err,user)=>{
                if(err) return res.status(403).json(err)  // invalid token

                req.user= user;
                next()
            })
    }

    //user creation

    app.post('/user',async(req,res)=>{
        try{
            if (!req.body) {
                return res.status(400).json({ error: "User details cannot be empty" })
        }
        var userItem ={
            name:req.body.name,
            email:req.body.email,
            password:req.body.password,
        }
    
        var user = new Users(userItem)  // creates document in the database
        await user.save()
        res.status(201).json(user)
    }
        catch(error){
            console.log(error)
            res.send(500).json(error)
        }
    })

//Login User
//eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VyIjoibml2cml0aGlAZ21haWwuY29tIiwiaWF0IjoxNzQ1NTE5ODc1fQ.rlLdEXqBUY22BM7vgSGH5iAgN2iIqW-tm_jFCoL7OO4
app.post('/login',async(req,res)=>{
    try{
        if (!req.body) {
            return res.status(400).json({ error: "Login details cannot be empty" })
    }

    const {email,password} =req.body
    const user = await Users.findOne({email:email})
    if(!user){
        return res.status(404).json({message:"User not found"})
    }
    console.log(user)
    const isValid = (password===user.password)
    if(!isValid){
        return res.status(404).json({message:"Invalid Credentials"})
    }
    let payload ={user:email}
let token =jwt.sign(payload,secret_keys)
res.status(200).json({message:"Login sucessful",token:token})

}
    catch(error){
        console.log(error)
        res.send(500).json(error)
    }
    
})



    app.listen(3000, () => {
        console.log("Server Started");
    })