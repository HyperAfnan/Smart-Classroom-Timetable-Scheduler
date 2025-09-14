import { body, param, validationResult } from "express-validator";

/**
 * Validation middleware to check for validation errors
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next function
 */
export const handleValidationErrors = (req, res, next) => {
	const errors = validationResult(req);
	if (!errors.isEmpty()) {
		return res.status(400).json({
			success: false,
			message: "Validation failed",
			errors: errors.array().map((error) => ({
				field: error.path,
				message: error.msg,
				value: error.value,
			})),
		});
	}
	next();
};

/**
 * Validation rules for user registration
 */
export const validateRegisterUser = [
	body("email").isEmail().withMessage("Please provide a valid email address"),
	body("password")
		.notEmpty()
		.withMessage("Password is required")
		.isLength({ min: 1 })
		.withMessage("Password cannot be empty"),
	handleValidationErrors,
];

/**
 * Validation rules for user login
 */
export const validateLoginUser = [
	body("email")
		.isEmail()
		.withMessage("Please provide a valid email address")
		.normalizeEmail()
		.withMessage("Invalid email format"),
	body("password")
		.notEmpty()
		.withMessage("Password is required")
		.isLength({ min: 1 })
		.withMessage("Password cannot be empty"),
	handleValidationErrors,
];

/**
 * Validation rules for refresh token
 */
export const validateRefreshToken = [
	body("refreshToken")
		.notEmpty()
		.withMessage("Refresh token is required")
		.isJWT()
		.withMessage("Invalid refresh token format"),
	handleValidationErrors,
];

/**
 * Validation rules for logout
 */
export const validateLogout = [
	body("refreshToken")
		.notEmpty()
		.withMessage("Refresh token is required")
		.isJWT()
		.withMessage("Invalid refresh token format"),
	handleValidationErrors,
];

/**
 * Validation rules for user ID parameter
 */
export const validateUserId = [
	param("userId")
		.isUUID()
		.withMessage("Invalid user ID format")
		.notEmpty()
		.withMessage("User ID is required"),
	handleValidationErrors,
];
