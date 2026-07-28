import { RouterProvider } from "react-router-dom";
import { router } from "./routes/router.jsx";
import { ErrorBoundary } from "./components/ui/ErrorBoundary.jsx";
import { AuthProvider } from "./context/AuthContext.jsx";
import { PwaProvider } from "./context/PwaContext.jsx";
import { PwaStatus } from "./components/pwa/PwaStatus.jsx";

const App = () => (
  <PwaProvider>
    <PwaStatus />
    <ErrorBoundary>
      <AuthProvider>
        <RouterProvider router={router} />
      </AuthProvider>
    </ErrorBoundary>
  </PwaProvider>
);

export default App;
