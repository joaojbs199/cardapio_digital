import styles from '@styles/ShareAccessMenu.module.css';
import { useContext } from 'react';
import { Controllers } from '@contexts/ControllersContext';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faXmark, faArrowUpRightFromSquare, faDownload, faSpinner, faShare } from "@fortawesome/free-solid-svg-icons";
import { faWhatsapp } from "@fortawesome/free-brands-svg-icons";
import Image from 'next/image';

export default function ShareAccessMenu(props) {

    const { panelsState, setPanelsState } = useContext(Controllers);
    const { qrCode, link } = props;

    const establishmentName = props.establishmentName?.normalize('NFD')
        .replace(/[\u0300-\u036f]/g,'')
        .replace(/\s+$/g, '')
        .replace(/ /g, '-');    


    /* const downloadQrCode = () => {
        const downloadTag = document.createElement('a');
        downloadTag.href = qrCode;
        downloadTag.setAttribute('download', `qrcode.png`);
        document.body.appendChild(downloadTag);
        downloadTag.click();
        document.body.removeChild(downloadTag);
    } */

    const shareLink = () => {
        
        if(navigator.share) {

            navigator.share({
                title: "Easy menu - Cardápio digital",
                text: "Este é o link do nosso cardápio! Acesse e confira nossas opções.",
                url: link
            });
        } else {
            navigator.clipboard.writeText(link).then(() => alert("Copiado para a área de transferência"));
        }
    }

    const openCardapio = () => {
        const cardapioUrl = link;
        const openTag = document.createElement('a');
        openTag.href = cardapioUrl;
        openTag.target = '_blank';
        document.body.appendChild(openTag);
        openTag.click();
        document.body.removeChild(openTag);
    }

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
                        <div className={styles.qrCodeCard}>
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

                            <button disabled style={{backgroundColor: '#DDD'}} onClick={() => {
                                //downloadQrCode();
                            }} className={styles.shareButtons}>
                                <FontAwesomeIcon className={styles.shareButtonsIcon} icon={faDownload} />
                            </button>

                            <button onClick={() => {
                                shareLink();
                                setPanelsState({name: 'emptyPresentation'});
                            }} className={styles.shareButtons}>
                                <FontAwesomeIcon className={styles.shareButtonsIcon} icon={faShare} />
                            </button>

                            <button onClick={() => {
                                openCardapio();
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