import { authService } from "../services/auth.service.js";
import { logger } from "../utils/logger.utils.js";

/**
 * Authentication middleware to verify JWT tokens
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next function
 */
export const authenticateToken = async (req, res, next) => {
	try {
		const authHeader = req.headers["authorization"];
		const token = authHeader && authHeader.split(" ")[1];

		if (!token) {
			return res.status(401).json({
				success: false,
				message: "Access token is required",
			});
		}

		const decoded = authService.verifyToken(token);
		req.user = decoded;

		next();
	} catch (error) {
		logger.error("Authentication middleware error:", error.message);
		return res.status(401).json({
			success: false,
			message: "Invalid or expired token",
		});
	}
};

/**
 * Optional authentication middleware - doesn't fail if no token
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next function
 */
export const optionalAuth = async (req, res, next) => {
	try {
		const authHeader = req.headers["authorization"];
		const token = authHeader && authHeader.split(" ")[1];

		if (token) {
			const decoded = authService.verifyToken(token);
			req.user = decoded;
		}

		next();
	} catch (error) {
		logger.warn("Optional authentication failed:", error.message);
		next();
	}
};

