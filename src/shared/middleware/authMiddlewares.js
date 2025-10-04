import AuthModel from "../../modules/auth/models/authModel.js";

const authModel = new AuthModel();

export const authenticateToken = (req, res, next) => {
    try {
        const token = req.headers.authorization?.replace('Bearer ', '');

        if (!token) {
            return res.status(401).json({ message: "Token não fornecido" });
        }

        const decoded = authModel.verifyToken(token);
        req.user = decoded; // Adiciona dados do usuário na requisição
        next();
    } catch (error) {
        if (error.name === 'TokenExpiredError') {
            return res.status(401).json({ 
                message: "Token expirado",
                code: "TOKEN_EXPIRED" 
            });
        }
        return res.status(401).json({ message: "Token inválido" });
    }
};

export const authorizeRoles = (...roles) => {
    return (req, res, next) => {
        if (!roles.includes(req.user.tipo_usuario)) {
            return res.status(403).json({ 
                message: "Acesso negado" 
            });
        }
        next();
    };
};