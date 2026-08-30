import express from "express";

const app = express();
const PORT = 5000;

app.get("/", (req, res) => {
  res.send("Hello from lvl4!");
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});