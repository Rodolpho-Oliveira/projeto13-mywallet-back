import {newExit, newEntry, statement} from "../controllers/statementsController.js"
import { statementMiddleware } from "../middlewares/schemaValidationMiddleware.js"
import { Router } from "express"

const statementsRouter = Router()
statementsRouter.post("/new-entry", statementMiddleware, newEntry)
statementsRouter.post("/new-exit", statementMiddleware, newExit)
statementsRouter.get("/statement", statement)

export default statementsRouter