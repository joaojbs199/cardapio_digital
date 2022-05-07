import { useState } from "react";
import axios from 'axios';
import styles from '@styles/Cardapio.module.css';
import Image from "next/image";
import ReactStars from "react-star-ratings";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faStar, faXmark } from "@fortawesome/free-solid-svg-icons";
import { baseURL } from "@services/baseUrlConfig";

export default function Cardapio(props) {

    /* useEffect(() => {
        window.history.pushState({}, null, `/cardapio/${props.establishmentName}`);
    }, [props]) */

    const [ cardapio, setCardapio ] = useState(props.menu.cardapio);
    const [ subcategories, setSubcategories ] = useState([]);
    const [ ratingConfig, setRatingConfig ] = useState({
        id:'',
        isRating: false,
        itemName: "",
        action: ""
    });

    const handleSelectedCategory = (e) => {
        const categoryId = e.target.id;
        const subcategoriesFilter = cardapio.subcategories.filter((subcategory) => {
            return subcategory.categoryId === categoryId;
        });

        setSubcategories(subcategoriesFilter);
    }

    const getRating = (e) => {
        const id = e.target.id;
        const categoryId = id.split('-')[0];
        const subcategoryId = id.split('-')[1];
        const itemId = id.split('-')[2];
        const itemName = cardapio.items.filter((item) => {
            return item.categoryId === categoryId && item.subcategoryId === subcategoryId && item.itemId === itemId
        })[0].itemName;

        setTimeout(() => {

            setRatingConfig({
                id: id,
                isRating: true,
                itemName: itemName,
                action: "Você está avaliando"
            })
            
        }, 500);

    }

    const setRating = async (rating, id) => {

        const categoryId = id.split('-')[0];
        const subcategoryId = id.split('-')[1];
        const itemId = id.split('-')[2];
        const itemName = cardapio.items.filter((item) => {
            return item.categoryId === categoryId && item.subcategoryId === subcategoryId && item.itemId === itemId
        })[0].itemName;

        const updateRating = {
            filtersToUpdate: [
                {
                    "item.categoryId": categoryId,
                    "item.subcategoryId": subcategoryId,
                    "item.itemId": itemId
                }
            ],
            dataToUpdate: rating,
            establishmentId: props.establishmentId
        }
        
        await axios.post('/api/externalInteract/setRating', updateRating)
        .then(response => {

            if(response.data.created && response.data.created.status === 201) {
                
                setCardapio(response.data.menu)
                setRatingConfig({
                    id: '',
                    isRating: true,
                    itemName: itemName,
                    action: "Você avaliou",
                })

                setTimeout(() => {

                    setRatingConfig({
                        id: '',
                        isRating: false,
                        itemName: '',
                        action: ""
                    });
                    
                }, 1500);

            } else {

                setRatingConfig({
                    id: '',
                    isRating: true,
                    itemName: itemName,
                    action: "Erro ao avaliar.",
                })

                setTimeout(() => {

                    setRatingConfig({
                        id: '',
                        isRating: false,
                        itemName: '',
                        action: ""
                    });
                    
                }, 1500);
            }
        });
    }

    return (
        <div className={styles.container}>
            <header className={styles.estPresentation}>
                <div className={styles.estPresentationLogo}>
                    <Image
                        src={props.menu.logo}
                        alt='picture'
                        objectFit='cover'
                        priority={true}
                        layout='fill'
                    />
                </div>
                <h3 className={styles.estPresentationName}>
                    {`Bem vindo à ${props.menu.establishmentName}`}
                </h3>
            </header>

            <div className={styles.categoriesList}>
                {cardapio.categories.map((category) => (
                    <button onClick={(e) => handleSelectedCategory(e)} id={category.categoryId} className={styles.categoryButton} key={category.categoryId}>{category.categoryName}</button>
                ))}
            </div>

            <div className={styles.subcategoriesList}>
                {subcategories.map((subcategory) => (
                    <section className={styles.subcategorySection} key={`${subcategory.categoryId}-${subcategory.subcategoryId}`}>
                        
                        <h3 className={styles.subcategoryTitle}>{subcategory.subcategoryName}</h3>
                        
                        {cardapio.items.filter( item => {
                            return item.categoryId === subcategory.categoryId && item.subcategoryId === subcategory.subcategoryId;
                        }).map( filteredItem => (
                            <section className={styles.itemSection} key={`${filteredItem.categoryId}-${filteredItem.subcategoryId}-${filteredItem.itemId}`}>
                                <h5 className={styles.itemTitle}>{filteredItem.itemName}</h5>
                                {!filteredItem.hasPromotion && <h6 className={styles.itemNormalPrice}>{filteredItem.price}</h6>}
                                {filteredItem.hasPromotion && <h6 className={styles.itemOldPrice}>{filteredItem.price}</h6>}
                                {filteredItem.hasPromotion && <h6 className={styles.itemPromotionalPrice}>{filteredItem.promotionalPrice}</h6>}
                                {filteredItem.hasDescription && <p className={styles.itemDescription}>{filteredItem.description}</p>}
                                {filteredItem.hasImage && <div className={styles.itemImage}><Image src={filteredItem.image} alt="itemImage" layout='fill' objectFit="cover"/></div>}
                                
                                {filteredItem.hasRating && <div className={styles.itemRating}>
                                    <div className={styles.itemRatingValue}>{(filteredItem.ratings.reduce((acc, cur) => {
                                            return acc + cur;
                                        }, 0) / (filteredItem.ratings.length === 1 ? 1 : filteredItem.ratings.length - 1)).toFixed(1)}
                                        <div className={styles.itemRatingIcon} ><FontAwesomeIcon icon={faStar} /></div>
                                    </div>
                                    <button id={`${filteredItem.categoryId}-${filteredItem.subcategoryId}-${filteredItem.itemId}`}
                                        onClick={(e) => {getRating(e)}}
                                        className={styles.rate}>
                                            Avaliar
                                    </button>
                                </div>}

                            </section>
                        ))}

                    </section>
                ))}
            </div>

            {ratingConfig.isRating && <div className={styles.getRatingOuter}>
                <section className={styles.getRating}>

                    <div className={styles.getRatingHeader}>
                        Avalie este item
                        <button onClick={() => {
                            setRatingConfig({
                                id:'',
                                isRating: false,
                                itemName: "",
                                action: ""
                            })
                        }} className={styles.getRatingClose}><FontAwesomeIcon className={styles.getRatingCloseIcon} icon={faXmark}/></button>
                    </div>

                    <h4 className={styles.getRatingAction}>{ratingConfig.action}</h4>
                    <h4 className={styles.getRatingItemTitle}>{ratingConfig.itemName}</h4>
                    <div className={styles.getRatingIndication}>
                        <ReactStars
                            name={ratingConfig.id}
                            rating={0}
                            changeRating={setRating}
                            starDimension="25px"
                            starSpacing="10px"
                            starHoverColor="#FFBA08"
                            starRatedColor="#FFBA08"
                            starEmptyColor="#CCC"
                        />
                    </div>
                </section>
            </div>}

        </div>
    )
}

export const getServerSideProps = async (context) => {

    const { establishment } = context.query;
    const establishmentId = establishment.split(" ")[0];
    //const establishmentName = establishment.split(" ")[1];

    const menu = await axios.post(`${baseURL}/api/externalInteract/getReaderMenu`, {establishmentId}).then( response => {
        const json = response.data
        return json.description
    });

    return {
        props: {
            menu,
            establishmentId
        }
    }
}