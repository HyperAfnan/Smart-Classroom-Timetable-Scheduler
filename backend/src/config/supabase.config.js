import { createClient } from "@supabase/supabase-js";
import { env } from "./env.config.js";
import { logger } from "../utils/logger.utils.js";

let supabaseClient = null;
let supabaseAdminClient = null;

const supabaseConfig = {
	url: env.SUPABASE_URL,
	anonKey: env.SUPABASE_ANON_KEY,
	serviceRoleKey: env.SUPABASE_SERVICE_ROLE_KEY,
};

const createSupabaseClient = () => {
	if (!supabaseClient) {
		supabaseClient = createClient(
			supabaseConfig.url,
			supabaseConfig.anonKey,
			{
				auth: {
					persistSession: false,
					autoRefreshToken: false,
				},
			}
		);
		logger.info("Supabase client initialized");
	}
	return supabaseClient;
};

const createSupabaseAdminClient = () => {
	if (!supabaseAdminClient) {
		supabaseAdminClient = createClient(
			supabaseConfig.url,
			supabaseConfig.serviceRoleKey,
			{
				auth: {
					persistSession: false,
					autoRefreshToken: false,
				},
			}
		);
		logger.info("Supabase admin client initialized");
	}
	return supabaseAdminClient;
};

const testConnection = async () => {
	try {
		const client = createSupabaseClient();
		const { error } = await client.from("users").select("*").limit(1);

		if (error) {
			logger.warn("Supabase connection test failed:", error.message);
			return false;
		}

		logger.info("Supabase connection test successful");
		return true;
	} catch (error) {
		logger.error("Supabase connection test error:", error.message);
		return false;
	}
};

const getSupabaseClient = () => {
	if (!supabaseClient) {
		createSupabaseClient();
	}
	return supabaseClient;
};

const getSupabaseAdminClient = () => {
	if (!supabaseAdminClient) {
		createSupabaseAdminClient();
	}
	return supabaseAdminClient;
};

const initializeSupabase = async () => {
	try {
		createSupabaseClient();
		createSupabaseAdminClient();

		const isConnected = await testConnection();
		if (!isConnected) {
			logger.warn(
				"Supabase initialization completed but connection test failed"
			);
		}

		return {
			client: getSupabaseClient(),
			adminClient: getSupabaseAdminClient(),
			isConnected,
		};
	} catch (error) {
		logger.error("Failed to initialize Supabase:", error.message);
		throw error;
	}
};

export {
	createSupabaseClient,
	createSupabaseAdminClient,
	getSupabaseClient,
	getSupabaseAdminClient,
	testConnection,
	initializeSupabase,
	supabaseConfig,
};
