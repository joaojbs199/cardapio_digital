//Tutorial => https://spin.atomicobject.com/2022/03/25/azure-storage-node-js/

import { NextApiRequest, NextApiResponse } from 'next';
import { BlobServiceClient } from '@azure/storage-blob';
import mime from 'mime-types';
import { v4 } from 'uuid';
import jwt, { JwtPayload } from 'jsonwebtoken';
import { MongoClient } from 'mongodb';

const dbUser = process.env.MONGODB_USER;
const dbClientPass = process.env.MONGODB_CLIENT_PASS;
const dbClientCollection = process.env.MONGODB_CLIENT_COLLECTION;
const secret = process.env.SECRET;

export default async function handler(req: NextApiRequest, res: NextApiResponse) {

    if(req.method === 'POST') {

        const isAuthorized = req.headers.authorization;

        if(!isAuthorized ) {
            return res.json({status: 401, description: "Não autorizado."});
        }

        const authorized = isAuthorized;

        const token = authorized.split(" ")[1];

        jwt.verify(token, secret as string, async (error: any, decoded: JwtPayload) => {

            if(error) {

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
                    return res.json({status: 404, description: "Cliente não encontrado, falha no upload."});
                }

                const { base64, filename } = req.body;
                
                if(!base64 || !filename) {
                    return res.json({status: 400, description: "Sem dados."});
                }

                const matches = base64.match(/^data:([A-Za-z-+/]+);base64,(.+)$/);

                if (matches.length !== 3) {
                    return res.json({status: 500, description: 'Arquivo inválido'});
                }

                const type = matches[1];
                const data = Buffer.from(matches[2], 'base64')
                const extension = mime.extension(type);
                const file = `${filename}_${v4()}.${extension}`;

                const connectionString = process.env.AZURE_CONTAINER_KEY;
                const connectionContainer = process.env.AZURE_CONTAINER_NAME;
                const blobServiceClient = BlobServiceClient.fromConnectionString(connectionString);
                const containerClient = blobServiceClient.getContainerClient(connectionContainer);
                const blockBlobClient = containerClient.getBlockBlobClient(file);
                
                try{

                    await blockBlobClient.uploadData(data, {
                        blobHTTPHeaders: {
                            blobContentType: type
                        }
                    });

                    const fileUrl = `https://easymenu.blob.core.windows.net/easy-menu/${file}`;
                    
                    return res.json({status:200, description: fileUrl});

                }catch(error){

                    return res.json({status: error.status, description: "Erro no upload do arquivo."});

                }

            }

        });

    } else {
        return res.json({status: 501, description: "Método inválido."});
    }
}