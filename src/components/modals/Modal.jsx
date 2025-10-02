import ModalForm from "../forms/ModalForm";
import Dialog from "../ui/Dialog";

const Modal = ({ label, title, description, mode }) => {
  return (
    <Dialog ariaLabel={`${mode}-${label}`}>
      <section className="">
        <h2 className="text-2xl md:text-3xl font-semibold mb-1">{title}</h2>
        <p className="text-base text-[rgb(var(--color-muted))] mb-6">
          {description}
        </p>
        <ModalForm label={label} mode={mode} />
      </section>
    </Dialog>
  );
};

export default Modal;
