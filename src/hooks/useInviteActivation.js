import { useEffect, useState } from "react";
import { onAuthStateChanged } from "firebase/auth";
import { auth } from "../firebase/firebase";
import { doCreateUserWithEmailAndPassword } from "../firebase/auth";
import { activateInviteToken, validateInviteToken } from "../api/invites";

const initialForm = {
  email: "",
  password: "",
  confirmPassword: "",
};

const useInviteActivation = (token) => {
  const [status, setStatus] = useState("validating");
  const [invite, setInvite] = useState(null);
  const [form, setForm] = useState(initialForm);
  const [error, setError] = useState("");
  const [currentUser, setCurrentUser] = useState(() => auth.currentUser);

  useEffect(() => {
    return onAuthStateChanged(auth, setCurrentUser);
  }, []);

  useEffect(() => {
    let cancelled = false;

    const validate = async () => {
      if (!token) {
        setStatus("invalid");
        setError("Activation link is missing its invite token.");
        return;
      }

      try {
        setStatus("validating");
        const validatedInvite = await validateInviteToken(token);

        if (cancelled) return;

        setInvite(validatedInvite);
        setStatus("ready");
      } catch (err) {
        if (cancelled) return;

        setError(err.message);
        setStatus(err.code === "INVITE_EXPIRED" ? "expired" : "invalid");
      }
    };

    validate();

    return () => {
      cancelled = true;
    };
  }, [token]);

  const handleChange = (event) => {
    const { name, value } = event.target;

    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const activateCurrentUser = async (user) => {
    const idToken = await user.getIdToken(true);

    return activateInviteToken({ token, idToken });
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (status === "submitting") return;

    setError("");

    if (!form.email.trim()) {
      setError("Email is required.");
      return;
    }

    if (form.password.length < 6) {
      setError("Password must be at least 6 characters.");
      return;
    }

    if (form.password !== form.confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    try {
      setStatus("submitting");

      if (currentUser) {
        await activateCurrentUser(currentUser);
      } else {
        const credential = await doCreateUserWithEmailAndPassword(
          form.email.trim(),
          form.password
        );

        await activateCurrentUser(credential.user);
      }

      setStatus("success");
    } catch (err) {
      setError(err.message || "Activation could not be completed.");
      setStatus("ready");
    }
  };

  const handleRetryActivation = async () => {
    const user = auth.currentUser;

    if (!user) {
      setError("Please enter your email and password to continue.");
      return;
    }

    try {
      setStatus("submitting");
      setError("");

      await activateCurrentUser(user);

      setStatus("success");
    } catch (err) {
      setError(err.message || "Activation could not be completed.");
      setStatus("ready");
    }
  };

  return {
    currentUser,
    error,
    form,
    handleChange,
    handleRetryActivation,
    handleSubmit,
    invite,
    status,
  };
};

export default useInviteActivation;
