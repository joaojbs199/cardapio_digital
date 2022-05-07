import jwt, { JwtPayload } from 'jsonwebtoken';
import { MongoClient } from 'mongodb';
import { NextApiRequest, NextApiResponse } from 'next';

const dbUser = process.env.MONGODB_USER;
const dbClientPass = process.env.MONGODB_CLIENT_PASS;
const dbClientCollection = process.env.MONGODB_CLIENT_COLLECTION;
const secret = process.env.SECRET;

export default async function handler(req: NextApiRequest, res: NextApiResponse) {

    if(req.method === 'POST') {

        const isAuthorized = req.headers.authorization;
        
        if(!isAuthorized) {
            return res.json({status: 401, description: "Não autorizado."});
        }

        const authorized = isAuthorized;

        const { category, subcategory, item } = req.body;

        if(!category || !subcategory || !item) {
            return res.json({status: 404, description: "Sem dados."})
        }

        const token = authorized.split(" ")[1];

        jwt.verify(token, secret as string, async (err: any, decoded: JwtPayload) => {

            if(err) {
                
                return res.json({status: 401, description: "Token inválido."});

            } 
            if (decoded.exp < (new Date().getTime() / 1000)) {

                return res.json({status: 403, description: "Token expirado."});

            } else {

                const dbClientUri = `mongodb+srv://${dbUser}:${dbClientPass}@cardapios.0dbzt.mongodb.net/myFirstDatabase?retryWrites=true&w=majority`

                const client = new MongoClient(dbClientUri);
                await client.connect();
                const clientDb = client.db(decoded.establishmentId);
                const clientCollection = clientDb.collection(dbClientCollection);

                const hadMenu = await clientCollection.findOne(
                    {establishmentId: decoded.establishmentId},
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
                        establishmentId: decoded.establishmentId,
                    },
                    { $addToSet: {
                        "cardapio.categories": category,
                        "cardapio.subcategories": subcategory,
                        "cardapio.items": item
                    }},
                    {
                        upsert: true,
                    }
                ).then( async (response) => {

                    if(response.matchedCount === 1 && response.modifiedCount === 1) {
                        
                        const created = {
                            status: 201,
                            description: "Item criado com sucesso."
                        }

                        const UpdatedMenu = await clientCollection.findOne(
                            {establishmentId: decoded.establishmentId},
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
                            description: "Item já existente."
                        }

                        return created;
                    }

                });

                return res.json(response);
            }
        });

    }  else {
        return res.json({status: 501, description: "Método inválido."});
    }
}