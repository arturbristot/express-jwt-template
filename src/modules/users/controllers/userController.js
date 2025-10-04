import UserManager from "../models/userModel.js";
const userManager = new UserManager();

class UserController{
    async createUser(req, res){
        try{
            const userData = req.body;

        if (!userData.email || !userData.senha) {
            return res.status(400).json({
                message: "Campos obrigatórios não foram informados"
            });
        }

            const newUser = await userManager.createUser(userData);
            res.status(201).json(newUser);
        }catch(error){
            console.error(error);
            res.status(500).json({message: "Erro ao criar usuário"});
        }
    }

    async getUserById(req, res){
        try{
            const userId = req.params.id;

            if (req.user.id_usuario != userId) {
                return res.status(403).json({ message: "Usuário sem permissão" });
            }

            const user = await userManager.getUserById(userId);

            if(!user){
                res.status(404).json({message: "Usuário não encontrado"});
            }else{
                res.json(user);
            }

        }catch(error){
            console.error(error);
            res.status(500).json({message: "Erro ao buscar usuário"});
        }
    }

    updateUser = async (req, res) => {
        try {
            const { id } = req.params;
            const { senha, ...otherFields } = req.body;

            if (senha) {
                if (senha.length === 0) {
                    return res.status(400).json({ 
                        message: "Sua senha não pode ser vazia" 
                    });
                }
                otherFields.senha = await bcrypt.hash(senha, 10);
            }

            const user = await this.userModel.updateUser(id, otherFields);
            
            // NÃO retornar a senha
            delete user.senha;
            
            res.json(user);
        } catch (error) {
            console.error("Erro ao atualizar usuário:", error);
            res.status(500).json({ message: "Erro ao atualizar usuário" });
        }
    }

}

export default UserController;