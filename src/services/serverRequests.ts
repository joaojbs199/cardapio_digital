import axios from 'axios';
import { parseCookies } from 'nookies';
import { baseURL } from './baseUrlConfig';

export function serverBasicRequest(context) {

    const basicRequest = axios.create({
        baseURL: baseURL
    });

    const {['__UEMAT']: token} = parseCookies(context);

    if(token) {
        basicRequest.defaults.headers['authorization'] = `Bearer ${token}`;
    }
    
    return basicRequest;

}







