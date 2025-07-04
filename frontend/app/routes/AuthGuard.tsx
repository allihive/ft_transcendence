import { useAuth } from "~/stores/useAuth";
import { useNavigate, Outlet, useLocation } from "react-router";
import { useEffect } from "react"
import toast from "react-hot-toast"

export default function ProtectedLayout() {
	const user = useAuth((state) => state.user);
	const location = useLocation();
	const navigate = useNavigate();
	
	useEffect(() => {
		if (!user) {
			console.log("truthy:", user);
			toast.error("Please login to view this page");
			navigate("/login", { replace: true, state: { from: location }});
		}
	}, [user, navigate, location]);
	if (!user) return null;
	return <Outlet />
}