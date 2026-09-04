import "dotenv/config";
import express from "express";
import { ChatGroq } from "@langchain/groq";

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
//            We can set roles, like system,user,human and assistant. 
//            System role is used to set the behavior of the model, 
//            user role is used to provide input from the user, 
//            human role is used to provide input from a human, and
//            assistant role is used to provide input from an AI assistant.
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
const llm = new ChatGroq({
  model: "openai/gpt-oss-120b",
  temperature: 0.7, //temperature controls the randomness of the output. Higher values (e.g., 0.8) make the output more random, while lower values (e.g., 0.2) make it more focused and deterministic.
  maxTokens: 100, //maxTokens limits the length of the generated output.
  maxRetries: 3, //maxRetries specifies the number of times to retry the request in case of failures.
});
app.post("/ai", async (req, res) => {
  const { prompt } = req.body;

  const response = await llm.invoke([
    {
      role: "system", 
      content: "You are a helpful assistant.Your name is Oggy. If you don't know the answer then don't give incorrect answer."
  },
    {
      role: "human", 
      content: prompt
    }
  ]);

  res.json({ ai: response });
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});