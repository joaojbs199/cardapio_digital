import { MongoClient } from 'mongodb';
import jwt from 'jsonwebtoken';
import { compare } from 'bcryptjs';
import { NextApiRequest, NextApiResponse } from 'next';

const dbUser = process.env.MONGODB_USER;
const dbAdminPass = process.env.MONGODB_ADMIN_PASS;
const dbAdminDatabase = process.env.MONGODB_ADMIN_DATABASE;
const dbAdminCollection = process.env.MONGODB_ADMIN_COLLECTION;
const secret = process.env.SECRET;

export default async function handler(req: NextApiRequest, res: NextApiResponse) {

    if(req.method === 'POST') {

        const { email, password } = req.body;

        if(!email || !email.includes('@') || !password ) {
            return res.json({status: 404, description: "Sem dados."})
        }

        const dbAdminUri = `mongodb+srv://${dbUser}:${dbAdminPass}@administration.zjrcn.mongodb.net/${dbAdminDatabase}?retryWrites=true&w=majority`

        const admin = new MongoClient(dbAdminUri);
        await admin.connect();
        const adminDb = admin.db();
        const adminCollection = adminDb.collection(dbAdminCollection);

        const isUser = await adminCollection.findOne(
            {email: email},
            {projection: {
                passwordResetToken: 0,
                passwordResetExpires: 0,
                _id: 0
            }}
        );

        if(!isUser){
            return res.json({status: 404, description: "Usuário não encontrado."});
        }

        const user = isUser;
            
        const registeredPassword = user.password;
        const checkPassword = await compare(password, registeredPassword);

        if(!checkPassword){
            return res.json({status: 403, description: "Senha Inválida."});
        }

        delete user.password;

        const expires = (new Date().getTime() / 1000) + (60 * 60 * 2); // 2 hours
                
        const token = jwt.sign({ exp: expires, id: user.id, folderId: user.folderId, establishmentId: user.establishmentId}, secret);
        delete user.id;
        delete user.establishmentId;
        return res.json({status: 200, description: "Usuário autenticado.", user: user, token: token});
    
    } else {
        return res.json({status: 501, description: "Método inválido."});

    }
}