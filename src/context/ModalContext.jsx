import { createContext, useContext, useReducer, useState } from "react";

const ModalContext = createContext();

const modalInitialState = {
  transactions: { open: false, mode: "add" },
  budgets: { open: false, mode: "add" },
  goals: { open: false, mode: "add" },
  contributions: { open: false, mode: "add" },
};

const modalReducer = (state, action) => {
  switch (action.type) {
    case "OPEN":
      return {
        ...state,
        [action.label]: {
          open: true,
          mode: action.mode || "add",
          meta: action.meta || {},
        },
      };
    case "CLOSE":
      return {
        ...state,
        [action.label]: { ...state[action.label], open: false, meta: {} },
      };
    default:
      return state;
  }
};

export const ModalProvider = ({ children }) => {
  const [modalState, modalDispatch] = useReducer(
    modalReducer,
    modalInitialState
  );

  const [transactionID, setTransactionID] = useState("");

  const onOpenModal = (modal, mode = "add", meta = {}) => {
    modalDispatch({ type: "OPEN", label: modal, mode, meta });
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
        transactionID,
        setTransactionID,
      }}
    >
      {children}
    </ModalContext.Provider>
  );
};

export const useModalContext = () => useContext(ModalContext);
