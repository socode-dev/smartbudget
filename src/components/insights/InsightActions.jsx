import { useState } from "react";
import { FiCheck, FiX } from "react-icons/fi";
import toast from "react-hot-toast";
import useAuthStore from "../../store/useAuthStore";
import { showDemoReadOnlyToast, useDemoMode } from "../../demo/useDemoMode";
import { respondToInsight } from "../../api/respondToInsight";
import Button from "../ui/Button";
import InsightBadge from "./InsightBadge";

const getResponseAction = (response) => {
  switch (response) {
    case "ACKNOWLEDGED":
      return {
        response,
        Icon: FiCheck,
        label: "Acknowledge",
        loadingText: "Saving...",
        variant: "primary",
      };
    case "DISMISSED":
      return {
        response,
        Icon: FiX,
        label: "Dismiss",
        loadingText: "Dismissing...",
        variant: "ghost",
      };
    default:
      return null;
  }
};

const RESPONSE_ACTIONS = ["ACKNOWLEDGED", "DISMISSED"]
  .map(getResponseAction)
  .filter(Boolean);

const InsightActions = ({ insight, surface }) => {
  const userId = useAuthStore((state) => state.currentUser?.uid);
  const demo = useDemoMode();
  const [saving, setSaving] = useState(null);
  const terminal = ["ACKNOWLEDGED", "DISMISSED", "EXPIRED"].includes(insight.status);

  const respond = async (response) => {
    if (demo) return showDemoReadOnlyToast();
    if (!userId || !insight.id || terminal || saving) return;
    setSaving(response);

    try {
      const result = await respondToInsight({
        userId,
        insight,
        response,
        surface,
      });

      toast.success(
        result?.success?.message ||
          (response === "ACKNOWLEDGED"
            ? "Insight acknowledged"
            : "Insight dismissed"),
      );
    } catch (error) {
      toast.error(
        error?.message || "Unable to save your response. Please try again.",
      );
    } finally {
      setSaving(null);
    }
  };

  return (
    <aside
      className="min-w-0 rounded-lg border border-border bg-surface p-4"
      aria-label="Insight response"
    >
      {insight.actionText && (
        <>
          <h3 className="text-[11px] font-semibold text-muted-foreground uppercase">
            Suggested action
          </h3>
          <p className="mt-2 text-sm leading-relaxed wrap-anywhere">
            {insight.actionText}
          </p>
        </>
      )}
      {terminal ? (
        <div className="mt-4">
          <InsightBadge value={insight.status} />
        </div>
      ) : (
        <div className="mt-4 flex flex-wrap gap-2">
          {RESPONSE_ACTIONS.map(
            ({ response, Icon, label, loadingText, variant }) => (
              <Button
                key={response}
                variant={variant}
                onClick={() => respond(response)}
                loading={saving === response}
                loadingText={loadingText}
                disabled={!!saving}
                className="min-h-8! px-3! py-1.5! text-xs!"
              >
                <span className="flex items-center gap-2">
                  <Icon aria-hidden="true" />
                  {label}
                </span>
              </Button>
            ),
          )}
        </div>
      )}
    </aside>
  );
};

export default InsightActions;
