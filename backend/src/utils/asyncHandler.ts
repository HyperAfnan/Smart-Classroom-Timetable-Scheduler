const asyncHandler =
  (fn: Function) =>
  async (...args: any) => {
    // eslint-disable-next-line no-useless-catch
    try {
      return await fn(...args);
    } catch (err) {
      throw err;
    }
  };

export default asyncHandler;
