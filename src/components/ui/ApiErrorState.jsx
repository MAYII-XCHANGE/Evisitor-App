import { FiAlertCircle } from "react-icons/fi";
import { Button } from "./Button";
import { getApiError } from "../../utils/apiResponse";

export const ApiErrorState = ({ error, onRetry }) => {
  const apiError = getApiError(error);
  return (
    <div className="rounded-xl border border-red-100 bg-red-50 p-6 text-center">
      <FiAlertCircle className="mx-auto h-9 w-9 text-danger" />
      <h3 className="mt-3 font-bold text-gray-900">Unable to load this information</h3>
      <p className="mt-1 text-sm text-red-700">{apiError.message}</p>
      {onRetry && <Button className="mt-4" onClick={onRetry}>Try again</Button>}
    </div>
  );
};
