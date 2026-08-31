import { useMemo } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import AuthMotionShell from "../components/auth/AuthMotionShell";
import PasswordField from "../components/auth/PasswordField";
import LoadingSpinner from "../components/ui/LoadingSpinner";
import useInviteActivation from "../hooks/useInviteActivation";

const ActivateInvite = () => {
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();

    const token = useMemo(
        () => searchParams.get("token")?.trim() ?? "",
        [searchParams]
    );

    const {
        currentUser,
        error,
        form,
        handleChange,
        handleRetryActivation,
        handleSubmit,
        invite,
        status,
    } = useInviteActivation(token);

    if (status === "validating") {
        return (
        <AuthMotionShell>
            <PageTitle
            title="Activate SmartBudget"
            description="Checking your activation link..."
            />
            <LoadingSpinner
            color="rgb(var(--color-brand))"
            borderTopColor="rgb(var(--color-gray-border))"
            />
        </AuthMotionShell>
        );
    }

    if (status === "invalid" || status === "expired") {
        return (
        <AuthMotionShell>
            <PageTitle title="Activation Link Unavailable" />
            <AlertMessage>{error}</AlertMessage>
        </AuthMotionShell>
        );
    }

    if (status === "success") {
        return (
        <AuthMotionShell>
            <PageTitle
            title="SmartBudget Activated"
            description="Your account is ready."
            />

            <button
            type="button"
            onClick={() => navigate("/")}
            className="w-11/12 text-base text-center font-medium py-2 rounded-lg shadow bg-[rgb(var(--color-brand))] text-white hover:scale-97 active:scale-103 transition cursor-pointer"
            >
            Continue
            </button>
        </AuthMotionShell>
        );
    }

    return (
        <AuthMotionShell>
        <PageTitle
            title="Activate SmartBudget"
            description={getInviteExpiryText(invite)}
        />

        {currentUser ? (
            <SignedInActivation
            currentUser={currentUser}
            isSubmitting={status === "submitting"}
            onActivate={handleRetryActivation}
            />
        ) : (
            <ActivationForm
            form={form}
            isSubmitting={status === "submitting"}
            onChange={handleChange}
            onSubmit={handleSubmit}
            />
        )}

        {error ? <AlertMessage>{error}</AlertMessage> : null}
        
        </AuthMotionShell>
    );
    };

    const PageTitle = ({ description, title }) => (
    <>
        <h2 className="text-3xl md:text-4xl text-[rgb(var(--color-brand))] text-center font-medium tracking-wide">
            {title}
        </h2>
        {description ? (
        <p className="text-base text-[rgb(var(--color-muted))] text-center mt-4 mb-6">
            {description}
        </p>
        ) : null}
    </>
    );

    const AlertMessage = ({ children }) => (
    <p
        role="alert"
        className="w-11/12 bg-[rgb(var(--color-status-bg-red))] px-4 py-2 rounded text-red-600 text-sm text-center mt-4"
    >
        {children}
    </p>
    );

    const SignedInActivation = ({ currentUser, isSubmitting, onActivate }) => (
    <section className="w-11/12 flex flex-col items-center">
        <p className="w-full bg-[rgb(var(--color-status-bg-blue))] px-4 py-2 rounded text-sm text-[rgb(var(--color-muted))] text-center mb-4">
            You are already signed in as {currentUser.email}. Continue to activate this invite.
        </p>

        <button
            type="button"
            onClick={onActivate}
            disabled={isSubmitting}
            aria-busy={isSubmitting}
            className="w-full text-base text-center font-medium py-2 rounded-lg shadow bg-[rgb(var(--color-brand))] text-white hover:scale-97 active:scale-103 transition cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
        >
            {isSubmitting 
                ? <LoadingSpinner size={25} /> 
                : "Activate account"
            }
        </button>
    </section>
    );

    const ActivationForm = ({ form, isSubmitting, onChange, onSubmit }) => (
    <form onSubmit={onSubmit} className="w-11/12">
        <fieldset className="w-full mb-4">
            <div className="flex flex-col gap-1">
                <label
                    htmlFor="email"
                    className="text-base text-[rgb(var(--color-muted))] font-medium after:content-['*'] after:text-red-500 after:ml-0.5"
                >
                    Email
                </label>
                <input
                    id="email"
                    name="email"
                    type="email"
                    value={form.email}
                    onChange={onChange}
                    autoComplete="email"
                    required
                    placeholder="Enter your email"
                    className="w-full text-base text-[rgb(var(--color-muted))] px-4 py-2 rounded-lg border-2 border-[rgb(var(--color-gray-border))] outline-none focus:border-[rgb(var(--color-brand))] focus:ring-2 focus:ring-[rgb(var(--color-brand))] focus:ring-offset-2 transition"
                />
            </div>
        </fieldset>

        <PasswordField
            id="password"
            label="Password"
            name="password"
            value={form.password}
            onChange={onChange}
            placeholder="Enter password"
        />

        <PasswordField
            id="confirmPassword"
            label="Confirm Password"
            name="confirmPassword"
            value={form.confirmPassword}
            onChange={onChange}
            placeholder="Confirm password"
        />

        <button
            type="submit"
            disabled={isSubmitting}
            aria-busy={isSubmitting}
            className="w-full mt-6 text-base font-medium text-center py-2 rounded-lg shadow bg-[rgb(var(--color-brand))] text-white hover:scale-97 active:scale-103 disabled:opacity-50 disabled:cursor-not-allowed transition cursor-pointer"
        >
            {isSubmitting 
                ? <LoadingSpinner size={25} /> 
                : "Activate now"
            }
        </button>
    </form>
    );

    const getInviteExpiryText = (invite) => {
    if (!invite?.expiresAtMs) return "";

    return `This invite is valid until ${new Date(invite.expiresAtMs).toLocaleDateString()}.`;
};

export default ActivateInvite;
