import type { FormEvent } from "react";
import type { User } from "~/api/types";

export type CredentialsFormValues = {
	email: string;
	password: string;
};

export type CredentialsFormData = {
	email: string;
	password: string;
};

export type SubmitHandler = (data: CredentialsFormData, event?: FormEvent<HTMLFormElement>) => void;

export type CredentialsFormProps = {
	onSumit: SubmitHandler;
	disabled: boolean;
};

export type TotpSubmitHandler = (toptCode: string, event?: FormEvent<HTMLFormElement>) => void;

export type TotpFormProps = {
	onSubmit: TotpSubmitHandler;
	submitTitle: string;
	disabled: boolean;
};

export type SuccessHandler = (user: User | null) => void;
export type FailureHandler = (error: Error) => void;
export type SubmitStateChangeHandler = (isSubmitting: boolean) => void;

export type UserLoginFormProps = {
	onSuccess: SuccessHandler;
	onFailure: FailureHandler;
	onSubmitStateChange?: SubmitStateChangeHandler;
};

export type UserVerificationFormProps = {
	onSuccess: SuccessHandler;
	onFailure: FailureHandler;
	onSubmitStateChange?: SubmitStateChangeHandler;
};

