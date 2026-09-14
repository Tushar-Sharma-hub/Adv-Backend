import express from "express"
import dotenv from "dotenv"
import { ChatGroq } from "@langchain/groq"
import fs from "fs";
import { PDFParse } from 'pdf-parse';
import { RecursiveCharacterTextSplitter } from "@langchain/textsplitters";

dotenv.config()
const app = express()
const port = 5050
app.use(express.json())

const llm = new ChatGroq({
    model: "openai/gpt-oss-120b",
    temperature: 0.7,
    maxTokens: 100,
    maxRetries: 2
})

const upload = async () =>{
    const pdfPath = "./knowledge.pdf"
    const buffer = fs.readFileSync(pdfPath)
    const pdfResult = new PDFParse({data: buffer})
    const result = await pdfResult.getText() // gives text with page breaks and other formatting
    const text = result.text // gives text without page breaks and other formatting
    const splitter= new RecursiveCharacterTextSplitter({
        chunkSize: 500, //chunk size is 500 characters 
        chunkOverlap: 50, //overlap is 50 characters , means last 50 characters from the previous chunk will be included in the next chunk
    });
    const docs = await splitter.createDocuments([text]);
    console.log("docs", docs)
}
upload()

app.post("/ai", async (req, res) => {
    const { input } = req.body

    const response = await llm.invoke(input)

    return res.status(200).json({ "ai:": response.content })
})

app.get("/", (req, res) => {
    return res.json({ message: "hello from level4" })
})


app.listen(port, () => {
    console.log("server started on port", port)
})