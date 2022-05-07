import jwt, { JwtPayload } from 'jsonwebtoken';
import { MongoClient } from 'mongodb';
import { NextApiRequest, NextApiResponse } from 'next';

const dbUser = process.env.MONGODB_USER;
const dbAdminPass = process.env.MONGODB_ADMIN_PASS;
const dbAdminDatabase = process.env.MONGODB_ADMIN_DATABASE;
const dbAdminCollection = process.env.MONGODB_ADMIN_COLLECTION;
const secret = process.env.SECRET;

export default async function handler(req: NextApiRequest, res: NextApiResponse) {

    if(req.method === 'POST') {

        const isAuthorized = req.headers.authorization;

        if(!isAuthorized) {
            return res.json({status: 401, description: "Não autorizado."});
        }

        const authorized = isAuthorized;

        const token = authorized.split(" ")[1];

        jwt.verify(token, secret as string, async (err: any, decoded: JwtPayload) => {
            if(err) {
                return res.json({status: 401, description: "Token inválido."});
            } 
            
            if (decoded.exp < (new Date().getTime() / 1000)) {

                return res.json({status: 403, description: "Token expirado."});

            } else {

                const dbAdminUri = `mongodb+srv://${dbUser}:${dbAdminPass}@administration.zjrcn.mongodb.net/${dbAdminDatabase}?retryWrites=true&w=majority`

                const admin = new MongoClient(dbAdminUri);
                await admin.connect();
                const adminDb = admin.db();
                const adminCollection = adminDb.collection(dbAdminCollection);

                const isUser = await adminCollection.findOne(
                    {id: decoded.id },
                    { projection: {
                        id: 0,
                        password: 0,
                        passwordResetToken: 0,
                        passwordResetExpires: 0,
                        _id: 0
                    }}
                );

                if(!isUser){
                    return res.json({status: 404, description: "Usuário não encontrado."});
                }

                const user = isUser;

                return res.json({status: 200, user: user});

            }
        });

    } else {
        return res.json({status: 501, description: "Método inválido."});
    }
    
}