import { MongoClient } from 'mongodb';
import { NextApiRequest, NextApiResponse } from 'next';

const dbUser = process.env.MONGODB_USER;
const dbAdminPass = process.env.MONGODB_ADMIN_PASS;
const dbAdminDatabase = process.env.MONGODB_ADMIN_DATABASE;
const dbAdminCollection = process.env.MONGODB_ADMIN_COLLECTION;
const dbClientPass = process.env.MONGODB_CLIENT_PASS;
const dbClientCollection = process.env.MONGODB_CLIENT_COLLECTION;

export default async function handler(req: NextApiRequest, res: NextApiResponse) {

    if(req.method === 'POST') {

        const {id, name, email, password, establishmentName, establishmentId, qrCode, link, logo, passwordResetToken, passwordResetExpires } = req.body;

        if(!id || !name || !email || !email.includes('@') || !password || !establishmentName || !establishmentId || !qrCode || !link || !logo || !passwordResetToken || !passwordResetExpires){
            return res.json({status: 400, description: "Sem dados."})
        }

        const dbAdminUri = `mongodb+srv://${dbUser}:${dbAdminPass}@administration.zjrcn.mongodb.net/${dbAdminDatabase}?retryWrites=true&w=majority`
        const dbClientUri = `mongodb+srv://${dbUser}:${dbClientPass}@cardapios.0dbzt.mongodb.net/myFirstDatabase?retryWrites=true&w=majority`

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

        if(isUser){
            return res.json({status: 422, description: "Usuário já existe."})
        }

        await adminCollection.insertOne({
            id,
            name,
            email,
            password,
            establishmentId,
            establishmentName,
            logo,
            qrCode,
            link,
            passwordResetToken,
            passwordResetExpires
        });

        const client = new MongoClient(dbClientUri);
        await client.connect();
        const clientDb = client.db(establishmentId);
        const clientCollection = clientDb.collection(dbClientCollection);

        await clientCollection.insertOne({
            name,
            establishmentName,
            establishmentId,
            logo,
            cardapio: {
                categories: [],
                subcategories: [],
                items: []
            }
        });

        return res.json({status: 201, description: "Tudo pronto! Faça login e comece a criar..."});

    } else {
        return res.json({status: 501, description: "Método inválido."});
    }
}