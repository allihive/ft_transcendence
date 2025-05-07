import type { IconType } from "react-icons";

export interface NavItemProps {
	isActive: boolean;
	onClick: () => void;
	Icon: IconType;
}

const NavItem: React.FC<NavItemProps> = ({isActive, onClick, Icon }) => {

	return (
		<button onClick={onClick} className="transition-transform hover:scale-110">
		<Icon className={`w-10 h-10 fill-current
			${isActive ? 'text-lightOrange dark:text-pop' : 'text-darkBlue dark:text-lightOrange'}
			`} /> 
		</button>
	)
}

export default NavItem;
