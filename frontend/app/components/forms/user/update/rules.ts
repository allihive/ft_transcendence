import type { RegisterOptions } from "react-hook-form";
import i18n from "~/utils/i18n";
import type { UserUpdateFormValues } from "./types";

const { t } = i18n;

export const getEmailRule = (): RegisterOptions<UserUpdateFormValues, "email"> => ({
	pattern: {
		value: /^[a-zA-Z0-9_.]+@[a-zA-Z0-9_]+\.[a-zA-Z0-9_]+$/,
		message: t('validEmail'),
	}
});

export const getUsernameRule = (): RegisterOptions<UserUpdateFormValues, "username"> => ({
	pattern: {
		value: /^[a-zA-Z0-9_-]+$/,
		message: t("formErrors.usernameRequirements"),
	},
	minLength: {
		value: 6,
		message: t("formErrors.usernameMin"),
	}
});

export const getPasswordRule = (): RegisterOptions<UserUpdateFormValues, "password"> => ({
	required: {
		message: t("formErrors.passwordRequired"),
		value: true,
	},
	pattern: {
		value: /^(?=.*[a-z])(?=.*[A-Z])(?=.*[^a-zA-Z0-9]).+$/,
		message: t("formErrors.passwordRequirements"),
	},
	minLength: {
		value: 6,
		message: t("formErrors.passwordLen"),
	}
});

export const getNewPasswordRule = (): RegisterOptions<UserUpdateFormValues, "newPassword"> => ({
	pattern: {
		value: /^(?=.*[a-z])(?=.*[A-Z])(?=.*[^a-zA-Z0-9]).+$/,
		message: t("formErrors.passwordRequirements"),
	},
	minLength: {
		value: 6,
		message: t("formErrors.passwordLen"),
	}
});

export const getConfirmPasswordRule = (newPassword: string | undefined): RegisterOptions<UserUpdateFormValues, "confirmPassword"> => ({
	validate: (value) => {
		if (newPassword) {
			if (!value) return t("formErrors.confirmPassword");
			if (value !== newPassword) return t("formErrors.mismatchPassword");
		}

		return true;
	}
});
