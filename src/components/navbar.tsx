import styles from '../styles/Navbar.module.css';
import Image from 'next/image';
import Router from 'next/router';
import placeHolder from '@public/placeholderLogo.png';
import menuIcon from '@public/menuIcon.png';
import { parseCookies, destroyCookie } from 'nookies';
import { Controllers } from '@contexts/ControllersContext';
import { useContext, useState } from 'react';
import { AuthContext } from '@contexts/AuthContext';

export default function Navbar(props) {

    const { setPanelsState, view, setView } = useContext(Controllers);
    const [ confirmLogout, setConfirmLogout ] = useState(false);
    const { setUser } = useContext(AuthContext);

    const link = props.link;
    const establishmentName = props.establishmentName?.normalize('NFD')
        .replace(/[\u0300-\u036f]/g,'')
        .replace(/\s+$/g, '')
        .replace(/ /g, '-');

    const logout = async () => {

        const destroy = await destroyCookie({}, '__UEMAT', {path: '/'});
        setView( { type: 'viewProfile', action: !view.viewProfile } );
        const { ['__UEMAT']: token } = parseCookies();

        if(!token) { 
            Router.push('/login');
        }

    }

    return (
        <div className={styles.navbar}>

            <button onClick={ () => {
                    setView({type: 'viewProfile', action: !view.viewProfile});
                    setConfirmLogout(false)
                    const { ['__UEMAT']: token } = parseCookies();
                    if(!token) {
                        Router.push('/login');
                        setView({type: 'viewProfile', action: false});
                        setUser(null);
                    }
                }} className={styles.viewProfile}>
                <Image
                    src={props.logo ? props.logo : placeHolder}
                    alt='picture'
                    objectFit='cover'
                    priority={true}
                    layout='fill'
                />
            </button>

            {view.viewProfile && <div className={styles.profile}>

                <h3 className={styles.establishmentName}>{props.establishmentName ? props.establishmentName : "Carregando..."}</h3>

                <button disabled style={{textDecoration: 'line-through'}} className={styles.profileOptions}>VISUALIZAR PERFIL</button>
                { !confirmLogout && <button onClick={() => setConfirmLogout(true) } className={styles.profileOptions}>SAIR</button> }
                { confirmLogout && <button onClick={() => logout() } className={styles.confirmLogout}>CLIQUE NOVAMENTE PARA SAIR</button> }
            </div>}

            <button onClick={ () => {
                    setView({type: 'viewMenu', action: !view.viewMenu});
                    const { ['__UEMAT']: token } = parseCookies();
                    if(!token) {
                        Router.push('/login');
                        setView({type: 'viewMenu', action: false});
                        setUser(null);
                    }
                }} className={styles.viewMenu}>
                    <Image
                        src={menuIcon}
                        alt='picture'
                        objectFit='cover'
                        priority={true}
                        layout='fill'
                    />  
            </button>

            {view.viewMenu && <div className={styles.menu}>
                <button onClick={ () => {
                    setPanelsState({name: 'createItems'});
                    setView({type: 'viewMenu', action: false});
                }} className={styles.menuOptions}>CRIAR ITENS</button>
                <button disabled style={{textDecoration: 'line-through'}} className={styles.menuOptions}>EDITAR ITENS</button>
                <button disabled style={{textDecoration: 'line-through'}} className={styles.menuOptions}>DEFINIR PROMOÇÃO</button>
                <button onClick={() => {
                        setPanelsState({name: 'shareAccess'});
                        setView({type: 'viewProfile', action: false});
                    }} className={styles.menuOptions}>
                    ACESSO AO CARDÁPIO
                </button>
            </div>}


        </div>
    )
}