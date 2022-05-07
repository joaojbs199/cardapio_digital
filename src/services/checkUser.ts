import axios from 'axios';

export async function checkUser(email) {

    try{

        const isUser = await axios({
            method: "POST",
            url: '/api/auth/isUser',
            headers: {
                'Content-type': 'application/json'
            },
            data: {email: email }
        });

        return isUser.data

    }catch(error) {
        return {status: 500, description: "Erro desconhecido, tente novamente mais tarde."};
    }

}