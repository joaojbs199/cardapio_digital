import { NextApiRequest, NextApiResponse } from 'next';
import SibApiV3Sdk from 'sib-api-v3-sdk';
const defaultClient = SibApiV3Sdk.ApiClient.instance;
const apiKey = defaultClient.authentications['api-key'];
apiKey.apiKey = process.env.MAIL_APIKEY;
const apiInstance = new SibApiV3Sdk.TransactionalEmailsApi();

export default function handler(req: NextApiRequest, res: NextApiResponse) {

    if(req.method === "POST") {

        const {email, templateId, params } = req.body;

        if(!email || !templateId || !params ) {
            return res.json({status: 404, description: "Sem dados."})
        }

        const emailOptions = {
            to: [{
                email: email
            }],
            templateId: templateId,
            params: params
        }

        try{

            sendinBlue_Send(emailOptions);
            return res.json({status: 200, description: "E-mail enviado."});

        }catch(error){

            return res.json({ status: 500, description: error });

        }

    } else {
        return res.json({status: 501, description: "Método inválido."});
    }
}

const sendinBlue_Send = (emailOptions) => {
    apiInstance.sendTransacEmail(emailOptions).then((data) => {
        return true;
    },((error) => {
        console.log(error);
        return false;
    }));
}
