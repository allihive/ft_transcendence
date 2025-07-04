// import type { Route } from "./+types/home";
import { RegisterForm } from "~/components/forms/register/RegisterForm";
import { NewUsersPage } from "../pages/users/UsersNewUser";

//check here if new user, then it will go to newUsers page
export default function Register() {
	return <RegisterForm />
	// return <NewUsersPage />;
}
