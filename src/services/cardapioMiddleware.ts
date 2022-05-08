type CategoryButtonData = {
    id: string;
    state: boolean;
}

type CategoryButtonsData = {
    [key: string]: boolean;
}

export const categoryButtonsReducer = (buttons: CategoryButtonsData, button: CategoryButtonData) => {

    Object.keys(buttons).map((button) => {
        buttons[button] = false
    });

    return {...buttons, [button.id]: button.state}
}
