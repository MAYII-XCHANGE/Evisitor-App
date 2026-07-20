import { RouterProvider } from "react-router-dom";
import { router } from "./routes/router.jsx";
import { ErrorBoundary } from "./components/ui/ErrorBoundary.jsx";
import { AuthProvider } from "./context/AuthContext.jsx";

const App = () => (
  <ErrorBoundary>
    <AuthProvider>
      <RouterProvider router={router} />
    </AuthProvider>
  </ErrorBoundary>
);

export default App;
