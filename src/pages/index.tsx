import Router from 'next/router';
import { serverBasicRequest } from '@services/serverRequests';
import { parseCookies } from "nookies";

export default function Home() {
    return (
        <div style={{width: '100%', height: '100vh', display: 'flex', justifyContent: 'center', alignItems: 'center'}}>
            <button style={{padding: '10px'}} onClick={() => Router.push('/login')}>
                Login
            </button>
        </div>
    )
}

export const getServerSideProps = async (context) => {

    const serverSideRequests = serverBasicRequest(context); // Makes request sending context
  
    const {['__UEMAT']: token } = parseCookies(context);
    
    if(token) {
      const user = await serverSideRequests.post('/api/auth/reloadUser', {token})
      .then(response => {
        const user = response.data.user;
        return user;
      });
      console.log(user);
      if(user) {
        const routeName = (user.establishmentName)
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g,'')
        .replace(/ /g, '-');
    
        return{
          redirect:{
            destination: `/userPanel/${routeName}`,
            permanent: false
          }
        }
      }
    }
    
    return{
      props: {
  
      }
    }
  }