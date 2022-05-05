import express from "express"
import cors from "cors"
import dotenv from "dotenv"
import bcrypt from "bcrypt"
import joi from "joi"
import {MongoClient} from "mongodb"
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
        await dataBase.collection("users").findOne({name: login.name}).then(user => {
            if(bcrypt.compareSync(login.password, user.password)){
                res.sendStatus(200)
            }
        })
    }
    catch(e){
        res.sendStatus(400)
    }
})

app.post("/new-entry", async (req,res) => {
    const entry = req.body
    const validation = newEntrySchema.validate(entry)
    if(validation.error){
        res.sendStatus(408 )
        return
    }
    try{
        await dataBase.collection("entry").insertOne({
            value: entry.value,
            description: entry.description
        })
        res.sendStatus(201)
    }
    catch(e){
        res.sendStatus(400)
    }
})

app.listen(5000)