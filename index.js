import express from "express"
import cors from "cors"
import userRouter from "./routers/userRouter.js"
import statementsRouter from "./routers/statementsRouter.js"

const app = express()
app.use(express.json())
app.use(cors())

app.use(userRouter)
app.use(statementsRouter)

app.listen(process.env.PORT, () => {
    console.log("Server running on port" + process.env.PORT)
})