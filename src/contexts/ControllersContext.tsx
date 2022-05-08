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
    view: ViewData;
    setView: Dispatch<SetViewData>;
}

export const Controllers = createContext({} as ControllersData);

export const ControllersProvider = ({children}) => {

    const [ panelsState, setPanelsState ] = useReducer( handlePanelStates, initPanelsState ); //View panels controller
    const [ view, setView ] = useReducer(handleView, initView) //Navbar view

    return (
        <Controllers.Provider value={{ panelsState, setPanelsState, view, setView }} >
            {children}
        </Controllers.Provider>
    )

}