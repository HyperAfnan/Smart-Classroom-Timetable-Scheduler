class ApiError extends Error {
	constructor(
		statusCode,
		message = "Something went wrong",
		data,
		errors = [],
		stack = ""
	) {
		super(message);
		this.statusCode = statusCode;
		this.data = data;
		this.message = message;
		this.success = false;
		this.errors = errors;

		if (stack) {
			this.stack = stack;
		} else {
			Error.captureStackTrace(this, this.constructor);
		}
	}
}

class ApiResponse {
	constructor(statuscode, data, message = "success") {
		((this.statuscode = statuscode), (this.data = data));
		((this.message = message), (this.success = statuscode < 400));
	}
}

export { ApiError, ApiResponse };
