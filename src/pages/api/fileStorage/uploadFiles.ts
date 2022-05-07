//Tutorial => https://spin.atomicobject.com/2022/03/25/azure-storage-node-js/

import { NextApiRequest, NextApiResponse } from 'next';
import { BlobServiceClient } from '@azure/storage-blob';
import mime from 'mime-types';
import { v4 } from 'uuid';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {

    if(req.method === 'POST') {

        const { base64, filename } = req.body;

        if(!base64 || !filename) {
            return res.json({status: 400, description: "Sem dados."})
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

            return res.json({status: error.status, description: "Erro no upload do arquivo"});

        }
        



    } else {
        return res.json({status: 501, description: "Método inválido."});
    }
}