import { useState, type JSX } from 'react';
import NavItem, { type NavItemProps } from './navItem';
import { AiFillHome } from "react-icons/ai";
import { GoSearch } from "react-icons/go";
import { RiPingPongFill } from "react-icons/ri";
import { GiLaurelsTrophy } from "react-icons/gi";
import { FaUser } from "react-icons/fa6";
import { useNavigate } from "react-router";
import { index } from '@react-router/dev/routes';

type NavBarProps = {
	activeItem: string;
	setActiveItem: (item: string) => void;
}

export function NavBar( { activeItem, setActiveItem }: NavBarProps): JSX.Element {
	const navigate = useNavigate();

	const handleClick = (name: string) => {
		setActiveItem(name);
		if (name === 'home') navigate("/");
		else if (name === 'tournament') navigate("/tournament");
		else if (name === 'user') navigate("/users");
		else if (name === 'play') navigate("/play");
	};

	const navItems = [
		{ name: 'home', icon: AiFillHome},
		{ name: 'tournament', icon: GiLaurelsTrophy},
		{ name: 'play', icon: RiPingPongFill},
		{ name: 'user', icon: FaUser},
		{ name: 'search', icon: GoSearch },

]
	return (
	  <nav className="flex flex-col items-center space-y-6 p-4 h-full">
		{navItems.map((item) => (
		  <NavItem
		  	key={item.name}
			Icon={item.icon}
			isActive={item.name === activeItem}
			onClick={() => handleClick(item.name)}
		  />
		))}
	  </nav>
	);
}
