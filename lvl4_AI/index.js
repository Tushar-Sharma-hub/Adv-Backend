import "dotenv/config";
import express from "express";
import { GoogleGenAI } from "@google/genai"; //without langchain
import { ChatGoogle } from "@langchain/google"; //with langchain

const app = express();
const PORT = 5050;
app.use(express.json());

app.get("/", (req, res) => {
  res.send("Hello from lvl4!");
});

//without langchain
// const ai = new GoogleGenAI({
//   apiKey: process.env.GEMINI_API_KEY
// });

// app.post("/ai", async (req, res) => {
//   const { prompt } = req.body;

//   const interaction = await ai.interactions.create({
//     model: "gemini-3.7-flash",
//     input: [
//         {
//             role: "system",
//             parts: [{ text: "you are a assistant and your name is jarvis.if you don't know the answer then don't give incorrect answer" }]
//         },
//         {
//             role: "user",
//             parts: [{ text: input }]
//         }
//     ],
//   });

//   res.json({'ai':interaction.output_text});
// });

//with langchain
const llm = new ChatGoogle({
  apiKey: process.env.GOOGLE_API_KEY,
  model: "gemini-3.7-flash",
});
app.post("/ai", async (req, res) => {
  const { prompt } = req.body;

  const response = await llm.call(prompt);

  res.json({ ai: response });
});


app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});