import FormField from "../ui/FormField";
import clsx from "clsx";

export default function EntryNameField({
  fieldId,
  categorized,
  contributionLabel,
  goalLabel,
  errors,
  register,
  controlClass,
}) {

  return (
    <FormField
      id={fieldId("name")}
      label={
        categorized
          ? "Set Custom Category"
          : contributionLabel
            ? "Goal"
            : "Name"
      }
      required={goalLabel}
      error={errors.name}
    >
      {(props) => (
        <input
          {...props}
          {...register("name")}
          type="text"
          readOnly={contributionLabel}
          placeholder={categorized ? "Transportation..." : "Input goal name"}
          className={clsx(
            controlClass,
            contributionLabel && "bg-surface text-muted-foreground",
          )}
        />
      )}
    </FormField>
  );
}
