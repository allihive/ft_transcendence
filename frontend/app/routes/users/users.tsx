import type { Route } from "./+types/home";
import { UsersPage } from "../../pages/users/UsersNewUser";

//check here if new user, then it will go to newUsers page
export default function Users() {
		//if user is logged in return <UserLoggedIn />
		return <UsersPage />;
}
