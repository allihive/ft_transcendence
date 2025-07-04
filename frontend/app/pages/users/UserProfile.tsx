import { type JSX, useState } from "react";
import { UpdateForm } from "~/components/forms/login/UpdateUserForm";

import type { LoginFormProps } from "~/components/forms/login/types";
import { useAuth } from "~/stores/useAuth"


export function UsersProfile(props: LoginFormProps): JSX.Element {
	
	const setUser = useAuth((state) => state.setUser);
	const user = useAuth((state) => state.user);

	return (
		<UpdateForm onSuccess={(user) => {setUser(user)}} />
	)
}
