import { MongoClient } from 'mongodb';
import { NextApiRequest, NextApiResponse } from 'next';

const dbUser = process.env.MONGODB_USER;
const dbAdminPass = process.env.MONGODB_ADMIN_PASS;
const dbAdminDatabase = process.env.MONGODB_ADMIN_DATABASE;
const dbAdminCollection = process.env.MONGODB_ADMIN_COLLECTION;

export default async function handler(req: NextApiRequest, res: NextApiResponse) {

    if(req.method === 'POST') {

        const {email} = req.body;
        
        if(!email){
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
                email: 1,
                _id: 0
            }}
        );

        if(!isUser){
            return res.json({status: 404, description: "Usuário não cadastrado."});
        } else {
            return res.json({status: 200, description: "Usuário já cadastrado."});
        }

    } else {
        return res.json({status: 501, description: "Método inválido."});
    }
}