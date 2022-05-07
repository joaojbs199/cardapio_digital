import styles from '@styles/ScreenBlock.module.css';
import { useContext } from 'react';
import { Controllers } from '@contexts/ControllersContext';

export default function ScreenBlock() {

    const { view, setView } = useContext(Controllers);
    
    return( 

        <>
            { (view.viewProfile || view.viewMenu) && <div onClick={ () => {
                    setView({type: 'viewProfile', action: false})
                    setView({type: 'viewMenu', action: false})
                }} className={styles.container}>

            </div>}
        </>

    )
}