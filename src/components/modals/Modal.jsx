import { FiX } from "react-icons/fi";
import { useFormContext } from "../../context/FormContext";
import { useModalContext } from "../../context/ModalContext";
import ModalForm from "../forms/ModalForm";
import Dialog from "../ui/Dialog";
import Button from "../ui/Button";

const Modal = ({ label, title, description, mode, open }) => {
  const { onCloseModal } = useModalContext();
  const { reset, formState: { isSubmitting } } = useFormContext(label);
  
  const close = () => {
    if (!isSubmitting) onCloseModal(label);
  };
  
  return (
    <Dialog
      open={open}
      onClose={close}
      padded={false}
      onExitComplete={() => {
        if (!open) reset();
      }}
      ariaLabelledBy={`${label}-title`}
      ariaDescribedBy={`${label}-description`}
    >
      <header className="flex items-start justify-between gap-4 border-b border-border px-6 py-5">
        <div className="min-w-0">
          <h2
            id={`${label}-title`}
            className="font-display text-2xl font-semibold"
          >
            {title}
          </h2>
          <p
            id={`${label}-description`}
            className="mt-1 text-sm text-muted-foreground"
          >
            {description}
          </p>
        </div>
        <Button
          variant="ghost"
          className="size-11 min-h-11 shrink-0 p-0!"
          disabled={isSubmitting}
          onClick={close}
          aria-label={`Close ${title.toLowerCase()}`}
          title="Close"
        >
          <FiX aria-hidden="true" />
        </Button>
      </header>
      <ModalForm label={label} mode={mode} onClose={close} />
    </Dialog>
  );
};
export default Modal;
