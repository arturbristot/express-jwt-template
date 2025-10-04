import AuthModel from "../models/authModel.js";

class AuthController {
    constructor() {
        this.authModel = new AuthModel();
    }

    login = async (req, res) => {
        try {
            const { email, password } = req.body;
            const ipAddress = req.ip;
            const userAgent = req.get('user-agent');

            const result = await this.authModel.validateUser(email, password, ipAddress, userAgent);

            if (!result) {
                return res.status(401).json({ message: "Credenciais inválidas" });
            }

            const { user, accessToken, refreshToken } = result;

            // Definir refresh token como httpOnly cookie
            res.cookie('refreshToken', refreshToken.token, {
                httpOnly: true,
                secure: process.env.NODE_ENV === 'production',
                sameSite: 'strict',
                maxAge: refreshToken.expiresIn * 1000
            });

            res.json({
                user: {
                    id_usuario: user.id_usuario,
                    email: user.email,
                    tipo_usuario: user.tipo_usuario
                },
                accessToken
            });
        } catch (error) {
            console.error("Erro no login:", error);
            res.status(500).json({ message: "Erro no servidor" });
        }
    }

    refresh = async (req, res) => {
        try {
            const refreshToken = req.cookies.refreshToken;

            if (!refreshToken) {
                return res.status(401).json({ message: "Refresh token não fornecido" });
            }

            const ipAddress = req.ip;
            const userAgent = req.get('user-agent');

            const tokens = await this.authModel.refreshAccessToken(refreshToken, ipAddress, userAgent);

            // Atualizar cookie com novo refresh token
            res.cookie('refreshToken', tokens.refreshToken.token, {
                httpOnly: true,
                secure: process.env.NODE_ENV === 'production',
                sameSite: 'strict',
                maxAge: tokens.refreshToken.expiresIn * 1000
            });

            res.json({ accessToken: tokens.accessToken });
        } catch (error) {
            console.error("Erro ao renovar token:", error);
            res.status(401).json({ message: "Refresh token inválido" });
        }
    }

    logout = async (req, res) => {
        try {
            const refreshToken = req.cookies.refreshToken;

            if (refreshToken) {
                await this.authModel.revokeRefreshToken(refreshToken);
            }

            res.clearCookie('refreshToken');
            res.json({ message: "Logout realizado com sucesso" });
        } catch (error) {
            console.error("Erro no logout:", error);
            res.status(500).json({ message: "Erro no servidor" });
        }
    }

    verifyAuth = async (req, res) => {
        try {
            const token = req.headers.authorization?.replace('Bearer ', '');

            if (!token) {
                return res.status(401).json({ message: "Token não fornecido" });
            }

            const decoded = this.authModel.verifyToken(token);
            res.json({ valid: true, user: decoded });
        } catch (error) {
            res.status(401).json({ message: "Token inválido" });
        }
    }
}

export default AuthController;