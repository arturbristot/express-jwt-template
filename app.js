import dotenv from 'dotenv';
dotenv.config();

import express from 'express';
import cookieParser from "cookie-parser";

import authRoutes from "./src/modules/auth/routes/authRoutes.js";
import userRoutes from "./src/modules/users/routes/userRoutes.js";
//import messagesRoutes from "./src/modules/messages/routes/messagesRoutes.js";

const app = express();
const PORT = process.env.PORT || 3001;

app.use(express.json());
app.use(cookieParser());

app.get('/', (req, res) => {
  res.send('Servidor rodando...');
});

app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);

app.listen(PORT, () => {
  console.log(`Servidor rodando na porta ${PORT}`);
});
