import DataExportSettings from "../components/settings/DataExportSettings";
import ThresholdSettings from "../components/settings/ThresholdSettings";
import AppearanceSettings from "../components/settings/AppearanceSettings";
import { useEffect, useState } from "react";
import useThemeStore from "../store/useThemeStore";
import useCurrencyStore from "../store/useCurrencyStore";
import useThresholdStore from "../store/useThresholdStore";
import useAuthStore from "../store/useAuthStore";
import useTransactionStore from "../store/useTransactionStore";
import useThresholdForm from "../hooks/useThresholdForm";
import { defaultThresholds } from "../schema/thresholdSchemas";
import { useOverviewContext } from "../context/OverviewContext";
import { showDemoReadOnlyToast, useDemoMode } from "../demo/useDemoMode";
import ScrollToTop from "../layout/ScrollToTop";

const groups = [
  {
    title: "Transaction alerts",
    fields: [
      [
        "transactionThreshold",
        "Large expense threshold",
        "Any single transaction above this triggers a high-risk alert."
      ]
    ],
  },
  {
    title: "Budget alerts",
    fields: [
      [
        "budgetThreshold50",
        "Budget progress alert",
        "Low-risk alert when a category reaches this share of its limit."
      ],
      [
        "budgetThreshold80",
        "Budget warning",
        "Medium-risk alert when a category reaches this share of its limit."
      ],
      [
        "budgetThreshold100",
        "Budget limit alert",
        "High-risk alert once a category crosses this share."
      ],
    ],
  },
  {
    title: "Goal milestones",
    fields: [
      [
        "goalThreshold50",
        "Goal progress alert",
        "Notify when a goal passes this share of its target."
      ],
      [
        "goalThreshold80",
        "Goal nearly funded",
        "Notify when a goal is this close to complete."
      ],
      [
        "goalThreshold100",
        "Goal completion alert",
        "Notify when a goal is completed."
      ],
    ],
  },
];

const Settings = () => {
  const demo = useDemoMode();
  const userId = useAuthStore((state) => state.currentUser?.uid);
  const theme = useThemeStore((state) => state.theme);
  const toggleTheme = useThemeStore((state) => state.toggleTheme);
  const currency = useCurrencyStore((state) => state.selectedCurrency);
  const currencies = useCurrencyStore((state) => state.currencies);
  const setCurrency = useCurrencyStore((state) => state.setSelectedCurrency);
  const thresholds = useThresholdStore((state) => state.thresholds);
  const updateThresholds = useThresholdStore((state) => state.updateThresholds);
  const transactions = useTransactionStore((state) => state.transactions);
  const { handleCSVExport, handlePDFExport } = useOverviewContext();
  const { register, errors, isSubmitting, handleSubmit, reset } =
    useThresholdForm();
  
    const [notice, setNotice] = useState(null);
  
  useEffect(() => {
    reset({
      ...defaultThresholds,
      ...thresholds,
    });
  }, [thresholds, reset]);
  
  const save = async (values) => {
    if (demo) return showDemoReadOnlyToast();
    setNotice(null);
    
    if (!userId)
      return setNotice({
        tone: "error",
        text: "Please sign in again to save your preferences.",
      });
    
    try {
    
      await updateThresholds(userId, values);
    
      setNotice({
        tone: "success",
        text: "Preferences saved.",
      });
    } catch {
      setNotice({
        tone: "error",
        text: "Preferences could not be saved. Please try again.",
      });
    }
  };
  
  const exportData = (format) => {
    if (demo) return showDemoReadOnlyToast();
    if (format === "csv") handleCSVExport();
    else handlePDFExport();
  };
  
  return (
    <div className="mx-auto min-w-0 w-full max-w-[90rem] space-y-6 px-4 py-8 sm:px-6">
      <ScrollToTop />
      <div className="grid w-full max-w-3xl gap-6">
        <header>
          <h1 className="font-display text-3xl font-semibold">Settings</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Appearance, currency, and notification preferences.
          </p>
        </header>

        <AppearanceSettings
          theme={theme}
          toggleTheme={toggleTheme}
          currency={currency}
          setCurrency={setCurrency}
          currencies={currencies}
        />
        
        <ThresholdSettings
          handleSubmit={handleSubmit}
          save={save}
          notice={notice}
          groups={groups}
          isSubmitting={isSubmitting}
          register={register}
          errors={errors}
          currency={currency}
          reset={reset}
          setNotice={setNotice}
        />
        
        <DataExportSettings
          transactions={transactions}
          exportData={exportData}
        />
      </div>
    </div>
  );
};

export default Settings;
