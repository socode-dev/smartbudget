import { createContext, useContext, useReducer } from "react";

const ModalContext = createContext();

const modalInitialState = {
  expense: false,
  budget: false,
  goal: false,
  contribution: false,
};

const modalReducer = (state, action) => {
  switch (action.type) {
    case "OPEN":
      return { ...state, [action.label]: true };
    case "CLOSE":
      return { ...state, [action.label]: false };
    default:
      return state;
  }
};

export const ModalProvider = ({ children }) => {
  const [modalState, modalDispatch] = useReducer(
    modalReducer,
    modalInitialState
  );

  const onOpenModal = (modal) => {
    modalDispatch({ type: "OPEN", label: modal });
  };

  const onCloseModal = (modal) => {
    modalDispatch({ type: "CLOSE", label: modal });
  };

  return (
    <ModalContext.Provider
      value={{
        modalState,
        onOpenModal,
        onCloseModal,
      }}
    >
      {children}
    </ModalContext.Provider>
  );
};

export const useModalContext = () => useContext(ModalContext);
