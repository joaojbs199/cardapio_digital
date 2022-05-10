/*************************************** SELECT OPTIONS TYPES  */

import { ChangeEvent } from "react";
import { clientBasicRequest } from "./clientRequests";
import { getFileToConvert, uploadConvertedFile } from '@services/createConvertedImage';

type SelectOptionData = {
    categoryId?: string;
    categoryName?: string;
    subcategoryId?: string;
    subcategoryName?: string;
    id: string;
    label: string;
    isDisabled?: boolean;
};

type SelectInstancesData = {
    categories: SelectOptionData[],
    subcategories: SelectOptionData[],
    items: SelectOptionData[]
}

type InsertOptionData = {
    type: string;
    select: string;
    option?: SelectOptionData;
    options?: SelectOptionData[];
}

//**************************************** SELECT VALUES TYPES */

type SelectValuesData = {
    category: SelectOptionData,
    subcategory: SelectOptionData,
    item: SelectOptionData
}

type SetSelectValue = {
    select: string;
    option: SelectOptionData
}

/**************************************** CHECKBOX TYPES */

type CheckboxStatesData = {
    hasPromotion: boolean;
    hasDescription: boolean;
    hasImage: boolean;
    hasRating: boolean;
}

type SetCheckboxStateData = {
    checkbox: string;
    state: boolean;
}

type CreateItemData = {
    category: {
        categoryId: string;
        categoryName: string;
    },
    subcategory: {
        categoryId: string;
        categoryName: string;
        subcategoryId: string;
        subcategoryName: string;
    },
    item: {
        categoryId: string;
        categoryName: string;
        subcategoryId: string;
        subcategoryName: string;
        itemId: string,
        itemName: string,
        price: string,
        hasPromotion: boolean,
        promotionalPrice: string,
        hasDescription: boolean,
        description: string,
        hasImage: boolean,
        image: string,
        hasRating: boolean,
        ratings: number[]
    }
}

/**************************************** USER PANEL REDUCERS */

const handleSelectsOptions = ( selectOptions: SelectInstancesData, selectOption: InsertOptionData ) => {

    if(selectOption.type === 'reset') {
        return {...selectOptions, [selectOption.select]: selectOption.options }
    }

    return {...selectOptions, [selectOption.select]: [...selectOptions[selectOption.select], selectOption.option] };

}

const handleSelectsValues = ( selectValues: SelectValuesData, selectValue: SetSelectValue ) => {

    if(selectValue.select === 'resetAll') {
        Object.keys(selectValues).map((select)  => {
            selectValues[select] = selectValue.option
        });
        return selectValues
    }
    
    return {...selectValues, [selectValue.select]: selectValue.option };
}

const initSelectValues: SelectValuesData = {
    category: null,
    subcategory: null,
    item: null

}

const handleCheckboxStates = (chekboxes: CheckboxStatesData, checkboxState: SetCheckboxStateData ) => {

    if(checkboxState.checkbox === 'resetAll') {
        Object.keys(chekboxes).map((checkbox)  => {
            chekboxes[checkbox] = checkboxState.state
        });
        return chekboxes;
    }
    return {...chekboxes, [checkboxState.checkbox]: checkboxState.state};
}

const initCheckboxStates: CheckboxStatesData = {
    hasPromotion: false,
    hasDescription: false,
    hasImage: false,
    hasRating: false
}

export {
    handleSelectsOptions,
    handleSelectsValues,
    initSelectValues,
    handleCheckboxStates,
    initCheckboxStates
}

export const zeroPad = (num, size) => {
    let number = num.toString();
    while (number.length < size) number = "0" + number;
    return number;
}

export const currencyMask = (event: ChangeEvent<HTMLInputElement>) => {
    let value = event.target.value;
    value = value.replace(/\D/g, "");
    value = value.replace(/(\d)(\d{2})$/, "$1,$2");
    value = value.replace(/(?=(\d{3})+(\D))\B/g, ".");
    value = `R$ ${value}`;
    if(value.length === 3) value = '';
    event.target.value = value;
    return event
}

export const initSelectOptions = (menu) => {

    const initCategories = menu.categories.map((category) => {

        const {
            categoryId: id,
            categoryName: label
        } = category;
        
        return {
            id,
            label
        };
    });
        
    const initSubcategories = menu.subcategories.map((subcategory) => {

        const {
            categoryId,
            categoryName,
            subcategoryId: id,
            subcategoryName: label
        } = subcategory;
        
        return {
            categoryId,
            categoryName,
            id,
            label
        }
    });

    const initItems = menu.items.map((item) => {

        const {
            categoryId, 
            categoryName,
            subcategoryId,
            subcategoryName,
            itemId: id,
            itemName: label
        } = item;

        return {
            categoryId, 
            categoryName,
            subcategoryId,
            subcategoryName,
            id,
            label,
            isDisabled: true
        }

    });

    return {
        initCategories,
        initSubcategories,
        initItems
    }
}

//**************************************** CREATE ITEM */

const saveItemImage = async (image) => {

    const convertedItemImage = await getFileToConvert(image[0], 'itemImage');
    const createdItemImage = await uploadConvertedFile( convertedItemImage, 'user');

    return createdItemImage.description;

}

export const createItem = async (data) => {

    const promotionalPrice = data.hasPromotion ? data.promotionalPrice : null;
    const description = data.hasDescription ? data.description.replace(/\s+$/g, '') : null;
    const image = data.hasImage ? await saveItemImage(data.image) : null;
    const ratings = [0];

    const item: CreateItemData = {
        category: {
            categoryId: data.categoryId,
            categoryName: data.categoryName,
        },
        subcategory: {
            categoryId: data.categoryId,
            categoryName: data.categoryName,
            subcategoryId: data.subcategoryId,
            subcategoryName: data.subcategoryName,
        },
        item: {
            categoryId: data.categoryId,
            categoryName: data.categoryName,
            subcategoryId: data.subcategoryId,
            subcategoryName: data.subcategoryName,
            itemId: data.itemId,
            itemName: data.itemName,
            price: data.price,
            hasPromotion: data.hasPromotion,
            promotionalPrice: promotionalPrice,
            hasDescription: data.hasDescription,
            description: description,
            hasImage: data.hasImage,
            image: image,
            hasRating: data.hasRating,
            ratings: ratings
        }
    }

    const clientRequest = clientBasicRequest(); //Makes request without context

    const create = await clientRequest.post('/api/users/setUserMenu', item).then(response => {
        return response.data;
    });
    
    return create;
}
