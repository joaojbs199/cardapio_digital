import styles from '@styles/Index.module.css';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTools } from "@fortawesome/free-solid-svg-icons";
import Image from "next/image";
import marca from '@public/marca.png';

export default function Home() {
    return (
        <div className={styles.container}>
            <div className={styles.maintenanceInfo}>
                <div className={styles.divLogo}>
                    <Image src={marca} alt="logo" width={"200px"} height={"80px"} />
                </div>
                <h1 className={styles.title}>Site em manutenção</h1>
                <h2 className={styles.subtitle}>Validação de sistema.</h2>
                <div>
                    <FontAwesomeIcon className={styles.icon} beatFade icon={faTools} />
                </div>
            </div>
        </div>
    )
}
