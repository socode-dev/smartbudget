import ThresholdFields from "./ThresholdFields";
import Alert from "../ui/Alert";
import Button from "../ui/Button";
import { defaultThresholds } from "../../schema/thresholdSchemas";
import { FiRotateCcw, FiSave } from "react-icons/fi";
export default function ThresholdSettings({
  handleSubmit,
  save,
  notice,
  groups,
  isSubmitting,
  register,
  errors,
  currency,
  reset,
  setNotice,
}) {
  
  return (
    <section
      className="min-w-0 bg-surface border border-border rounded-xl py-5 [&>header]:py-5 [&_h2]:font-display [&_h2]:text-base [&_h2]:font-semibold"
      aria-labelledby="thresholds-heading"
    >
      <header className="px-4 pb-5 border-b border-border">
        <h2 id="thresholds-heading">Alert thresholds</h2>
        <p className="text-xs">Threshold customize when you receive large transaction, budget warnings and goal milestone.</p>
      </header>

      <form onSubmit={handleSubmit(save)} className="grid min-w-0 gap-5 pt-5 px-4">
        {notice && <Alert tone={notice.tone}>{notice.text}</Alert>}
        
        {groups.map((group) => (
          <ThresholdFields
            key={group.title}
            group={group}
            isSubmitting={isSubmitting}
            register={register}
            errors={errors}
            currency={currency}
          />
        ))}
        <div className="flex flex-wrap justify-end gap-2 border-t border-border pt-5">
          <Button
            variant="outline"
            disabled={isSubmitting}
            onClick={() => {
              reset(defaultThresholds);
              setNotice(null);
            }}
          >
            <span className="flex items-center gap-2">
              <FiRotateCcw aria-hidden="true" />
              Restore defaults
            </span>
          </Button>
          <Button type="submit" loading={isSubmitting} loadingText="Saving...">
            <span className="flex items-center gap-2">
              <FiSave aria-hidden="true" />
              Save preferences
            </span>
          </Button>
        </div>
      </form>
    </section>
  );
}
