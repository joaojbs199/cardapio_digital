import axios from 'axios';
import { baseURL } from './baseUrlConfig';
import { clientBasicRequest } from './clientRequests';

export const getFileToConvert = async (file, filename) => {
    const base64 = await processImage(file);
    const convertedFile = {filename: filename, base64: base64 };
    return convertedFile;
}

async function processImage(file, min_image_size = 300) {
    const base64 = await imageToBase64(file);
    if (base64) {
        const old_size = calcImageSize(base64);
        if (old_size > min_image_size) {
            const resizedBase64 = await reduceImageSize(base64);
            return resizedBase64;
        } else {
            return base64;
        }

    } else {
        return null;
    }
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

function calcImageSize(image) {
    let y = 1;
    if (image.endsWith('==')) {
        y = 2
    }
    const x_size = (image.length * (3 / 4)) - y
    return Math.round(x_size / 1024)
}

async function reduceImageSize(base64, MAX_WIDTH = 1024, MAX_HEIGHT = 1024) {
    let resizedBase64 = await new Promise((resolve) => {
        let img = new Image();
        img.src = base64;
        img.onload = () => {
            let canvas = document.createElement('canvas');
            let width = img.width;
            let height = img.height;

            if (width > height) {
                if (width > MAX_WIDTH) {
                    height *= MAX_WIDTH / width;
                    width = MAX_WIDTH;
                }
            } else {
                if (height > MAX_HEIGHT) {
                    width *= MAX_HEIGHT / height;
                    height = MAX_HEIGHT;
                }
            }
            canvas.width = width;
            canvas.height = height;
            let ctx = canvas.getContext('2d');
            ctx.drawImage(img, 0, 0, width, height);
            resolve(canvas.toDataURL());
        }
    });
    return resizedBase64;
}



//Upload da imagem base64
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