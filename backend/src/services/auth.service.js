import {
	getSupabaseClient,
	getSupabaseAdminClient,
} from "../config/supabase.config.js";
import { logger } from "../utils/logger.utils.js";
import jwt from "jsonwebtoken";
import { env } from "../config/env.config.js";

/**
 * Authentication service class for handling user authentication operations
 */
class AuthService {
	constructor() {
		this.client = getSupabaseClient();
		this.adminClient = getSupabaseAdminClient();
	}

	/**
	 * Get user by ID from Supabase
	 * @param {string} userId - The user ID
	 * @returns {Promise<Object>} User data
	 */
	async getUserById(userId) {
		try {
			const { data, error } = await this.client
				.from("users")
				.select("*")
				.eq("id", userId)
				.single();

			if (error) {
				logger.error("Error fetching user by ID:", error.message);
				throw new Error("User not found");
			}

			return data;
		} catch (error) {
			logger.error("AuthService.getUserById error:", error.message);
			throw error;
		}
	}

	/**
	 * Register a new user
	 * @param {Object} userData - User registration data
	 * @param {string} userData.email - User email
	 * @param {string} userData.password - User password
	 * @returns {Promise<Object>} Registration result
	 */
	async registerUser(userData) {
		try {
			const { email, password } = userData;

			const { data, error } = await this.client.auth.signUp({
				email,
				password,
			});

			if (error) {
				logger.error("Error registering user:", error.message);
				throw new Error(error.message);
			}

			logger.info("User registered successfully:", data.user?.email);
			return {
				user: data.user,
				session: data.session,
				message: "User registered successfully",
			};
		} catch (error) {
			logger.error("AuthService.registerUser error:", error.message);
			throw error;
		}
	}

	/**
	 * Login user with email and password
	 * @param {Object} credentials - Login credentials
	 * @param {string} credentials.email - User email
	 * @param {string} credentials.password - User password
	 * @returns {Promise<Object>} Login result with tokens
	 */
	async loginUser(credentials) {
		try {
			const { email, password } = credentials;

			const { data, error } = await this.client.auth.signInWithPassword({
				email,
				password,
			});

			if (error) {
				logger.error("Error logging in user:", error.message);
				throw new Error("Invalid credentials");
			}

			const accessToken = this.generateAccessToken(data.user);
			const refreshToken = this.generateRefreshToken(data.user);

			logger.info("User logged in successfully:", data.user.email);
			return {
				user: data.user,
				accessToken,
				refreshToken,
				message: "Login successful",
			};
		} catch (error) {
			logger.error("AuthService.loginUser error:", error.message);
			throw error;
		}
	}

	/**
	 * Refresh access token using refresh token
	 * @param {string} refreshToken - The refresh token
	 * @returns {Promise<Object>} New access token
	 */
	async refreshAccessToken(refreshToken) {
		try {
			const { data, error } = await this.client.auth.refreshSession({
				refresh_token: refreshToken,
			});

			if (error) {
				logger.error("Error refreshing token:", error.message);
				throw new Error("Invalid refresh token");
			}

			const newAccessToken = this.generateAccessToken(data.user);

			logger.info(
				"Token refreshed successfully for user:",
				data.user.email
			);
			return {
				accessToken: newAccessToken,
				user: data.user,
				message: "Token refreshed successfully",
			};
		} catch (error) {
			logger.error(
				"AuthService.refreshAccessToken error:",
				error.message
			);
			throw error;
		}
	}

	/**
	 * Logout user
	 * @returns {Promise<Object>} Logout result
	 */
	async logoutUser() {
		try {
			const { error } = await this.client.auth.signOut();

			if (error) {
				logger.error("Error logging out user:", error.message);
				throw new Error("Logout failed");
			}

			logger.info("User logged out successfully");
			return {
				message: "Logout successful",
			};
		} catch (error) {
			logger.error("AuthService.logoutUser error:", error.message);
			throw error;
		}
	}

	/**
	 * Generate JWT access token
	 * @param {Object} user - User object
	 * @returns {string} JWT access token
	 */
	generateAccessToken(user) {
		return jwt.sign(
			{
				userId: user.id,
				email: user.email,
				role: user.role || "user",
			},
			env.JWT_SECRET,
			{
				expiresIn: env.JWT_EXPIRATION,
			}
		);
	}

	/**
	 * Generate JWT refresh token
	 * @param {Object} user - User object
	 * @returns {string} JWT refresh token
	 */
	generateRefreshToken(user) {
		return jwt.sign(
			{
				userId: user.id,
				type: "refresh",
			},
			env.JWT_SECRET,
			{
				expiresIn: "7d",
			}
		);
	}

	/**
	 * Verify JWT token
	 * @param {string} token - JWT token to verify
	 * @returns {Object} Decoded token payload
	 */
	verifyToken(token) {
		try {
			return jwt.verify(token, env.JWT_SECRET);
		} catch (error) {
			logger.error("Token verification failed:", error.message);
			throw new Error("Invalid token");
		}
	}
}

export const authService = new AuthService();
