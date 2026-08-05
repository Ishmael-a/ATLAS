import { Router } from "express";
import chatController from "../controllers/chat.controller";


const chatRouter = Router()

chatRouter.post("/message", chatController.sendMessage.bind(chatController))

export default chatRouter;