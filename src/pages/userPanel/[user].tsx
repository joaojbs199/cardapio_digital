import Head from "next/head";
import Image from 'next/image';
import { useContext, useState, useCallback, useReducer, useEffect } from 'react';
import { useForm, Controller } from "react-hook-form";
import { AuthContext } from '@contexts/AuthContext';
import { Controllers } from '@contexts/ControllersContext';
import { serverBasicRequest } from '@services/serverRequests';
import { handleSelectsOptions, handleSelectsValues, initSelectValues, handleCheckboxStates, initCheckboxStates, zeroPad, currencyMask, initSelectOptions, createItem } from '@services/userPanelMiddleware';
import { parseCookies } from 'nookies';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faXmark, faEllipsis, faCircleCheck, faCheck, faPencil, faCircleExclamation } from "@fortawesome/free-solid-svg-icons";
import Navbar from "@components/navbar";
import logoCinza from '@public/logo_cinza.png';
import placeholder from "@public/placeholderLogo.png";
import styles from '@styles/UserPanel.module.css';
import ScreenBlock from "@components/screenBlock";
import ShareAccessMenu from "@components/shareAccessMenu";
import CreatableSelect from 'react-select/creatable';
import { customStyles } from '@styles/selectStyle';
import Router from "next/router";


export default function UserPanel(props) {

    const { control, register, unregister, resetField, handleSubmit, setValue, formState: {errors} } = useForm();
    const { user, setUser } = useContext(AuthContext);
    const [ menu, setMenu ] = useState(props.menu)
    const { initCategories, initSubcategories, initItems } = initSelectOptions(menu);
    const { panelsState, setPanelsState } = useContext(Controllers);
    const [ selectOptions, setSelectOptions ] = useReducer(
        handleSelectsOptions,
        {
            categories: initCategories,
            subcategories: [],
            items: []
        }
    );
    const [ selectValues, setSelectValues ] = useReducer( handleSelectsValues, initSelectValues );
    const [ checkboxStates, setChecboxStates ] = useReducer( handleCheckboxStates, initCheckboxStates );

    const [ charCount, setCharCount ] = useState(0);
    const [img, setImg] = useState(placeholder);
    const [ itemCreated, setItemCreated ] = useState({
        isCreated: false,
        msg: '',
        color: '',
        icon: null,
        animation: false
    });

    //****************************************** SELEÇÃO DE OPÇÃO NO SELECT */
    
    const selectChangeOption = useCallback((selectProps) => {

        if(selectProps.selectId === 'category') {
            setSelectValues({select: 'category', option: selectProps.inputValue})

            setSelectValues({select: 'subcategory', option: null});
            setSelectValues({select: 'item', option: null});
            resetField('price');
            
            const subcategories = initSubcategories.filter((subcategory) => {
                return subcategory.categoryId === selectProps.inputValue?.id;
            });

            setSelectOptions({type: 'reset', select: 'subcategories', options: subcategories})
        }

        if(selectProps.selectId === 'subcategory') {
            setSelectValues({select: 'subcategory', option: selectProps.inputValue})

            setSelectValues({select: 'item', option: null});
            resetField('price');
            
            const items = initItems.filter((item) => {
                return item.categoryId === selectValues.category.id && item.subcategoryId === selectProps.inputValue?.id
            });
            
            setSelectOptions({type: 'reset', select: 'items', options: items})
        }

        if(selectProps.selectId === 'item') {
            setSelectValues({select: 'item', option: selectProps.inputValue})
            resetField('price');
        }

    },[ initSubcategories, initItems, selectValues, resetField ]);

    //******************************************** CHECK IF THE OPTION CAN BE CREATED */

    const handleIsValidNewOption = (inputValue, selectValue, selectOptions) => {

        // Check for the same or like value --> drinks === drinks or Drinks === drinks?
        const exactValueExists = selectOptions.find(
            option => option.label.toLowerCase() === inputValue ||
            option.label === inputValue ||
            option.label === inputValue.charAt(0).toUpperCase() + inputValue.slice(1) ||
            
            option.label.includes(inputValue) ||
            option.label.includes((/\s$/.test(inputValue) ? inputValue = inputValue.replace(/\s+$/g, '') : inputValue )) ||
            option.label.includes(inputValue.charAt(0).toUpperCase() + inputValue.slice(1)) ||
            option.label.normalize("NFD").replace(/[\u0300-\u036f]/g, "").includes(inputValue) ||
            option.label.normalize("NFD").replace(/[\u0300-\u036f]/g, "").includes(inputValue.charAt(0).toUpperCase() + inputValue.slice(1))
        );
        // Check if the value has a valid length.
        // Without this, it will show create option for empty values.
        const valueIsNotEmpty = inputValue.trim().length;

        // If true show create option.
        return !exactValueExists && valueIsNotEmpty;
      };

    //********************************* CRIAÇÃO DE OPÇÃO NO SELECT */

    const selectCreateOption = useCallback((selectProps) => {

        let inputValue = selectProps.inputValue;
        const hasEndSpace = /\s$/.test(inputValue); //Verifica se tem espaços no final
        
        if(hasEndSpace) { //Retira o espaço do final caso haja
            inputValue = (inputValue).substring(0, inputValue.length-1)
        }

        inputValue = inputValue
            .toLowerCase()
            .replace(/\s/g, '_');

        if(selectProps.selectId === 'category') {

            const newOption = {
                id: zeroPad(menu.categories.length, 3),
                label: (inputValue.charAt(0).toUpperCase() + inputValue.slice(1).replace(/_/g, ' '))
            };

            setSelectOptions({ type: 'update', select: 'categories', option: newOption})
            setSelectValues({ select: 'category', option: newOption})

            setSelectValues({select: 'subcategory', option: null});
            setSelectValues({select: 'item', option: null});
            resetField('price');
            
            const subcategories = initSubcategories.filter((subcategory) => {
                return subcategory.categoryId === selectProps.inputValue?.id;
            });

            setSelectOptions({type: 'reset', select: 'subcategories', options: subcategories})
        }

        //=================================================================================

        if(selectProps.selectId === 'subcategory') {
            const categoryId = selectValues.category.id;

            const subcategories = menu.subcategories.filter((category) => {
                return category.categoryId === categoryId
            })

            const newOption = {
                categoryId: selectValues.category.id,
                categoryName: selectValues.category.label,
                id: zeroPad( subcategories.length, 4),
                label: (inputValue.charAt(0).toUpperCase() + inputValue.slice(1).replace(/_/g, ' '))
            };

            setSelectOptions({ type: 'update', select: 'subcategories', option: newOption})
            setSelectValues({select: 'subcategory', option: newOption})

            setSelectValues({select: 'item', option: null});
            resetField('price');
            
            const items = initItems.filter((item) => {
                return item.categoryId === selectValues.category.id && item.subcategoryId === selectProps.inputValue?.id
            });
            
            setSelectOptions({type: 'reset', select: 'items', options: items})
        }

        //=================================================================================

        if(selectProps.selectId === 'item') {
            const categoryId = selectValues.category.id;
            const subcategoryId = selectValues.subcategory.id;

            const items = menu.items.filter((item) => {
                return item.categoryId === categoryId && item.subcategoryId === subcategoryId;
            });

            const newOption = {
                categoryId: selectValues.category.id,
                categoryName: selectValues.category.label,
                subcategoryId: selectValues.subcategory.id,
                subcategoryName: selectValues.subcategory.label,
                id: zeroPad(items.length, 5),
                label: (inputValue.charAt(0).toUpperCase() + inputValue.slice(1).replace(/_/g, ' '))
            };

            setSelectOptions({ type: 'update', select: 'items', option: newOption})
            setSelectValues({select: 'item', option: newOption})
        } 

    },[menu, selectValues, initSubcategories, initItems, resetField]);

    const onSelectImage = (e) => {
        if(e.target.files && e.target.files[0]) {
            const file: any = URL.createObjectURL(e.target.files[0]);   
            setImg(file);
        } else {
            setImg(placeholder);
        }
    }

    const handleCreateItems = async (data) => {

        const { ['__UEMAT']: token } = parseCookies();
                        
        if(!token) {
            Router.push('/');
            setPanelsState({name: 'emptyPresentation'});
            setUser(null);
            return;
        }

        setItemCreated({
            isCreated: true,
            msg: 'Criando item',
            color: '#FFBA08',
            icon: faEllipsis,
            animation: true
        });

        data.categoryName = selectValues.category.label;
        data.categoryId = selectValues.category.id;
        data.subcategoryName = selectValues.subcategory.label;
        data.subcategoryId = selectValues.subcategory.id;
        data.itemName = selectValues.item.label;
        data.itemId = selectValues.item.id;
        data.hasPromotion = checkboxStates.hasPromotion;
        data.hasDescription = checkboxStates.hasDescription;
        data.hasImage = checkboxStates.hasImage;
        data.hasRating = checkboxStates.hasRating;
        delete data.category;
        delete data.subcategory;
        delete data.item;

        const newItem = await createItem(data);

        if(newItem.created.status === 201) {
            setMenu(newItem.menu);
            setItemCreated({
                isCreated: true,
                msg: newItem.created.description,
                color: '#20c000',
                icon: faCircleCheck,
                animation: false
            });
            setPanelsState({name: "emptyPresentation"});
            Object.keys(errors).map((key) => {
                errors[key] = undefined
            });
            setSelectValues({select: 'resetAll', option: null});
            setChecboxStates({checkbox: 'resetAll', state: false});
            setValue("price", '');
            unregister(['price', 'promotionalPrice', 'description', 'image']);
            setImg(placeholder);
            setPanelsState({name: "createItems"});

            setTimeout(() => {
                setItemCreated({
                    isCreated: false,
                    msg: '',
                    color: '',
                    icon: null,
                    animation: false
                });
                
            }, 2000);


        } else {
            setItemCreated({
                isCreated: true,
                msg: newItem.description,
                color: '#ff0000',
                icon: faCircleExclamation,
                animation: false
            });

            setTimeout(() => {
                setItemCreated({
                    isCreated: false,
                    msg: '',
                    color: '',
                    icon: null,
                    animation: false
                });
                
            }, 2000);
        }
    }

    
    
    
    return (
        <>

            <Head>
                <title>Emenu | Painel do usuário</title>
            </Head>

            <Navbar logo={user?.logo} establishmentName={user?.establishmentName}/>
            
            <div className={styles.container}>

                { panelsState.createItems && <div className={styles.createItems}>

                    <div className={styles.panelsTitle}>
                        Criar itens
                        <button onClick={() => {
                            Object.keys(errors).map((key) => {
                                errors[key] = undefined
                            });
                            setSelectValues({select: 'resetAll', option: null});
                            setChecboxStates({checkbox: 'resetAll', state: false});
                            unregister(['price', 'promotionalPrice', 'description', 'image']);
                            setImg(placeholder);
                            setPanelsState({name: 'emptyPresentation'});
                        }} className={styles.panelsClose}><FontAwesomeIcon className={styles.panelsCloseIcon}  icon={faXmark}/></button>
                    </div>

                    <form className={styles.createItemsForm} onSubmit={ handleSubmit(handleCreateItems) }>
        
                        <Controller
                            control={control}
                            name="category"
                            rules={{required: 'Selecione ou crie uma categoria.'}}
                            render={({ field: { onChange },}) => (
                                <div className={styles.selectDiv}>
                                    <CreatableSelect
                                        styles={customStyles}
                                        placeholder=''
                                        value={ selectValues.category }
                                        options={ selectOptions?.categories }
                                        isClearable={true}
                                        noOptionsMessage={() => 'Sem opções' }
                                        formatCreateLabel={(e) => `Criar "${e}"` }
                                        isDisabled={false}
                                        onChange={(value) => {
                                            selectChangeOption({inputValue: value, selectId: 'category'});
                                            onChange(value);
                                        }}
                                        onCreateOption={(value) => {
                                            selectCreateOption({inputValue: value, selectId: 'category'});
                                            onChange(value)
                                        }}
                                    />
                                    {errors.category && errors.category.type === 'required' && <p>{errors.category.message}</p>}
                                    <span className={styles.floatLabel}>Selecione ou crie uma categoria</span>
                                </div>
                            )}
                        />
                        
                        <Controller
                            control={control}
                            name="subcategory"
                            rules={{required: 'Selecione ou crie uma subcategoria.'}}
                            render={({ field: { onChange },}) => (
                                <div className={styles.selectDiv}>
                                    <CreatableSelect
                                        styles={customStyles}
                                        placeholder=''
                                        value={ selectValues.subcategory }
                                        options={ selectOptions?.subcategories }
                                        isClearable={true}
                                        noOptionsMessage={() => 'Sem opções' }
                                        formatCreateLabel={(e) => `Criar "${e}"` }
                                        isDisabled={!selectValues.category}
                                        onChange={(value) => {
                                            selectChangeOption({inputValue: value, selectId: 'subcategory'});
                                            onChange(value);
                                        }}
                                        onCreateOption={(value) => {
                                            selectCreateOption({inputValue: value, selectId: 'subcategory'});
                                            onChange(value)
                                        }}
                                    />
                                    {errors.subcategory && errors.subcategory.type === 'required' && <p>{errors.subcategory.message}</p>}
                                    <span className={styles.floatLabel}>Selecione ou crie uma subcategoria</span>
                                </div>
                            )}
                        />

                        <Controller
                            control={control}
                            name="item"
                            rules={{required: 'Crie um item.'}}
                            render={({ field: { onChange },}) => (
                                <div className={styles.selectDiv}>
                                    <CreatableSelect
                                        styles={customStyles}
                                        placeholder=''
                                        value={ selectValues.item }
                                        options={ selectOptions?.items }
                                        isOptionDisabled={(option) => option.isDisabled === true }
                                        isClearable={true}
                                        noOptionsMessage={() => 'Sem opções' }
                                        formatCreateLabel={(e) => `Criar "${e}"` }
                                        isDisabled={!selectValues.subcategory}
                                        onChange={(value) => {
                                            selectChangeOption({inputValue: value, selectId: 'item'});
                                            onChange(value);
                                        }}
                                        isValidNewOption={ handleIsValidNewOption }
                                        onCreateOption={(value) => {
                                            selectCreateOption({inputValue: value, selectId: 'item'});
                                            onChange(value)
                                        }}
                                    />
                                    {errors.item && errors.item.type === 'required' && <p>{errors.item.message}</p>}
                                    <span className={styles.floatLabel}>Crie um item</span>
                                </div>
                            )}
                        />

                        <div className={styles.inputDiv}>
                            <input
                                {...register("price", {
                                required: {
                                    value: true,
                                    message: "É obrigatório informar o preço."
                                }})}
                                name="price"
                                type="text"
                                className={styles.input}
                                placeholder=' '
                                disabled={!selectValues.item}
                                onChange={(e) => currencyMask(e)}
                            />
                            <span className={styles.floatLabel}>Preço</span>
                            {errors.price && errors.price.type === 'required' && <p>{errors.price.message}</p>}
                        </div>

                        <div className={styles.checkboxDiv}>                            
                            <button
                                className={styles.checkbox}
                                style={{
                                    backgroundColor: (checkboxStates.hasPromotion ? '#F48C06' : '#FFF'),
                                    borderWidth: (checkboxStates.hasPromotion ? '0px' : '1px')
                                }}
                                type="button"
                                onClick={() => {
                                    setChecboxStates({checkbox: 'hasPromotion', state: !checkboxStates.hasPromotion})
                                    unregister('promotionalPrice');
                                }}
                            >
                                {checkboxStates.hasPromotion && <FontAwesomeIcon icon={faCheck} />}
                            </button>
                            <span className={styles.checkboxLabel}>Preço promocional</span>

                            { checkboxStates.hasPromotion && <input
                                {...register("promotionalPrice", {
                                required: {
                                    value: checkboxStates.hasPromotion,
                                    message: "Preço promocional ativo porém vazio."
                                }})}
                                name="promotionalPrice"
                                type="text"
                                className={styles.input}
                                placeholder=' '
                                onChange={(e) => currencyMask(e) }
                            />}
                            {checkboxStates.hasPromotion && errors.promotionalPrice && errors.promotionalPrice.type === 'required' && <p>{errors.promotionalPrice.message}</p>}
                        </div>

                        <div className={styles.checkboxDiv}>                            
                            <button
                                className={styles.checkbox}
                                style={{
                                    backgroundColor: (checkboxStates.hasDescription ? '#F48C06' : '#FFF'),
                                    borderWidth: (checkboxStates.hasDescription ? '0px' : '1px')
                                }}
                                type="button"
                                onClick={() => {
                                    setChecboxStates({checkbox: 'hasDescription', state: !checkboxStates.hasDescription})
                                    unregister('description');
                                }}
                            >
                                {checkboxStates.hasDescription && <FontAwesomeIcon icon={faCheck} />}
                            </button>
                            <span className={styles.checkboxLabel}>Inserir descrição</span>

                            {checkboxStates.hasDescription && <><textarea
                                className={styles.description}
                                {...register("description", {
                                    required: {
                                        value: checkboxStates.hasDescription,
                                        message: 'Descrição ativa porém vazia.'
                                    }
                                })}
                                name="description"
                                maxLength={150}
                                onChange={(e) => {
                                    setCharCount(e.target.value.length);
                                }}                                
                            ></textarea>
                            <span className={styles.charCount}>{`${charCount}/150`}</span></>}
                            { checkboxStates.hasDescription && (charCount === 0) && errors.description && errors.description.type === 'required' && <p>{errors.description.message}</p>}
                        </div>

                        <div className={styles.checkboxDiv}>                            
                            <button
                                className={styles.checkbox}
                                style={{
                                    backgroundColor: (checkboxStates.hasImage ? '#F48C06' : '#FFF'),
                                    borderWidth: (checkboxStates.hasImage ? '0px' : '1px')
                                }}
                                type="button"
                                onClick={() => {
                                    setChecboxStates({checkbox: 'hasImage', state: !checkboxStates.hasImage})
                                    unregister('image');
                                    setImg(placeholder)
                                }}
                            >
                                {checkboxStates.hasImage && <FontAwesomeIcon icon={faCheck} />}
                            </button>
                            <span className={styles.checkboxLabel}>Inserir imagem</span>

                            { checkboxStates.hasImage && <div className={styles.divImageOuter}>
                                <div className={styles.divImage}>
                                    <div className={styles.image}>
                                        <Image 
                                        src= { img }
                                        alt= 'picture'
                                        priority={true}
                                        layout="fill"
                                        objectFit="cover"
                                        ></Image>
                                    </div>
                                    
                                    <button className={styles.selectImage}>
                                        <FontAwesomeIcon className={styles.selectImageIcon} icon={faPencil} />
                                        <input
                                            {...register('image', {
                                                required: {
                                                    value: checkboxStates.hasImage,
                                                    message: 'Imagem ativa porém não selecionada.'
                                                }
                                            })}
                                            name="image"
                                            type="file"
                                            className={ styles.inputFile }
                                            accept=".gif,.jpg,.jpeg,.png"
                                            onChange={onSelectImage}
                                        />
                                    </button>
                                </div>
                            </div>}
                            { checkboxStates.hasImage && img === placeholder && errors.image && errors.image.type === 'required' && <p>{errors.image.message}</p>}
                        </div>

                        <div className={styles.checkboxDiv}>                            
                            <button
                                className={styles.checkbox}
                                style={{
                                    backgroundColor: (checkboxStates.hasRating ? '#F48C06' : '#FFF'),
                                    borderWidth: (checkboxStates.hasRating ? '0px' : '1px')
                                }}
                                type="button"
                                onClick={() => {
                                    setChecboxStates({checkbox: 'hasRating', state: !checkboxStates.hasRating})
                                    unregister('rating');
                                }}
                            >
                                {checkboxStates.hasRating && <FontAwesomeIcon icon={faCheck} />}
                            </button>
                            <span className={styles.checkboxLabel}>Permitir Avaliação</span>
                        </div>
                        
                        <button className={styles.submitButton} type="submit">Criar</button>

                    </form>

                </div>}

                <ShareAccessMenu establishmentName={user?.establishmentName} qrCode={user?.qrCode} link={user?.link} />



                { panelsState.emptyPresentation && <div className={styles.emptyPresentation}>

                    <div className={styles.emptyPresentationLogo}>
                        <Image
                            src={logoCinza}
                            alt='picture'
                            objectFit='cover'
                        ></Image>
                    </div>

                    <h2 className={styles.emptyPresentationText}>menu</h2>
                </div> }

                <ScreenBlock />

                { itemCreated.isCreated && <div style={{color: itemCreated.color}} className={styles.userOperationsLoader}>
                    <div className={styles.userOperationsLoaderCard}>
                        <p className={styles.userOperationsLoaderText}>{itemCreated.msg}</p>
                        <FontAwesomeIcon beatFade={itemCreated.animation} className={styles.userOperationsLoaderIcon} icon={itemCreated.icon}/>
                    </div>
                </div>}

            </div>

        </>

    )

}





export const getServerSideProps = async (context) => {

    const {['__UEMAT']: token } = parseCookies(context);

    if(!token){
        return {
            redirect: {
                destination: '/login',
                permanent: false
            }
        }
    }

    const serverRequest = serverBasicRequest(context); // Makes request sending context

    const menu = await serverRequest.post('/api/users/getUserMenu').then( response => {
        const json = response.data
        return json.description
    });

    return {
        props: {
            menu
        }
    }
}