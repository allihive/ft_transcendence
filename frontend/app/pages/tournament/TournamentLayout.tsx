import { GiLaurelsTrophy } from "react-icons/gi";
import { useState, type JSX } from "react"
import { useAuth } from "~/stores/useAuth";
import { toast } from "react-hot-toast";
import { useTranslation } from "react-i18next";

interface Tournament {
	id: string;
	name: string;
	creator: string;
	participants: number;
	maxParticipants: number;
	bestOf: number;
	status: 'waiting' | 'in-progress' | 'completed';
	createdAt: string;
}

export function TournamentPage(): JSX.Element {
	const { t } = useTranslation();
	const { user } = useAuth();
	const [activeTab, setActiveTab] = useState<'join' | 'create' | 'leaderboard'>('join');
	const [newTournamentName, setNewTournamentName] = useState('');
	const [selectedTournament, setSelectedTournament] = useState<string>('');
	const [maxParticipants, setMaxParticipants] = useState<number>(8);
	const [bestOf, setBestOf] = useState<number>(3);

	// Empty tournaments list - you can add your own tournaments here
	const availableTournaments: Tournament[] = [];

	const handleCreateTournament = () => {
		if (!newTournamentName.trim()) {
			toast.error(t('pleaseEnterTournamentName'));
			return;
		}
		
		if (!user) {
			toast.error(t('mustBeLoggedInToCreate'));
			return;
		}

		// Mock tournament creation
		const newTournament: Tournament = {
			id: Date.now().toString(),
			name: newTournamentName,
			creator: user.name || user.username || user.email || 'Unknown',
			participants: 1,
			maxParticipants: maxParticipants,
			bestOf: bestOf,
			status: 'waiting',
			createdAt: new Date().toISOString().split('T')[0]
		};

		toast.success(`${t('tournamentCreated')} "${newTournamentName}"!`);
		setNewTournamentName('');
		console.log('Created tournament:', newTournament);
	};

	const handleJoinTournament = () => {
		if (!selectedTournament) {
			toast.error(t('pleaseSelectTournament'));
			return;
		}

		if (!user) {
			toast.error(t('mustBeLoggedInToJoin'));
			return;
		}

		const tournament = availableTournaments.find(t => t.id === selectedTournament);
		if (tournament) {
			toast.success(`${t('joinedTournament')} "${tournament.name}"!`);
			console.log('Joined tournament:', tournament);
		}
	};

	return (
		<div className="flex flex-col justify-center items-center w-full pb-16">
			<div className="flex items-center justify-center w-full px-8 my-8">
				<div className="flex-grow max-w-xl mx-8 border-t border-black dark:border-white"></div>
				<span className="px-4 text-black dark:text-background font-title">{t('tournaments')}</span>
				<div className="flex-grow max-w-2xl mx-8 border-t border-black dark:border-white"></div>
			</div>

			{/* Tab Navigation */}
			<div className="flex space-x-4 mb-8">
				<button
					onClick={() => setActiveTab('join')}
					className={`px-6 py-3 font-title rounded-lg border-2 border-black ${
						activeTab === 'join' 
							? 'bg-lightOrange text-black' 
							: 'bg-pop text-black hover:bg-lightOrange'
					}`}
				>
					{t('joinTournament')}
				</button>
				<button
					onClick={() => setActiveTab('create')}
					className={`px-6 py-3 font-title rounded-lg border-2 border-black ${
						activeTab === 'create' 
							? 'bg-lightOrange text-black' 
							: 'bg-pop text-black hover:bg-lightOrange'
					}`}
				>
					{t('createTournament')}
				</button>
				<button
					onClick={() => setActiveTab('leaderboard')}
					className={`px-6 py-3 font-title rounded-lg border-2 border-black ${
						activeTab === 'leaderboard' 
							? 'bg-lightOrange text-black' 
							: 'bg-pop text-black hover:bg-lightOrange'
					}`}
				>
					{t('leaderboard')}
				</button>
			</div>

			{/* Join Tournament Tab */}
			{activeTab === 'join' && (
				<div className="w-[800px] bg-pop border-4 border-black rounded-lg shadow-md p-6">
					<h2 className="text-2xl font-title font-bold mb-6 text-center">{t('availableTournaments')}</h2>
					
					{availableTournaments.length === 0 ? (
						<div className="text-center py-8">
							<p className="text-gray-600">{t('noTournamentsAvailable')}</p>
							<p className="text-sm text-gray-500 mt-2">{t('createNewTournamentToStart')}</p>
						</div>
					) : (
						<div className="space-y-4">
							{availableTournaments.map((tournament) => (
								<div
									key={tournament.id}
									className={`p-4 border-2 rounded-lg cursor-pointer transition-colors ${
										selectedTournament === tournament.id
											? 'border-darkOrange bg-lightOrange'
											: 'border-black bg-white hover:bg-gray-50'
									}`}
									onClick={() => setSelectedTournament(tournament.id)}
								>
									<div className="flex justify-between items-center">
										<div className="flex-1">
											<h3 className="font-title font-bold text-lg">{tournament.name}</h3>
											<p className="text-sm text-gray-600">{t('createdBy')} {tournament.creator}</p>
											<p className="text-sm text-gray-600">
												{tournament.participants}/{tournament.maxParticipants} {t('participants')}
											</p>
										</div>
										<div className="text-right">
											<span className={`px-3 py-1 rounded-full text-xs font-bold ${
												tournament.status === 'waiting' 
													? 'bg-green-100 text-green-800' 
													: tournament.status === 'in-progress'
													? 'bg-yellow-100 text-yellow-800'
													: 'bg-gray-100 text-gray-800'
											}`}>
												{tournament.status}
											</span>
										</div>
									</div>
								</div>
							))}
						</div>
					)}

					<div className="mt-6 text-center">
						<button
							onClick={handleJoinTournament}
							disabled={!selectedTournament}
							className="px-8 py-3 font-title border-2 border-black bg-lightOrange hover:bg-darkOrange disabled:bg-gray-300 disabled:cursor-not-allowed rounded-lg"
						>
							{t('joinSelectedTournament')}
						</button>
					</div>
				</div>
			)}

			{/* Create Tournament Tab */}
			{activeTab === 'create' && (
				<div className="w-[600px] bg-pop border-4 border-black rounded-lg shadow-md p-6">
					<h2 className="text-2xl font-title font-bold mb-6 text-center">{t('createNewTournament')}</h2>
					
					<div className="space-y-4">
						<div>
							<label className="block font-title font-bold mb-2">{t('tournamentName')}</label>
							<input
								type="text"
								value={newTournamentName}
								onChange={(e) => setNewTournamentName(e.target.value)}
								placeholder={t('enterTournamentName')}
								className="w-full p-3 border-2 border-black rounded-lg font-title focus:outline-none focus:border-darkOrange"
							/>
						</div>

						<div className="grid grid-cols-2 gap-4">
							<div>
								<label className="block font-title font-bold mb-2">{t('maxParticipants')}</label>
								<select
									value={maxParticipants}
									onChange={(e) => setMaxParticipants(Number(e.target.value))}
									className="w-full p-3 border-2 border-black rounded-lg font-title focus:outline-none focus:border-darkOrange"
								>
									<option value={4}>4 {t('players')}</option>
									<option value={8}>8 {t('players')}</option>
									<option value={16}>16 {t('players')}</option>
								</select>
							</div>
							<div>
								<label className="block font-title font-bold mb-2">{t('bestOf')}</label>
								<select
									value={bestOf}
									onChange={(e) => setBestOf(Number(e.target.value))}
									className="w-full p-3 border-2 border-black rounded-lg font-title focus:outline-none focus:border-darkOrange"
								>
									<option value={1}>1</option>
									<option value={3}>3</option>
									<option value={5}>5</option>
								</select>
							</div>
						</div>

						<div className="bg-gray-100 p-4 rounded-lg">
							<h3 className="font-title font-bold mb-2">{t('tournamentSettings')}</h3>
							<ul className="text-sm space-y-1">
								<li>• {t('maximum')} {maxParticipants} {t('participants')}</li>
								<li>• {t('singleEliminationBracket')}</li>
								<li>• {t('bestOf')} {bestOf} {t('matches')}</li>
								<li>• {t('automaticMatchmaking')}</li>
							</ul>
						</div>

						<div className="text-center mt-6">
							<button
								onClick={handleCreateTournament}
								disabled={!newTournamentName.trim()}
								className="px-8 py-3 font-title border-2 border-black bg-lightOrange hover:bg-darkOrange disabled:bg-gray-300 disabled:cursor-not-allowed rounded-lg"
							>
								{t('createTournament')}
							</button>
						</div>
					</div>
				</div>
			)}

			{/* Leaderboard Tab */}
			{activeTab === 'leaderboard' && (
				<div className="w-full max-w-4xl">
					<div className="w-[600px] h-[250px] relative bg-pop border-4 border-black rounded-4xl shadow-md mx-auto mb-8">
						<div className="flex flex-col font-title items-center text-2xl justify-between h-full py-4">
							<span className="py-4">{t('yourRank')}</span>
							<span className="text-darkOrange ">4000</span>
							<div className="flex flex-row space-x-4">
								<span className="text-darkBlue">80th</span>
								<span>{t('percentile')}</span>
							</div>
						</div>
					</div>

					<div className="text-darkBlue dark:text-background py-12">
						<GiLaurelsTrophy size={56} />
					</div>
					<table className="table-auto mx-auto border-darkOrange bg-lightOrange rounded-xl">
						<thead>
							<tr>
								<th className="font-title text-darkOrange px-12 py-8 text-left ">{t('rank')}</th>
								<th className="font-title text-darkOrange px-12 py-8 text-left ">{t('player')}</th>
								<th className="font-title text-darkOrange px-12 py-8 text-left ">{t('name')}</th>
								<th className="font-title text-darkOrange px-12 py-8 text-left ">{t('score')}</th>
							</tr>
						</thead>
						<tbody>
							<tr className="font-title">
								<td className="px-12 py-4 text-center">1</td>
								<td className="px-12 py-4 text-center">SuminK</td>
								<td className="px-12 py-4 text-center">Sumin</td>
								<td className="px-12 py-4 text-center">500</td>
							</tr>
							<tr className="font-title">
								<td className="px-12 py-8 text-center">2</td>
								<td className="px-12 py-8 text-center">HoangT</td>
								<td className="px-12 py-8 text-center">Hoang</td>
								<td className="px-12 py-8 text-center">300</td>
							</tr>
							<tr className="font-title">
								<td className="px-12 py-8 text-center">3</td>
								<td className="px-12 py-8 text-center">TimoS</td>
								<td className="px-12 py-8 text-center">Timo</td>
								<td className="px-12 py-8 text-center">200</td>
							</tr>
							<tr className="font-title">
								<td className="px-12 py-8 text-center">4</td>
								<td className="px-12 py-8 text-center">JosephL</td>
								<td className="px-12 py-8 text-center">Joseph</td>
								<td className="px-12 py-8 text-center">100</td>
							</tr>
							<tr className="font-title">
								<td className="px-12 py-8 text-center">5</td>
								<td className="px-12 py-8 text-center">AliceL</td>
								<td className="px-12 py-8 text-center">Alice</td>
								<td className="px-12 py-8 text-center">65</td>
							</tr>
						</tbody>
					</table>
				</div>
			)}

			{/* Trophy Icon for other tabs */}
			{activeTab !== 'leaderboard' && (
				<div className="text-darkBlue dark:text-background py-8">
					<GiLaurelsTrophy size={48} />
				</div>
			)}
		</div>
	)
}