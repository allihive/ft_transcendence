import { useTranslation } from 'react-i18next';
import BabylonScene from '../../game/BabylonScene'
import { type JSX } from 'react' 

const player1 = { id: 'player1_id', username: 'Alice' };
const player2 = { id: 'player2_id', username: 'Timo' };

export function TwoPlayer(): JSX.Element {
	const { t } = useTranslation();
	return (
		<>
			<h1 className="flex flex-col font-title justify-center items-center mt-10">2 {t('playerMode')}</h1>
			<div className="flex flex-col font-title justify-center items-center mt-10 text-black dark:text-background text-sm">
				{t('playInstructions')}</div>
			<BabylonScene player1={player1} player2={player2}/>
		</>
	)
}