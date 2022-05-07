export const customStyles = {

    container: (provided, state) => ({
        ...provided,
        width: '100%',
        height: 'fit-content',
        display: 'flex',
        justifyContent: 'center',
    }),

    control: (provided, state) => ({
        ...provided,
        border: `1px solid ${state.isFocused ? '#f48c06b3' : '#CCC'} `,
        boxShadow: 'none',
        width: '100%',
        height: '40px',
        fontFamily: 'Dosis, sans-serif',
        fontSize: '14px',
        fontWeight: '500',
        letterSpacing: '2px',
        padding: '0',
        "&:hover": {
            borderColor: "#f48c06b3",
            boxShadow: 'none'
        },
    }),

    menu: (provided, state) => ({
        ...provided,
        width: '100%',
        padding: '10px',
      }),


    option: (provided, state) => ({
        ...provided,
        color: state.isDisabled ? '#CCC' : state.isSelected ? '#f48c06b3' : '#000',
        backgroundColor: '#FFF',
        fontFamily: 'Dosis, sans-serif',
        fontSize: '16px',
        fontWeight: '500',
        letterSpacing: '2px',
        "&:hover": {
            backgroundColor: state.isDisabled ? '#FFF' : '#f48c06b3',
            color: state.isDisabled ? '#CCC' : state.isSelected ? '#FFF' : '#000'
        },
        padding: 10,
    }),
    
}