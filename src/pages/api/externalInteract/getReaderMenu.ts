import { MongoClient } from 'mongodb';
import { NextApiRequest, NextApiResponse } from 'next';

const dbUser = process.env.MONGODB_USER;
const dbClientPass = process.env.MONGODB_CLIENT_PASS;
const dbClientCollection = process.env.MONGODB_CLIENT_COLLECTION;

export default async function handler(req: NextApiRequest, res: NextApiResponse) {

    if(req.method === 'POST') {

        const { establishmentId } = req.body;

        if(!establishmentId ) {
            return res.json({status: 401, description: "Sem dados."});
        }

        const dbClientUri = `mongodb+srv://${dbUser}:${dbClientPass}@cardapios.0dbzt.mongodb.net/myFirstDatabase?retryWrites=true&w=majority`

        const client = new MongoClient(dbClientUri);
        await client.connect();
        const clientDb = client.db(establishmentId);
        const clientCollection = clientDb.collection(dbClientCollection);

        const hadMenu = await clientCollection.findOne(
            {establishmentId: establishmentId},
            {projection: {
                establishmentId: 0,
                name: 0,
                _id: 0
            }}
        );

        if(!hadMenu) {
            return res.json({status: 404, description: "Cardápio não encontrado."});
        }

        const menu = hadMenu

        return res.json({status: 200, description: menu});

    } else {
        return res.json({status: 501, description: "Método inválido."});
    }
}