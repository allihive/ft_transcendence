import { GiLaurelsTrophy } from "react-icons/gi";
import { useState, type JSX } from "react"
import { useAuth } from "~/stores/useAuth";
import { toast } from "react-hot-toast";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import { useTournament } from "~/stores/useTournament";
import { JoinTournamentPopover } from "~/components/popups/JoinTournamentPopover";
import type { Tournament, CreateTournamentDto } from "~/api/tournament/types";
import type { User } from "~/api/types";
import { getUserStats } from "~/api/stats/getUserStats";


export function TournamentPage(): JSX.Element {
	const { t } = useTranslation();
	const navigate = useNavigate();
	const [activeTab, setActiveTab] = useState<'create' | 'join'>('create');
	const [newTournamentName, setNewTournamentName] = useState('');
	const [maxParticipants, setMaxParticipants] = useState<number>(8);
	const [bestOf, setBestOf] = useState<number>(3);
	const [showPlayersPopup, setShowPlayersPopup] = useState(false);
	const [selectedTournamentForPlayers, setSelectedTournamentForPlayers] = useState<any>(null);
	const [joinPopupTournamentId, setJoinPopupTournamentId] = useState<string | null>(null);
	
	const { tournaments: availableTournaments, loading, createTournament, joinTournament, startTournament } = useTournament();
	const { user } = useAuth();

	const handleCreateTournament = async () => {
		if (!newTournamentName.trim()) {
			toast.error(t('pleaseEnterTournamentName'));
			return;
		}
		
		if (!user) {
			toast.error(t('mustBeLoggedInToCreate'));
			return;
		}

		try {
			const tournamentData: CreateTournamentDto = {
				name: newTournamentName,
				maxParticipants: maxParticipants,
				bestOf: bestOf
			};

			// Try to fetch user's actual stats from the database
			let userStats = null;
			try {
				userStats = await getUserStats(user.id);
			} catch (error) {
				// User has no stats yet (new user), that's okay
			}

			// Create a proper player object for the creator
			const creatorPlayer = {
				id: user.id,
				email: user.email || `${user.username}@example.com`,
				name: user.name || user.username,
				username: user.username,
				avatarUrl: user.avatarUrl || '/files/default-avatar.png',
				joinedAt: new Date().toISOString(),
				stats: {
					matchesPlayed: userStats?.matchesPlayed || 0,
					matchesWon: userStats?.matchesWon || 0,
					matchesLost: userStats?.matchesLost || 0,
					winRate: userStats?.winRate || 0,
					rating: userStats?.winRate || 50 // Use winRate as rating (0-100%), default 50% for new users
				}
			};

			const creator = user.id || user.username || user.email || 'Unknown';
			const newTournament = await createTournament(tournamentData, creator, creatorPlayer);
			
			toast.success(`${t('tournamentCreated')} "${newTournamentName}"!`);
			setNewTournamentName('');
		} catch (error) {
			console.error('Failed to create tournament:', error);
			toast.error(t('tournamentError.creationFailure'));
		}
	};

	const handleRealUserJoin = async (tournamentId: string, user: User) => {
		try {
			// Tries to fetch user's actual stats from the database
			let userStats = null;
			try {
				userStats = await getUserStats(user.id);
			} catch (error) {
				// User has no stats yet (new user), that's okay
			}
			
			// Convert User to TournamentPlayer format
			const player = {
				id: user.id,
				email: user.email || `${user.username}@example.com`,
				name: user.name || user.username,
				username: user.username,
				avatarUrl: user.avatarUrl || '/files/default-avatar.png',
				joinedAt: new Date().toISOString(),
				// Use actual user stats if available, otherwise use defaults for new users
				stats: {
					matchesPlayed: userStats?.matchesPlayed || 0,
					matchesWon: userStats?.matchesWon || 0,
					matchesLost: userStats?.matchesLost || 0,
					winRate: userStats?.winRate || 0,
					rating: userStats?.winRate || 50 // Use winRate as rating (0-100%), default 50% for new users
				}
			};
			
			// Try to join the tournament with the real user
			const updatedTournament = await joinTournament(tournamentId, player);
			
			if (updatedTournament) {
				toast.success(`${user.username} joined "${updatedTournament.name}"!`);
			} else {
				toast.error(t('tournamentError.failureToJoinReason'));
			}
		} catch (error) {
			console.error('Failed to join tournament:', error);
			toast.error(t('tournamentError.failureToJoin'));
		}
	};

	const handleStartTournament = async (tournamentId: string) => {
		try {
			// csll starttournamentgenerate bracket
			const updatedTournament = await startTournament(tournamentId);
			
			if (updatedTournament) {
				toast.success(t('tournamentStarted', {name: updatedTournament.name}));
				// Navigate to the bracket page
				navigate(`/tournament/${tournamentId}/bracket`);
			} else {
				toast.error(t('tournamentError.failureToStartReason'));
			}
		} catch (error) {
			console.error('Failed to start tournament:', error);
			toast.error(t('tournamentError.failureToStart'));
			toast.error(`${t('tournamentError.creationFailure')}`);
		}
	};

	return (
		<div className="flex flex-col justify-center items-center w-full pb-16">
			<div className="flex items-center justify-center w-full px-8 my-8">
				<div className="flex-grow max-w-xl mx-8 border-t border-black dark:border-white"></div>
				<span className="px-4 text-black dark:text-background font-title">{t('tournaments')}</span>
				<div className="flex-grow max-w-2xl mx-8 border-t border-black dark:border-white"></div>
			</div>

			{/* Tab Navigation. Create, Join and Leaderboard buttons*/}
			<div className="flex space-x-4 mb-8">
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
					onClick={() => setActiveTab('join')}
					className={`px-6 py-3 font-title rounded-lg border-2 border-black ${
						activeTab === 'join' 
							? 'bg-lightOrange text-black' 
							: 'bg-pop text-black hover:bg-lightOrange'
					}`}
				>
					{t('joinTournament')}
				</button>

			</div>

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
								disabled={!newTournamentName.trim() || loading}
								className="px-8 py-3 font-title border-2 border-black bg-lightOrange hover:bg-darkOrange disabled:bg-gray-300 disabled:cursor-not-allowed rounded-lg"
							>
								{loading ? 'Creating...' : t('createTournament')}
							</button>
						</div>
					</div>
				</div>
			)}

			{/* Join Tournament Tab */}
			{activeTab === 'join' && (
				<div className="w-full max-w-4xl">
					<div className="grid gap-6">
						{availableTournaments.length > 0 ? (
							availableTournaments.map((tournament) => (
								<div key={tournament.id} className="bg-pop border-4 border-black rounded-lg p-6">
									<div className="flex justify-between items-start mb-4">
										<div>
											<h3 className="text-xl font-title font-bold">{tournament.name}</h3>
											<p className="text-sm text-gray-600">{t('createdBy')} {tournament.creator}</p>
										</div>
										<div className="text-right">
											<span className="inline-block px-3 py-1 bg-lightOrange text-black text-sm font-bold rounded border-2 border-black">
												{tournament.participants}/{tournament.maxParticipants} {t('players')}
											</span>
										</div>
									</div>
									
									<div className="grid grid-cols-3 gap-4 mb-4 text-sm">
										<div>
											<span className="font-bold">{t('status')}:</span> {tournament.status}
										</div>
										<div>
											<span className="font-bold">{t('bestOf')}:</span> {tournament.bestOf}
										</div>
										<div>
											<span className="font-bold">{t('created')}:</span> {tournament.createdAt}
										</div>
									</div>
									
									<div className="flex justify-between items-center">
										<div className="flex space-x-2">
											<button
												onClick={() => {
													setSelectedTournamentForPlayers(tournament);
													setShowPlayersPopup(true);
												}}
												className="px-4 py-2 bg-gray-300 hover:bg-gray-400 text-black font-title rounded border-2 border-black transition-colors"
											>
												{t('viewPlayers')}
											</button>
											{tournament.players && tournament.players.length > 0 && (
												<div className="text-xs text-gray-600">
													<span className="font-bold">{t('creator')}:</span> {tournament.players[0]?.username} 
													({tournament.players[0]?.stats?.winRate || 0}% {t('winRate')})
												</div>
											)}
										</div>
										
										<div className="flex space-x-2">
											{tournament.status === 'in-progress' && (
												<button
													onClick={() => navigate(`/tournament/${tournament.id}/bracket`)}
													className="px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white font-title rounded border-2 border-black transition-colors"
												>
													{t('viewBracket')}
												</button>
											)}
											
											{tournament.status === 'waiting' && tournament.participants >= tournament.maxParticipants && (
												<button
													onClick={() => handleStartTournament(tournament.id)}
													className="px-6 py-2 bg-green-500 hover:bg-green-600 text-white font-title rounded border-2 border-black transition-colors"
												>
													{t('startTournament')}
												</button>
											)}
										</div>
										{/* Shows Join tournament button and popower only if tournament is not full*/}
										{tournament.participants < tournament.maxParticipants && (
											<JoinTournamentPopover
												isOpen={joinPopupTournamentId === tournament.id}
												onClickOutside={() => setJoinPopupTournamentId(null)}
												onUserJoin={(user) => handleRealUserJoin(tournament.id, user)}
											>
												<button
												onClick={() => setJoinPopupTournamentId(tournament.id)}
												disabled={tournament.status !== 'waiting'}
												className="px-4 py-2 bg-lightOrange hover:bg-darkOrange text-black font-title rounded border-2 border-black transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed"
												>
												{t('joinTournament')}
												</button>
											</JoinTournamentPopover>
											)}
									</div>
								</div>
							))
						) : (
							<div className="text-center py-8">
								<p className="text-black dark:text-background font-body">{t('noAvailableTournaments')}</p>
								<p className="text-sm text-black dark:text-background font-body mt-2">{t('createToStart')}!</p>
							</div>
						)}
					</div>
				</div>
			)}



			{/* Trophy Icon */}
			{(
				<div className="text-darkBlue dark:text-background py-8">
					<GiLaurelsTrophy size={48} />
				</div>
			)}

			{/* Players Popup */}
			{showPlayersPopup && selectedTournamentForPlayers && (
				<div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
					<div className="bg-pop border-4 border-black rounded-lg p-6 max-w-md w-full mx-4 max-h-96 overflow-y-auto">
						<h3 className="text-xl font-title font-bold mb-4 text-center">
							{t('playersIn')} "{selectedTournamentForPlayers.name}"
						</h3>
						
						{selectedTournamentForPlayers.players && selectedTournamentForPlayers.players.length > 0 ? (
							<div className="space-y-3">
								{selectedTournamentForPlayers.players.map((player: any, index: number) => (
									<div key={player.id} className="flex items-center space-x-3 p-3 bg-white rounded border-2 border-black">
										<div className="flex-shrink-0">
											{player.avatarUrl ? (
												<img 
													src={player.avatarUrl} 
													alt={player.name}
													className="w-10 h-10 rounded-full border-2 border-black"
												/>
											) : (
												<div className="w-10 h-10 rounded-full bg-gray-300 border-2 border-black flex items-center justify-center">
													<span className="text-sm font-bold">{player.name.charAt(0)}</span>
												</div>
											)}
										</div>
										<div className="flex-1">
											<div className="font-title font-bold">{player.name}</div>
											<div className="text-sm text-gray-600">@{player.username}</div>
											{player.stats && (
												<div className="text-xs text-blue-600 font-semibold">
													{t('rating')}: {player.stats.rating} | W/L: {player.stats.matchesWon}/{player.stats.matchesLost}
												</div>
											)}
											<div className="text-xs text-gray-500">
												{t('joined')}: {new Date(player.joinedAt).toLocaleDateString()}
											</div>
										</div>
										{index === 0 && (
											<span className="px-2 py-1 bg-yellow-100 text-yellow-800 text-xs font-bold rounded">
												{t('creator')}
											</span>
										)}
									</div>
								))}
							</div>
						) : (
							<p className="text-center text-gray-600">{t('noPlayersJoined')}</p>
						)}

						<div className="mt-6 text-center">
							<button
								onClick={() => {
									setShowPlayersPopup(false);
									setSelectedTournamentForPlayers(null);
								}}
								className="px-6 py-2 bg-gray-300 hover:bg-gray-400 text-black font-title rounded border-2 border-black transition-colors"
							>
								{t('close')}
							</button>
						</div>
					</div>
				</div>
			)}
		</div>
	)
}