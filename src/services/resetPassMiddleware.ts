import { hash } from 'bcryptjs';
import axios from 'axios';
import { baseURL } from './baseUrlConfig';

export async function makeReset(params) {

    const {email, expires, token } = params;
    const password = await hash(params.password, 12);


    try{

        const response = await axios({
            method: "POST",
            url: `${baseURL}/api/auth/updatePass`,
            headers: {
                'Content-type': 'application/json'
            },
            data: {
                email,
                password,
                token,
                expires
            }
        });

        return response.data

    }catch(error) {

        return {status: null, description: "Erro inesperado. Tente novamente em 1 hora."};

    }

}

