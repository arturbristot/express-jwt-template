import bcrypt from "bcrypt";
import pool from "../../../shared/config/database.js";

class userModel {
    async createUser(userData) {
        try{
            const hashedPassword = await bcrypt.hash(userData.senha, 10);
            const result = await pool.query(
                "INSERT INTO usuarios (email,senha,nome) VALUES ($1, $2, $3) RETURNING *",
                [userData.email, hashedPassword, userData.nome]
            )
            return "Usuário criado com sucesso"
        }catch(error){
            console.error("Erro ao criar usuário", error);
            throw error;
        }
    }

    async getUserById(userId) {
        try{
            const result = await pool.query("SELECT id_usuario, nome, email FROM usuarios WHERE id_usuario = $1", [userId]); // evita sql injection
            return result.rows[0];
        }catch(error){
            console.error("Erro ao buscar usuário por ID", error);
            throw error;
        }
    }

    async updateUser(userId, userData) {
        try {
            const fieldsToUpdate = [];
            const values = [];
            let paramCounter = 1;

            if (userData.nome) {
                fieldsToUpdate.push(`nome = $${paramCounter}`);
                values.push(userData.nome);
                paramCounter++;
            }

            if (userData.senha) {
                const hashedPassword = await bcrypt.hash(userData.senha, 10);
                fieldsToUpdate.push(`senha = $${paramCounter}`);
                values.push(hashedPassword);
                paramCounter++;
            }

            if (userData.email) {
                fieldsToUpdate.push(`email = $${paramCounter}`);
                values.push(userData.email);
                paramCounter++;
            }

            if (fieldsToUpdate.length === 0) {
                throw new Error("Nenhum campo para atualizar foi fornecido");
            }

            values.push(userId);

            const query = `UPDATE usuarios SET ${fieldsToUpdate.join(', ')} WHERE id_usuario = $${paramCounter} RETURNING *`;
            
            const result = await pool.query(query, values);
            
            if (result.rows.length === 0) {
                throw new Error("Usuário não encontrado");
            }
            
            return "Usuário atualizado com sucesso";
        } catch (error) {
            console.error("Erro ao atualizar usuário", error);
            throw error;
        }
    }

}

export default userModel;