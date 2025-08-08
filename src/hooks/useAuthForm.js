import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import authSchemas from "../schema/authSchemas";

const useAuthForm = (type) => {
  const schema = authSchemas[type];

  if (!schema) {
    console.log(`Schema for ${type} not found`);
    throw new Error(`Schema for ${type} not found`);
  }

  const form = useForm({
    resolver: zodResolver(schema),
    mode: "all",
  });

  return form;
};

export default useAuthForm;
