import express from "express"
import dotenv from "dotenv"
import { ChatGroq } from "@langchain/groq"
import fs from "fs";
import { PDFParse } from 'pdf-parse';
import { RecursiveCharacterTextSplitter } from "@langchain/textsplitters";
import { GoogleGenerativeAIEmbeddings } from "@langchain/google-genai";
import { TaskType } from "@google/generative-ai";
import { QdrantVectorStore } from "@langchain/qdrant";
import { HumanMessage, SystemMessage } from "langchain";

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

const embeddings = new GoogleGenerativeAIEmbeddings({
  model: "gemini-embedding-001",
  taskType: TaskType.RETRIEVAL_DOCUMENT,
  title: "Document title",
});

const vectorStore = await QdrantVectorStore.fromExistingCollection(embeddings, {
  url: process.env.QDRANT_URL,
  collectionName: "Grocery-Store",
});

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
    await vectorStore.addDocuments(docs); 
}
// upload() upload the pdf to qdrant vector store - 1 time

app.post("/ai", async (req, res) => {
    const { input } = req.body

    const docs = await vectorStore.similaritySearch(input, 10); //search for top 10 similar documents
    const context = docs.map((doc) => doc.pageContent).join("\n");

    const response = await llm.invoke([
        new SystemMessage(`You are a helpful assistant. Use the following context to answer the question.
            Do not use any outside knowledge. If the answer is not in the context, say "I don't know". Context: ${context}`),
        new HumanMessage(input)
    ])

    return res.status(200).json({ai: response.content})
})

app.get("/", (req, res) => {
    return res.json({ message: "hello from level4" })
})


app.listen(port, () => {
    console.log("server started on port", port)
})