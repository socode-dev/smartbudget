import { useEffect } from "react";
import { useModalContext } from "../../context/ModalContext";
import Modal from "./Modal";
import { useMainContext } from "../../context/MainContext";

const FormModal = () => {
  const { modalState } = useModalContext();
  const { isSidebarOpen } = useMainContext();

  // Disable window scroll when modal is open
  useEffect(() => {
    if (
      modalState.transactions.open ||
      modalState.budgets.open ||
      modalState.goals.open ||
      modalState.contributions.open ||
      isSidebarOpen
    ) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "auto";
    }

    return () => (document.body.style.overflow = "");
  }, [modalState, isSidebarOpen]);

  return (
    <>
      {modalState.transactions.open && (
        <Modal
          label="transactions"
          mode={modalState.transactions.mode}
          title={
            modalState.transactions.mode === "add"
              ? "Add Transaction"
              : "Edit Transaction"
          }
          description="Track your spending in real time."
        />
      )}
      {modalState.budgets.open && (
        <Modal
          label="budgets"
          mode={modalState.budgets.mode}
          title={
            modalState.budgets.mode === "add" ? "Set Budget" : "Edit Budget"
          }
          description="Set a financial target to track and achieve."
        />
      )}
      {modalState.goals.open && (
        <Modal
          label="goals"
          mode={modalState.goals.mode}
          title={modalState.goals.mode === "add" ? "Set Goal" : "Edit Goal"}
          description="Set a financial target to track and achieve."
        />
      )}
      {modalState.contributions.open && (
        <Modal
          label="contributions"
          mode={modalState.contributions.mode}
          title="Add Contribution"
          description="Make progress towards your savings goal."
        />
      )}
    </>
  );
};

export default FormModal;
