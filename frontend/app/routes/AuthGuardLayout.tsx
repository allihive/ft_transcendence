import { type JSX } from "react";
import { Navigate, Outlet } from "react-router";
import { useAuth } from "~/stores/useAuth";

export default function AuthGuardLayout(): JSX.Element {
	const user = useAuth((state) => state.user);

	if (!user) {
		return <Navigate to="/login" replace />
	}

	return <Outlet />
}
