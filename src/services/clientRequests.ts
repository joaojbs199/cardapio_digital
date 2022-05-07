import axios from 'axios';
import { parseCookies } from 'nookies';
import { baseURL } from './baseUrlConfig';

export function clientBasicRequest() {

    const basicRequest = axios.create({
        baseURL: baseURL
    });

    const {['__UEMAT']: token} = parseCookies();

    if(token) {
        basicRequest.defaults.headers['authorization'] = `Bearer ${token}`;
    }
    
    return basicRequest;
}