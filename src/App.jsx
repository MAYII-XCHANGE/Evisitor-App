import { RouterProvider } from "react-router-dom";
import { router } from "./routes/router.jsx";
import { ErrorBoundary } from "./components/ui/ErrorBoundary.jsx";

const App = () => (
  <ErrorBoundary>
    <RouterProvider router={router} />
  </ErrorBoundary>
);

export default App;
