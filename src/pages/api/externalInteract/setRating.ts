import { MongoClient } from 'mongodb';
import { NextApiRequest, NextApiResponse } from "next";

const dbUser = process.env.MONGODB_USER;
const dbClientPass = process.env.MONGODB_CLIENT_PASS;
const dbClientCollection = process.env.MONGODB_CLIENT_COLLECTION;

export default async function handler(req: NextApiRequest, res: NextApiResponse) {

    if(req.method === 'POST') {

        const { filtersToUpdate, dataToUpdate, establishmentId } = req.body;

        if(!filtersToUpdate || !dataToUpdate || !establishmentId) {
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
                cardapio: 1,
                _id: 0
            }}
        );

        if(!hadMenu) {
            return res.json({status: 404, description: "Cardápio não encontrado."});
        }

        const response = await clientCollection.updateOne(
            {
                establishmentId: establishmentId,
            },
            {$push: {
                "cardapio.items.$[item].ratings": dataToUpdate
            }},
            {
                upsert: false,
                arrayFilters:filtersToUpdate
            }
        ).then( async (response) => {

            if(response.matchedCount === 1 && response.modifiedCount === 1) {
                
                const created = {
                    status: 201,
                    description: "Obrigado por avaliar."
                }

                const UpdatedMenu = await clientCollection.findOne(
                    {establishmentId: establishmentId},
                    {projection: {
                        cardapio: 1,
                        _id: 0
                    }}
                );

                const menu = UpdatedMenu.cardapio;

                return {
                    created,
                    menu
                }
            } else {
                const created = {
                    status: 422,
                    description: "O item não pôde ser avaliado."
                }

                return created;
            }
        });

        return res.json(response);

    } else {
        return res.json({status: 501, description: "Método inválido."});
    }
}