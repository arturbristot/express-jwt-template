import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import crypto from "crypto";
import pool from "../../../shared/config/database.js";

class AuthModel{
    async validateUser(email, password, ipAddress = null, userAgent = null){
        try {
            const result = await pool.query("SELECT * FROM usuarios WHERE email = $1", [email]);
            const user = result.rows[0];
        
            if (!user){
                return null;
            }

            const isPasswordValid = await bcrypt.compare(password, user.senha);

            if (isPasswordValid) {
                const accessToken = this.generateAccessToken(user);
                const refreshToken = await this.generateRefreshToken(user, ipAddress, userAgent);
                
                return { 
                    user, 
                    accessToken,
                    refreshToken
                };
            }

            return null;
        } catch(error){
            console.error("Erro ao validar usuário", error);
            throw error;
        }
    }

    generateAccessToken(user) {
        const now = Math.floor(Date.now() / 1000);
        const expiresIn = process.env.JWT_ACCESS_EXPIRES_IN || '15m';
        const expiresInSeconds = this.getExpirationInSeconds(expiresIn);
        
        const payload = {
            id_usuario: user.id_usuario,
            email: user.email,
            tipo_usuario: user.tipo_usuario,
        };

        const token = jwt.sign(
            payload,
            process.env.JWT_SECRET,
            { expiresIn }
        );

        return {
            token,
            expiresAt: now + expiresInSeconds,
            issuedAt: now,
            expiresIn: expiresInSeconds
        };
    }

    async generateRefreshToken(user, ipAddress = null, userAgent = null) {
        const refreshToken = crypto.randomBytes(64).toString('hex');
        const expiresIn = process.env.JWT_REFRESH_EXPIRES_IN || '7d';
        const expiresInSeconds = this.getExpirationInSeconds(expiresIn);
        const expiresAt = new Date(Date.now() + expiresInSeconds * 1000);

        // Salvar refresh token no banco
        await pool.query(
            `INSERT INTO refresh_tokens (id_usuario, token, expires_at, ip_address, user_agent) 
             VALUES ($1, $2, $3, $4, $5)`,
            [user.id_usuario, refreshToken, expiresAt, ipAddress, userAgent]
        );

        return {
            token: refreshToken,
            expiresAt: Math.floor(expiresAt.getTime() / 1000),
            expiresIn: expiresInSeconds
        };
    }

    async refreshAccessToken(refreshToken, ipAddress = null, userAgent = null) {
        try {
            // Buscar refresh token no banco
            const result = await pool.query(
                `SELECT rt.*, u.* FROM refresh_tokens rt
                 JOIN usuarios u ON rt.id_usuario = u.id_usuario
                 WHERE rt.token = $1 AND rt.revoked = false AND rt.expires_at > NOW()`,
                [refreshToken]
            );

            if (result.rows.length === 0) {
                throw new Error('Refresh token inválido ou expirado');
            }

            const tokenData = result.rows[0];

            // Revogar o refresh token antigo
            await this.revokeRefreshToken(refreshToken);

            // Gerar novos tokens
            const user = {
                id_usuario: tokenData.id_usuario,
                email: tokenData.email,
                tipo_usuario: tokenData.tipo_usuario
            };

            const accessToken = this.generateAccessToken(user);
            const newRefreshToken = await this.generateRefreshToken(user, ipAddress, userAgent);

            return {
                accessToken,
                refreshToken: newRefreshToken
            };
        } catch (error) {
            console.error("Erro ao renovar token", error);
            throw error;
        }
    }

    async revokeRefreshToken(token) {
        await pool.query(
            'UPDATE refresh_tokens SET revoked = true WHERE token = $1',
            [token]
        );
    }

    async revokeAllUserTokens(userId) {
        await pool.query(
            'UPDATE refresh_tokens SET revoked = true WHERE id_usuario = $1',
            [userId]
        );
    }

    async cleanExpiredTokens() {
        await pool.query(
            'DELETE FROM refresh_tokens WHERE expires_at < NOW() OR revoked = true'
        );
    }

    getExpirationInSeconds(expiresIn = '24h') {
        const time = parseInt(expiresIn.slice(0, -1));
        const unit = expiresIn.slice(-1);
        
        switch(unit) {
            case 'h': return time * 60 * 60;
            case 'd': return time * 24 * 60 * 60;
            case 'm': return time * 60;
            case 's': return time;
            default: return 24 * 60 * 60;
        }
    }

    verifyToken(token){
        try{
            return jwt.verify(token, process.env.JWT_SECRET);
        }catch(error){
            console.error("Erro ao verificar token", error);
            throw error;
        }
    }
}

export default AuthModel;