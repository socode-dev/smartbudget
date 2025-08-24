import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  thresholdSchemas,
  defaultThresholds,
} from "../schema/thresholdSchemas";

const useThresholdForm = () => {
  const form = useForm({
    resolver: zodResolver(thresholdSchemas),
    defaultValues: defaultThresholds,
    mode: "onSubmit",
  });

  const {
    register,
    handleSubmit,
    reset,
    getValues,
    setValue,
    formState: { errors, isSubmitting },
  } = form;

  return {
    register,
    handleSubmit,
    reset,
    getValues,
    setValue,
    errors,
    isSubmitting,
  };
};

export default useThresholdForm;
