import { createContext, Dispatch, SetStateAction, useReducer, useState } from 'react';

//*************************View panels controller
type PanelsStateData = {
    emptyPresentation: boolean,
    createItems: boolean,
    shareAccess: boolean;
}

type PanelsData = {
    name: string;
}

const handlePanelStates = ( panelsState: PanelsStateData, panel: PanelsData ) => {

    Object.keys(panelsState).map(( key ) => {
        panelsState[key] = false
    });

    return {...panelsState, [panel.name]: true};

}

const initPanelsState: PanelsStateData = {
    emptyPresentation: true,
    createItems: false,
    shareAccess: false,
}

//*****************************Selected options controller

type OptionsData = {
    createGroup: 'createGroup' | undefined;
    createSubGroup: 'createSubGroup' | undefined;
    createItem: 'createItem' | undefined;
}

type SetOptionsData = {
    type: 'createGroup' | 'createSubGroup' | 'createItem';
    option: string;
}

const handleOptions = ( options: OptionsData, setOptions: SetOptionsData ) => {
    return {...options, [setOptions.type]: setOptions.option}
}

const initOptions: OptionsData = {
    createGroup: undefined,
    createSubGroup: undefined,
    createItem: undefined,
}

//************************************ Navbar views controller

type ViewData = {
    viewProfile: boolean;
    viewMenu: boolean;
}

type SetViewData = {
    type: 'viewProfile' | 'viewMenu'
    action: boolean
}

const handleView = (state: ViewData, action: SetViewData) => {

    Object.keys(state).map(( key ) => {
        state[key] = false
    });

    return {...state, [action.type]: action.action};
}

const initView: ViewData = {
    viewProfile: false,
    viewMenu: false
}

//************************************Controllers component

type ControllersData = {
    panelsState: PanelsStateData;
    setPanelsState: Dispatch<PanelsData>;
    options: OptionsData;
    setOptions: Dispatch<SetOptionsData>;
    view: ViewData;
    setView: Dispatch<SetViewData>
}

export const Controllers = createContext({} as ControllersData);

export const ControllersProvider = ({children}) => {

    const [ panelsState, setPanelsState ] = useReducer( handlePanelStates, initPanelsState ); //View panels controller
    const [ options, setOptions ] = useReducer( handleOptions, initOptions ); //Selected options controller
    const [ view, setView ] = useReducer(handleView, initView) //Navbar view

    return (
        <Controllers.Provider value={{ panelsState, setPanelsState, options, setOptions, view, setView }} >
            {children}
        </Controllers.Provider>
    )

}