import axios from 'axios';
import { hash } from 'bcryptjs';
import { baseURL } from './baseUrlConfig';

export async function sendMailLink(email) {
    
    const hashEmail = await hash(email, 12);
    const hashToken = await hash(hashEmail, 12);
    const requestId = 'lanretni6789tseuqer'
    const expires = new Date();
    expires.setHours( expires.getHours() + 1);

    const link = `${baseURL}/userServices/externalLinkRedirect?requestId=${requestId}&email=${email}&token=${hashEmail}`;
    
    try{

        const sendMailLink = await axios({
            method: "POST",
            url: '/api/mailling/sendMail',
            headers:{
                'Content-type': 'application/json'
            },
            data: {
                email,
                templateId: 1,
                params: {
                    resetLink: link
                }
            }
        });

        sendMailLink.data.hashToken = hashToken;
        sendMailLink.data.email = email;
        sendMailLink.data.expires = expires;
        return sendMailLink.data

    }catch(error) {

        return {status: 500, description: error.data.error}

    }
    
}

export async function updateResetToken(data) {

    const {email, hashToken, expires} = data

    try{

        const updateResetToken = await axios({
            method: 'POST',
            url: '/api/auth/updateResetToken',
            headers: {
                'Content-type': 'application/json'
            },
            data: {
                email,
                hashToken,
                expires
            }
        });

        return updateResetToken.data;

    }catch(error) {

        return {status: 500, description: error.data.description}

    }

}


