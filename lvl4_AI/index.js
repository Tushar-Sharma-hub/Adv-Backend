import "dotenv/config";
import express from "express";
import { GoogleGenAI } from "@google/genai";

const app = express();
const PORT = 5050;

const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY
});

app.use(express.json());

app.get("/", (req, res) => {
  res.send("Hello from lvl4!");
});

app.post("/ai", async (req, res) => {
  const { prompt } = req.body;

  const interaction = await ai.interactions.create({
    model: "gemini-3.7-flash",
    input: prompt,
  });

  res.jsom({'ai':interaction.output_text});
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});