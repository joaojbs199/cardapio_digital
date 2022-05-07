import axios from 'axios';
import { hash } from 'bcryptjs';
import QRCode from 'qrcode';
import { baseURL } from './baseUrlConfig';

export const createQrCode = async (establishmentId, filename) => {

    const base64 = await QRCode.toDataURL(`${baseURL}/cardapio/${establishmentId}`).then( base64qrCode => {
        return base64qrCode;
    });

    const data = {filename: filename, base64: base64};

    try{

        const storeQrCode = await axios({
            method: "POST",
            url: '/api/fileStorage/uploadFiles',
            headers: {
                'Content-type': 'application/json'
            },
            data: data
        });

        return storeQrCode.data

    }catch(error) {

        return {status: 500, description: error.data.description}

    }
}


export async function createUser(data) {

    delete data.confirmPassword;
    const password = await hash(data.password, 12);
    data.password = password
    data.passwordResetToken = "empty";
    data.passwordResetExpires = "empty";
    data.name = data.name.replace(/\s+$/g, '');
    data.establishmentName = data.establishmentName.replace(/\s+$/g, '');
    data.link = `${baseURL}/cardapio/${data.establishmentId}`


    try{

        const createUser = await axios({
            method: "POST",
            url: '/api/signup/newUser',
            headers: {
                'Content-type': 'application/json'
            },
            data: data
        });

        return createUser.data

    }catch(error) {

        return {status: 500, description: error.data.description}

    }

}
