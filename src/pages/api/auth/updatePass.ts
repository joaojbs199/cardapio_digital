import { MongoClient } from 'mongodb';
import { compare } from 'bcryptjs';
import { NextApiRequest, NextApiResponse } from 'next';

const dbUser = process.env.MONGODB_USER;
const dbAdminPass = process.env.MONGODB_ADMIN_PASS;
const dbAdminDatabase = process.env.MONGODB_ADMIN_DATABASE;
const dbAdminCollection = process.env.MONGODB_ADMIN_COLLECTION;

export default async function handler(req: NextApiRequest, res: NextApiResponse) {

    if(req.method === 'POST') {

        const {email, password, token } = req.body;

        if(!email || !password || !token) {
            return res.json({status: 404, description: "Sem dados."})
        }

        const dbAdminUri = `mongodb+srv://${dbUser}:${dbAdminPass}@administration.zjrcn.mongodb.net/${dbAdminDatabase}?retryWrites=true&w=majority`

        const admin = new MongoClient(dbAdminUri);
        await admin.connect();
        const adminDb = admin.db();
        const adminCollection = adminDb.collection(dbAdminCollection);

        const isUser = await adminCollection.findOne(
            {email: email },
            {projection: {
                passwordResetToken: 1,
                passwordResetExpires: 1
            }}
        );

        if(!isUser){
            return res.json({status: 404, description: "Usuário não cadastrado."});
        }

        const registeredToken = isUser.passwordResetToken;
        const checkToken = await compare(token, registeredToken);

        if(!checkToken){
            return res.json({status: 403, description: "Token de alteração inválido, tente novamente em 1 uma hora."});
        }

        const registeredExpires = new Date(isUser.passwordResetExpires).getTime();
        const now = new Date().getTime()

        if(now > registeredExpires ) {
            return res.json({status: 403, description: "Token de alteração expirado, refaça o processo."});
        }

        await adminCollection.updateOne(
            {email: email},
            {$set: {
                password: password,
                passwordResetToken: 'empty',
                passwordResetExpires: 'empty'
            }},
            {upsert: false}
        );

        return res.json({status: 200, description: "Sua senha foi redefinida. Acesse a página de login novamente para entrar."});

    } else {
        return res.json({status: 501, description: "Método inválido."});
    }

    
}