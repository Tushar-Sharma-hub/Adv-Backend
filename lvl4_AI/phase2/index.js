import express from "express"
import dotenv from "dotenv"
import { ChatGroq } from "@langchain/groq"
dotenv.config()
const app = express()
const port = 5050
app.use(express.json())

const llm = new ChatGroq({
    model: "llama-3.3-70b-versatile",
    temperature: 0.7,
    maxTokens: 100,
    maxRetries: 2
})

app.post("/ai", async (req, res) => {
    const { input } = req.body

    const response = await llm.invoke(
        {
            role: "user",
            content: input
        }

    )
    console.log(response.messages)

    return res.status(200).json({ "ai:": response.content })
})

app.get("/", (req, res) => {
    return res.json({ message: "hello from level4" })
})


app.listen(port, () => {
    console.log("server started on port", port)
})