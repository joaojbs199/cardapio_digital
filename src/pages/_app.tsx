import '../styles/globals.css';
import Head from 'next/head';
import Router from 'next/router';
import { AuthProvider } from '@contexts/AuthContext';
import Loader from '@components/loader';
import NProgress from 'nprogress';
import { useState } from 'react';
import '@styles/nprogress.css';
import { ControllersProvider } from '@contexts/ControllersContext';

function MyApp({ Component, pageProps }) {

  const [loading, setLoading] = useState(false);

  Router.events.on('routeChangeStart', (url) => {
    NProgress.start();
    setLoading(true);
  });

  Router.events.on('beforeHistoryChange', (url) => {
    NProgress.start();
    setLoading(true);
  });

  Router.events.on('routeChangeComplete', (url) => {
    NProgress.done();
    setLoading(false);
  });

  return (

    <AuthProvider>
        <Head>
          <meta name="viewport" content="initial-scale=1.0 width=device-width" />
          <meta name="mobile-web-app-capable" content="yes" />
        </Head>

      {loading && <Loader />}

        <ControllersProvider>
            <Component {...pageProps} />
        </ControllersProvider>
    </AuthProvider>

  )
  
}

export default MyApp;
