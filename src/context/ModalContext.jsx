import { createContext, useContext, useReducer } from "react";
import { useFormContext } from "../context/FormContext";

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
  const forms = useFormContext("budgets");
  const { reset } = forms;

  const onOpenModal = (modal, mode = "add", meta = {}) => {
    modalDispatch({ type: "OPEN", label: modal, mode, meta });
  };

  const onCloseModal = (modal) => {
    modalDispatch({ type: "CLOSE", label: modal });
    reset();
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
