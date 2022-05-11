import Router from 'next/router';
import { serverBasicRequest } from '@services/serverRequests';
import { parseCookies } from "nookies";
import styles from '@styles/Main.module.css';

export default function Home() {
    return (
        <div className={styles.container}>
            <button className={styles.loginButton} onClick={() => Router.push('/login')}>
                LOGIN
            </button>
        </div>
    )
}
