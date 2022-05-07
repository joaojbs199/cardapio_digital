import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faEllipsis } from '@fortawesome/free-solid-svg-icons';
import fontAwesome, { IconDefinition } from '@fortawesome/fontawesome';
import styles from '@styles/Loader.module.css';
import Image from 'next/image';
import logoCinza from '@public/logo_cinza.png';
fontAwesome.library.add(faEllipsis as IconDefinition)

export default function Loader() {

    return (
        <div className={styles.loaderDiv}>
           <div className={styles.loaderLogo}>
               <Image
                src={logoCinza}
                alt='picture'
                objectFit='cover'
                priority={true}
               ></Image>
           </div>

           <FontAwesomeIcon icon={faEllipsis} beatFade className={styles.loaderIcon} />

           <div className={styles.loaderText}>
                <h2 className={styles.m}>m</h2>
               <h2 className={styles.enu}>enu</h2>
           </div>
        </div>
    )
}