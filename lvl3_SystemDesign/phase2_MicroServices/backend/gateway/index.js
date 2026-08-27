import express from "express";
import dotenv from "dotenv";
import proxy from "express-http-proxy";
dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

app.use(express.json());
app.get("/", (req, res) => {
  res.send(`Hello from ${process.env.SERVER_NAME}!`);
});

app.use("/auth",proxy("http://auth-service:8001"))
app.use("/order",proxy("http://order-service:8002"))
app.use("/product",proxy("http://product-service:8003"))

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});