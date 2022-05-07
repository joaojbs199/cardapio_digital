import { baseURL } from '@services/baseUrlConfig';
import { useRouter } from 'next/router';
import { useEffect } from 'react';

export default function ExternalLinkRedirect() {

    const router = useRouter();

    useEffect(() => {

        window.history.pushState({}, null, `${baseURL}/userServices/externalLinkRedirect`)
    
        const {requestId, email, token} = router.query;

        const url = `${baseURL}/userServices/resetPassword?requestId=${requestId}&email=${email}&token=${token}`;

        if(requestId && email && token) {
            router.replace(url, `${baseURL}/userServices/resetPassword`);
        }
        
    });

    return(
        <div>
            
        </div>
    )
}

