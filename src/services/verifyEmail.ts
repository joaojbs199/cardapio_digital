import axios from 'axios';

export async function verifyEmail(email) {

    // Mail checkerAPI - https://emailverification.whoisxmlapi.com/api/documentation

    const response = await axios.get(`https://emailverification.whoisxmlapi.com/api/v2?apiKey=at_sauvrFta375LGPKUoUbZIhLOx9SRR&emailAddress=${email}`)
    
    .then(response => {

        const { smtpCheck, dnsCheck, disposableCheck} = response.data;

        if(smtpCheck === 'true' && dnsCheck === 'true' && disposableCheck === 'false'){
            return true;
        } else {
            return false;
        }
    })
    .catch(error => {
        return false;
    });

    return response;

}