import express from "express"
import cors from "cors"
import userRouter from "./userRouter.js"
import statementsRouter from "./statementsRouter.js"

const app = express()
app.use(express.json())
app.use(cors())

app.use(userRouter)
app.use(statementsRouter)

app.listen(5000)