import dataBase from "../database.js"

export async function newEntry(req,res) {
    const token = req.headers.token
    const newStatement = res.locals.newStatement
    try{
        const user = await dataBase.collection("sessions").findOne({token})
        await dataBase.collection("statements").insertOne({
            userId: user.id,
            value: newStatement.value,
            description: newStatement.description,
            idType: 1
        })
        res.sendStatus(201)
    }catch(e){
        res.sendStatus(400)
    }
}

export async function newExit(req,res)  {
    const token = req.headers.token
    const newStatement = res.locals.newStatement
    try{
        const user = await dataBase.collection("sessions").findOne({token})
        await dataBase.collection("statements").insertOne({
            userId: user.id,
            value: newStatement.value,
            description: newStatement.description,
            idType: 2
        })
        res.sendStatus(200)
    }catch(e){
        res.sendStatus(400)
    }
}

export async function statement(req, res) {
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
        const statement = await dataBase.collection("statements").find({
            userId: user._id
        }).toArray()
        res.send(statement)
    }catch(e){
        res.sendStatus(401)
    }
}