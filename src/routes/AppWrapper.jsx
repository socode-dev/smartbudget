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
import { NotificationProvider } from "../context/NotificationContext";

const AppWrapper = ({ children }) => {
  return (
    <AuthFormProvider>
      <AuthProvider>
        <AppInitializer />
        <FormProvider>
          <NotificationProvider>
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
          </NotificationProvider>
        </FormProvider>
      </AuthProvider>
    </AuthFormProvider>
  );
};

export default AppWrapper;
