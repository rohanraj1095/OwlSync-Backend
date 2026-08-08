const apiResponse = (success, message, data = null) => {
  return {
    success,
    message,
    ...(data && { data }),
  };
};

export default apiResponse;
