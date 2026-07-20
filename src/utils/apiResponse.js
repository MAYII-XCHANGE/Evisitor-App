export const unwrapResponse = (response) => response?.data?.data;

export const getApiError = (error, fallback = "The request could not be completed") => {
  const payload = error?.response?.data;
  const message = payload?.detail || payload?.message || error?.message || fallback;
  return {
    message,
    status: error?.response?.status,
    fieldErrors: payload?.fieldErrors || {},
  };
};

export const emptyPage = Object.freeze({
  content: [],
  number: 0,
  size: 20,
  totalElements: 0,
  totalPages: 0,
  first: true,
  last: true,
});
