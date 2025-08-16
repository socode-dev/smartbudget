import { AuthFormProvider } from "../context/AuthFormContext";
import { AuthProvider } from "../context/AuthContext";
import AppInitializer from "../initializer/AppInitializer";
import { FormProvider } from "../context/FormContext";
import { ModalProvider } from "../context/ModalContext";
import { OverviewProvider } from "../context/OverviewContext";
import { OverviewChartProvider } from "../context/OverviewChartContext";
import { TransactionsProvider } from "../context/TransactionsContext";
import { ReportProvider } from "../context/ReportContext";
import { ReportChartProvider } from "../context/ReportChartContext";

const AppWrapper = ({ children }) => {
  return (
    <AuthFormProvider>
      <AuthProvider>
        <AppInitializer />
        <FormProvider>
          <ModalProvider>
            <OverviewProvider>
              <OverviewChartProvider>
                <TransactionsProvider>
                  <ReportProvider>
                    <ReportChartProvider>{children}</ReportChartProvider>
                  </ReportProvider>
                </TransactionsProvider>
              </OverviewChartProvider>
            </OverviewProvider>
          </ModalProvider>
        </FormProvider>
      </AuthProvider>
    </AuthFormProvider>
  );
};

export default AppWrapper;
