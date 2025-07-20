import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import schemas from "../schema/schemas";

const useSmartForm = (label) => {
  const schema = schemas[label];

  if (!schema) {
    console.log(`Schema for ${label} not found`);
    throw new Error(`Schema for ${label} not found`);
  }

  const form = useForm({
    resolver: zodResolver(schema),
    mode: "onChange",
  });

  return form;
};

export default useSmartForm;
