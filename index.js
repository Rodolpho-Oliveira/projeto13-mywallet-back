import express from "express"
import cors from "cors"
import dotenv from "dotenv"
import bcrypt from "bcrypt"
import joi from "joi"
import {MongoClient} from "mongodb"
import { v4 as uuid} from "uuid"
dotenv.config()

const mongoClient = new MongoClient(process.env.MONGO_URI)
let dataBase = null
mongoClient.connect().then(() => {
    dataBase = mongoClient.db(process.env.BASE_MONGO)
})

const signUpSchema = joi.object({
    name: joi.string().required(),
    email: joi.string().email().required(),
    password: joi.string().required(),
    repeatPassword: joi.ref("password")
})

const signInSchema = joi.object({
    name: joi.string().required(),
    password: joi.string().required()
})

const newEntrySchema = joi.object({
    value: joi.string().required(),
    description: joi.string().required()
})

const newExitSchema = joi.object({
    value: joi.string().required(),
    description: joi.string().required()
})

const app = express()
app.use(express.json())
app.use(cors())

app.post("/sign-up", async (req,res) => {
    const user = req.body
    const validation = signUpSchema.validate(user)
    if(validation.error){
        res.sendStatus(422)
        return
    }
    const encryptedPassword = bcrypt.hashSync(user.password, 10)
    try{
        await dataBase.collection("users").insertOne({
            name: user.name,
            email: user.email,
            password: encryptedPassword
        })
        res.sendStatus(201)
    }catch(e){
        res.sendStatus(400)
    }
})

app.post("/sign-in", async (req,res) => {
    const login = req.body
    const validation = signInSchema.validate(login)
    if(validation.error){
        res.sendStatus(400)
        return
    }
    try{
        const user = await dataBase.collection("users").findOne({name: login.name})
        if(bcrypt.compareSync(login.password, user.password)){
            const token = uuid()
            dataBase.collection("sessions").insertOne({
                id: user._id,
                token
            })
            res.send(token).status(200)
            }
        else{
            res.sendStatus(400)
        }
    }
    catch(e){
        res.sendStatus(400)
    }
})

app.post("/new-entry", async (req,res) => {
    const entry = req.body
    const validation = newEntrySchema.validate(entry)
    if(validation.error){
        res.sendStatus(422)
        return
    }
    try{
        await dataBase.collection("entry").insertOne({
            value: entry.value,
            description: entry.description
        })
        res.sendStatus(201)
    }catch(e){
        res.sendStatus(400)
    }
})

app.post("/new-exit", async (req,res) => {
    const exit = req.body
    const validation = newExitSchema.validate(exit)
    if(validation.error){
        res.sendStatus(422)
        return
    }
    try{
        await dataBase.collection("exit").insertOne({
            value: exit.value,
            description: exit.description
        })
        res.sendStatus(200)
    }catch(e){
        res.sendStatus(400)
    }
})

app.get("/statement", async (req, res) => {
    const token = req.headers.token
    if(!token){
        res.sendStatus(401)
        return
    }
    const session = await dataBase.collection("sessions").findOne({token})
    if(!session){
        res.sendStatus(401)
        return
    }
    try{
        const user = await dataBase.collection("users").findOne({
            _id: session.id
        })
        delete user.password
        res.send(user) 
    }catch(e){
        res.sendStatus(401)
    }
})

app.listen(5000)