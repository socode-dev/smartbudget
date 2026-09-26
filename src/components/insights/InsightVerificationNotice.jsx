import { FiMail } from "react-icons/fi";

export default function InsightVerificationNotice() {

  return (
    <section className="flex min-h-80 flex-col items-center justify-center gap-4 px-4 py-8 text-center">
      <FiMail size={28} aria-hidden="true" />
      <h2 className="font-display text-xl font-semibold">Verify your email</h2>
      <p className="text-sm text-muted-foreground">
        Please verify your email to access this feature.
      </p>
    </section>
  );
}
