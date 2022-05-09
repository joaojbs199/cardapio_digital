import styles from '@styles/ShareAccessMenu.module.css';
import { useContext, useRef } from 'react';
import { Controllers } from '@contexts/ControllersContext';
import { exportElementAsImage, shareLink, openCardapio } from "@services/shareAccessMiddleware";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faXmark, faArrowUpRightFromSquare, faDownload, faSpinner, faShare } from "@fortawesome/free-solid-svg-icons";
import Image from 'next/image';

export default function ShareAccessMenu(props) {

    const { panelsState, setPanelsState } = useContext(Controllers);
    const qrCodeCardDownload = useRef();
    const { qrCode, link } = props;

    const establishmentName = props.establishmentName?.normalize('NFD')
        .replace(/[\u0300-\u036f]/g,'')
        .replace(/\s+$/g, '')
        .replace(/ /g, '-');    


    return (
        <>
            { panelsState.shareAccess && <div className={styles.shareAccess}>
                <div className={styles.panelsTitle}>
                    Acesso ao cardápio
                    <button onClick={() => {
                            setPanelsState({name: 'emptyPresentation'});
                        }} className={styles.shareAccessClose}><FontAwesomeIcon className={styles.shareAccessCloseIcon} icon={faXmark}/>
                    </button>
                </div>

                <div className={styles.shareAccessDiv}>

                    <div className={styles.divQrCodeOuter}>
                        <div ref={qrCodeCardDownload} className={styles.qrCodeCard}>
                            <div className={styles.qrCodeFrame}>
                            { !qrCode && <FontAwesomeIcon className={styles.qrCodeLoader} pulse icon={faSpinner} /> }
                                {qrCode && <Image 
                                    src= { qrCode  }
                                    alt= 'qrCode'
                                    priority={true}
                                    layout='fill'
                                    objectFit="cover"
                                ></Image>}
                            </div>
                        </div>

                        <div className={styles.buttonsToShareDiv}>

                            <button onClick={() => {
                                exportElementAsImage(qrCodeCardDownload.current, `qrcode_${establishmentName}`)
                            }} className={styles.shareButtons}>
                                <FontAwesomeIcon className={styles.shareButtonsIcon} icon={faDownload} />
                            </button>

                            <button onClick={() => {
                                shareLink(link);
                                setPanelsState({name: 'emptyPresentation'});
                            }} className={styles.shareButtons}>
                                <FontAwesomeIcon className={styles.shareButtonsIcon} icon={faShare} />
                            </button>

                            <button onClick={() => {
                                openCardapio(link);
                                setPanelsState({name: 'emptyPresentation'});
                            }} className={styles.shareButtons}>
                                <FontAwesomeIcon className={styles.shareButtonsIcon} icon={faArrowUpRightFromSquare} />
                            </button>
                        </div>
                    </div>
                </div>

            </div>}
        </>
    )
    
}