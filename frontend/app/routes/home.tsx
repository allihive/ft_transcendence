import { NavLink } from "react-router";
import { CreditsBanner } from "~/components/credits-banner/CreditsBanner";
import { useTranslation } from "react-i18next";

export default function Home() {
	const {t} = useTranslation();
	return (
		<div className="flex flex-col justify-center items-center w-full pb-16 pt-8">
			<div className="w-[600px] h-[450px] relative bg-pop border-4 border-black rounded-md shadow-md justify-center items-center pb-16 space-y-4">
				<div className="absolute top-[75%] left-1/2 transform -translate-x-1/2 -translate-y-1/2 flex flex-col items-center space-y-4">
					<NavLink to="/play" className="text-black text-center pt-4 pb-4 px-6 text-2xl font-title border-2 border-black rounded-lg">{t('play')}</NavLink>
					<NavLink to="/login" className="text-black text-center pt-4 pb-4 px-6 text-2xl font-title border-2 border-black rounded-lg">{t('login')}</NavLink>
				</div>
			</div>
				<CreditsBanner />
		</div>
	);
}
