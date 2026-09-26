import { useEffect } from "react";
import { useModalContext } from "../../context/ModalContext";
import { useMainContext } from "../../context/MainContext";
import Modal from "./Modal";

const modalDefinitions = [
  {
    label: "transactions",
    addTitle: "Add Transaction",
    editTitle: "Edit Transaction",
    description: "Track your spending in real time.",
  },
  {
    label: "budgets",
    addTitle: "Set Budget",
    editTitle: "Edit Budget",
    description: "Set a financial target to track and achieve.",
  },
  {
    label: "goals",
    addTitle: "Set Goal",
    editTitle: "Edit Goal",
    description: "Set a financial target to track and achieve.",
  },
  {
    label: "contributions",
    addTitle: "Add Contribution",
    editTitle: "Edit Contribution",
    description: "Make progress towards your savings goal.",
  },
];

const FormModal = () => {
  const { modalState } = useModalContext();
  const { isSidebarOpen } = useMainContext();

  useEffect(() => {
    if (!isSidebarOpen) return;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, [isSidebarOpen]);

  return modalDefinitions.map(({ label, addTitle, editTitle, description }) => (
    <Modal
      key={label}
      label={label}
      open={modalState[label].open}
      mode={modalState[label].mode}
      title={modalState[label].mode === "add" ? addTitle : editTitle}
      description={description}
    />
  ));
};

export default FormModal;
