import dotenv from 'dotenv';
dotenv.config();

import express from 'express';
import cookieParser from "cookie-parser";
import cors from 'cors';

import authRoutes from "./src/modules/auth/routes/authRoutes.js";
import userRoutes from "./src/modules/users/routes/userRoutes.js";

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors({
  origin: 'http://localhost:3000', // ou ['http://localhost:3000', 'http://localhost:3001'] //local do front end
  credentials: true, 
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

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
