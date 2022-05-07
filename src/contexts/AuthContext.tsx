import { createContext, Dispatch, useEffect, useState } from 'react';
import { makeSignIn, reloadUser } from '../services/signinMiddleware';
import { setCookie, parseCookies } from "nookies";
import Router from 'next/router';

type authContextData = {
    isAuthenticated: boolean;
    user: User;
    setUser: Dispatch<User>
    signIn: (data: signInRequestData) => Promise<any>
}

type signInRequestData = {
    email: string;
    password: string;
}

type User = {
    establishmentName: string;
    qrCode: string;
    link: string;
    logo: string;
    email: string;
    name: string;
}

export const AuthContext = createContext( {} as authContextData );

export function AuthProvider({ children }) {

    const [user, setUser] = useState<User | null>(null);

    const isAuthenticated = !!user;

    useEffect(() => {

        const { '__UEMAT': token } = parseCookies();

        if(token) {

            reloadUser().then( response => {
                const { user } = response;

                if(!user ) {
                    Router.replace('/login');
                }
                
                setUser( user );

            });
        }
    }, []);

    async function signIn( {email, password }: signInRequestData) {

        const {status, description, token, user } = await makeSignIn({
            email,
            password
        });

        if(status !== 200){

            return { status, description };
        }

        setCookie(undefined, '__UEMAT', token, {
            maxAge: 60 * 60 * 2, // 2 hour(s)
            path: '/',
        });

        setUser(user);

        const routeName = (user.establishmentName)
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g,'')
        .replace(/\s+$/g, '')
        .replace(/ /g, '-');

        Router.push('/userPanel/[user]', `/userPanel/${routeName}`);

        return{ status };

    }

    return (
        <AuthContext.Provider value={{ user, setUser, isAuthenticated, signIn }}>
            {children}
        </AuthContext.Provider>
    )
}

