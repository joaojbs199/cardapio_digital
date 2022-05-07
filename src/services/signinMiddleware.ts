import axios from "axios";
import { clientBasicRequest } from '@services/clientRequests';

type signInRequestData = {
    email: string;
    password: string;
}

export async function makeSignIn({ email, password }: signInRequestData) {

    try{

        const logerUser = await axios({
            method: "POST",
            url: '/api/auth/signin',
            headers: {
                'Content-type': 'application/json'
            },
            data: {
                email,
                password
            }
        });

        if(logerUser.data.status !== 200) {
            const { status, description } = logerUser.data;
            return {
                status,
                description,
                token: false,
                user: false
            }
        }
        return logerUser.data

    }catch(error) {

        return error.data;

    }
}

export async function reloadUser() {

    try{

        const clientRequest = clientBasicRequest(); //Makes request without context
        
        const reloadUser = await clientRequest.post('/api/auth/reloadUser').then( response => {
            const user = response
            return user;
        });

        if(reloadUser.data.status !== 200){
            const { status, description } = reloadUser.data;
            return {
                status,
                description,
                user: false
            }
        }

        const data = reloadUser.data
        return data;

     }catch(error) {
        return error;
     }
}