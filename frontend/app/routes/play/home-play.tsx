import { useTranslation } from "react-i18next";
import { NavLink } from "react-router";

const linkStyles = "p-2 border-2 border-black bg-lightOrange hover:bg-darkOrange text-center rounded-lg";

export default function Play() {
	const { t } = useTranslation();

	return (
		<>
			<div className="flex items-center justify-center w-full px-8 my-8">
				<div className="flex-grow max-w-xl mx-8 border-t border-black dark:border-white"></div>
				<span className="px-4 text-black dark:text-background font-title">{t("playerMode")}</span>
				<div className="flex-grow max-w-2xl mx-8 border-t border-black dark:border-white"></div>
			</div>
			<div className="grid auto-rows-auto grid-cols-[max-content] gap-y-6 mt-8 mx-auto font-title">
				<NavLink to="/play/two-players" className={linkStyles}>
					2 {t("players")}
				</NavLink>
				<NavLink to="/tournament" className={linkStyles}>
					{t("joinTournament")}
				</NavLink>
			</div>
		</>
	)
}