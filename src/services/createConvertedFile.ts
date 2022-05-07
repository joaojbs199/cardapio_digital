import axios from 'axios';
import { baseURL } from './baseUrlConfig';
import { clientBasicRequest } from './clientRequests';

export const getFileToConvert = async (file, filename) => {
    const base64 = await imageToBase64(file);
    const convertedFile = {filename: filename, base64: base64 };
    return convertedFile;
}

const imageToBase64 = (file) => {

    return new Promise((res, rej) => {

        const fileReader = new FileReader();
        fileReader.readAsDataURL(file);

        fileReader.onload = () => {
        res(fileReader.result)
        }
        fileReader.onerror = (error) => {
        rej(error)
        }
    });
};

export const uploadConvertedFile = async (convertedFile, source = undefined) => {

    const endpoint = source === 'user' ?  `${baseURL}/api/users/uploadUserFiles` : `${baseURL}/api/fileStorage/uploadFiles`
    try{

        const clientRequest = clientBasicRequest(); //Makes request without context

        const storeFile = await clientRequest.post(endpoint, convertedFile).then( response => {
            return response;
        });

        return storeFile.data

    }catch(error) {

        return {status: 500, description: error.data.description}

    }
}