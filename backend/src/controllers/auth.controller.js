import { authService } from "../services/auth.service.js";
import { logger } from "../utils/logger.utils.js";

/**
 * Authentication controller class
 */
class AuthController {
	/**
	 * Get user by ID
	 * @param {Object} req - Express request object
	 * @param {Object} res - Express response object
	 * @param {Function} next - Express next function
	 */
	async getUserById(req, res, next) {
		try {
			const { userId } = req.params;

			const user = await authService.getUserById(userId);

			res.status(200).json({
				success: true,
				message: "User retrieved successfully",
				data: {
					user: {
						id: user.id,
						email: user.email,
						createdAt: user.created_at,
						updatedAt: user.updated_at,
					},
				},
			});
		} catch (error) {
			logger.error("AuthController.getUserById error:", error.message);
			next(error);
		}
	}

	/**
	 * Register a new user
	 * @param {Object} req - Express request object
	 * @param {Object} res - Express response object
	 * @param {Function} next - Express next function
	 */
	async registerUser(req, res, next) {
		try {
			const { email, password } = req.body;

			const result = await authService.registerUser({
				email,
				password,
			});

			res.status(201).json({
				success: true,
				message: result.message,
				data: {
					user: {
						id: result.user.id,
						email: result.user.email,
						emailConfirmed: result.user.email_confirmed_at !== null,
					},
					session: result.session,
				},
			});
		} catch (error) {
			logger.error("AuthController.registerUser error:", error.message);
			next(error);
		}
	}

	/**
	 * Login user
	 * @param {Object} req - Express request object
	 * @param {Object} res - Express response object
	 * @param {Function} next - Express next function
	 */
	async loginUser(req, res, next) {
		try {
			const { email, password } = req.body;

			const result = await authService.loginUser({ email, password });

			res.status(200).json({
				success: true,
				message: result.message,
				data: {
					user: {
						id: result.user.id,
						email: result.user.email,
					},
					accessToken: result.accessToken,
					refreshToken: result.refreshToken,
				},
			});
		} catch (error) {
			logger.error("AuthController.loginUser error:", error.message);
			next(error);
		}
	}

	/**
	 * Refresh access token
	 * @param {Object} req - Express request object
	 * @param {Object} res - Express response object
	 * @param {Function} next - Express next function
	 */
	async refreshAccessToken(req, res, next) {
		try {
			const { refreshToken } = req.body;

			const result = await authService.refreshAccessToken(refreshToken);

			res.status(200).json({
				success: true,
				message: result.message,
				data: {
					accessToken: result.accessToken,
					user: {
						id: result.user.id,
						email: result.user.email,
					},
				},
			});
		} catch (error) {
			logger.error(
				"AuthController.refreshAccessToken error:",
				error.message
			);
			next(error);
		}
	}

	/**
	 * Logout user
	 * @param {Object} req - Express request object
	 * @param {Object} res - Express response object
	 * @param {Function} next - Express next function
	 */
	async logoutUser(req, res, next) {
		try {
			const result = await authService.logoutUser();

			res.status(200).json({
				success: true,
				message: result.message,
			});
		} catch (error) {
			logger.error("AuthController.logoutUser error:", error.message);
			next(error);
		}
	}

	/**
	 * Get current user profile
	 * @param {Object} req - Express request object
	 * @param {Object} res - Express response object
	 * @param {Function} next - Express next function
	 */
	async getCurrentUser(req, res, next) {
		try {
			const user = req.user;

			res.status(200).json({
				success: true,
				message: "User profile retrieved successfully",
				data: {
					user: {
						id: user.userId,
						email: user.email,
						role: user.role,
					},
				},
			});
		} catch (error) {
			logger.error("AuthController.getCurrentUser error:", error.message);
			next(error);
		}
	}
}

export const authController = new AuthController();
