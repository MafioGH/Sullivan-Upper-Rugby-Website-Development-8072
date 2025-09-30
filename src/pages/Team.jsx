import React,{useState,useCallback,useMemo} from 'react';
import {motion} from 'framer-motion';
import * as FiIcons from 'react-icons/fi';
import SafeIcon from '../common/SafeIcon';
import {useSupabaseData} from '../hooks/useSupabaseData';
import ProtectedPage from '../components/ProtectedPage';

const {FiUser,FiPlus,FiEdit2,FiTrash2,FiAward,FiTarget,FiUsers,FiSave,FiX,FiBookOpen,FiClock,FiMail,FiPhone}=FiIcons;

const Team=()=> {
const {data: players,loading: playersLoading,error: playersError,addItem: addPlayer,updateItem: updatePlayer,deleteItem: deletePlayer}=useSupabaseData('players');
const {data: coaches,loading: coachesLoading,error: coachesError,addItem: addCoach,updateItem: updateCoach,deleteItem: deleteCoach}=useSupabaseData('coaches');

const [activeTab,setActiveTab]=useState('players');
const [showAddForm,setShowAddForm]=useState(false);
const [editingPlayer,setEditingPlayer]=useState(null);
const [editingCoach,setEditingCoach]=useState(null);

// 🔧 FIXED: Individual player state hooks to prevent object re-rendering
const [playerName,setPlayerName]=useState('');
const [playerPosition,setPlayerPosition]=useState('');
const [playerNumber,setPlayerNumber]=useState('');
const [playerAge,setPlayerAge]=useState('');
const [playerHeight,setPlayerHeight]=useState('');
const [playerWeight,setPlayerWeight]=useState('');
const [playerPhoto,setPlayerPhoto]=useState('');
const [playerCaptain,setPlayerCaptain]=useState(false);

// 🔧 FIXED: Individual player stats state hooks
const [playerTries,setPlayerTries]=useState(0);
const [playerConversions,setPlayerConversions]=useState(0);
const [playerPenalties,setPlayerPenalties]=useState(0);
const [playerTackles,setPlayerTackles]=useState(0);
const [playerLineouts,setPlayerLineouts]=useState(0);
const [playerAppearances,setPlayerAppearances]=useState(0);

// 🔧 FIXED: Individual coach state hooks to prevent object re-rendering
const [coachName,setCoachName]=useState('');
const [coachRole,setCoachRole]=useState('');
const [coachQualifications,setCoachQualifications]=useState('');
const [coachExperience,setCoachExperience]=useState('');
const [coachPhone,setCoachPhone]=useState('');
const [coachEmail,setCoachEmail]=useState('');
const [coachPhoto,setCoachPhoto]=useState('');
const [coachBio,setCoachBio]=useState('');
const [coachHeadCoach,setCoachHeadCoach]=useState(false);

// 🔧 FIXED: Memoized constants to prevent re-creation on every render
const positions=useMemo(()=> [
'Prop','Hooker','Lock','Flanker','Number 8','Scrum-Half','Fly-Half','Centre','Wing','Full-Back'
],[]);

const coachingRoles=useMemo(()=> [
'Head Coach','Assistant Coach','Forwards Coach','Backs Coach','Skills Coach','Fitness Coach','Team Manager','Physiotherapist','Kit Manager'
],[]);

// 🔧 FIXED: Stable form handlers
const handleAddPlayer=useCallback(async (e)=> {
e.preventDefault();
const playerData={
name: playerName,
position: playerPosition,
number: playerNumber ? parseInt(playerNumber) : null,
age: playerAge ? parseInt(playerAge) : null,
height: playerHeight,
weight: playerWeight,
photo: playerPhoto,
captain: playerCaptain,
stats: {
tries: parseInt(playerTries) || 0,
conversions: parseInt(playerConversions) || 0,
penalties: parseInt(playerPenalties) || 0,
tackles: parseInt(playerTackles) || 0,
lineouts: parseInt(playerLineouts) || 0,
appearances: parseInt(playerAppearances) || 0
}
};

try {
await addPlayer(playerData);
// Reset all individual form fields
setPlayerName('');
setPlayerPosition('');
setPlayerNumber('');
setPlayerAge('');
setPlayerHeight('');
setPlayerWeight('');
setPlayerPhoto('');
setPlayerCaptain(false);
setPlayerTries(0);
setPlayerConversions(0);
setPlayerPenalties(0);
setPlayerTackles(0);
setPlayerLineouts(0);
setPlayerAppearances(0);
setShowAddForm(false);
} catch (error) {
console.error("Error adding player:",error);
alert("Failed to add player. Please try again.");
}
},[playerName,playerPosition,playerNumber,playerAge,playerHeight,playerWeight,playerPhoto,playerCaptain,playerTries,playerConversions,playerPenalties,playerTackles,playerLineouts,playerAppearances,addPlayer]);

const handleEditPlayer=useCallback((player)=> {
setEditingPlayer(player.id);
setPlayerName(player.name);
setPlayerPosition(player.position);
setPlayerNumber(player.number ? player.number.toString() : '');
setPlayerAge(player.age ? player.age.toString() : '');
setPlayerHeight(player.height || '');
setPlayerWeight(player.weight || '');
setPlayerPhoto(player.photo);
setPlayerCaptain(player.captain);
setPlayerTries(player.stats?.tries || 0);
setPlayerConversions(player.stats?.conversions || 0);
setPlayerPenalties(player.stats?.penalties || 0);
setPlayerTackles(player.stats?.tackles || 0);
setPlayerLineouts(player.stats?.lineouts || 0);
setPlayerAppearances(player.stats?.appearances || 0);
},[]);

const handleUpdatePlayer=useCallback(async (e)=> {
e.preventDefault();
const updateData={
name: playerName,
position: playerPosition,
number: playerNumber ? parseInt(playerNumber) : null,
age: playerAge ? parseInt(playerAge) : null,
height: playerHeight,
weight: playerWeight,
photo: playerPhoto,
captain: playerCaptain,
stats: {
tries: parseInt(playerTries) || 0,
conversions: parseInt(playerConversions) || 0,
penalties: parseInt(playerPenalties) || 0,
tackles: parseInt(playerTackles) || 0,
lineouts: parseInt(playerLineouts) || 0,
appearances: parseInt(playerAppearances) || 0
}
};

try {
await updatePlayer(editingPlayer,updateData);
setEditingPlayer(null);
// Reset all individual form fields
setPlayerName('');
setPlayerPosition('');
setPlayerNumber('');
setPlayerAge('');
setPlayerHeight('');
setPlayerWeight('');
setPlayerPhoto('');
setPlayerCaptain(false);
setPlayerTries(0);
setPlayerConversions(0);
setPlayerPenalties(0);
setPlayerTackles(0);
setPlayerLineouts(0);
setPlayerAppearances(0);
} catch (error) {
console.error("Error updating player:",error);
alert("Failed to update player. Please try again.");
}
},[editingPlayer,playerName,playerPosition,playerNumber,playerAge,playerHeight,playerWeight,playerPhoto,playerCaptain,playerTries,playerConversions,playerPenalties,playerTackles,playerLineouts,playerAppearances,updatePlayer]);

const handleDeletePlayer=useCallback(async (id,name)=> {
if (window.confirm(`Are you sure you want to delete ${name}? This action cannot be undone.`)) {
try {
await deletePlayer(id);
} catch (error) {
console.error("Error deleting player:",error);
alert("Failed to delete player. Please try again.");
}
}
},[deletePlayer]);

// 🔧 FIXED: Coach handlers with individual state
const handleAddCoach=useCallback(async (e)=> {
e.preventDefault();
const coachData={
name: coachName,
role: coachRole,
qualifications: coachQualifications,
experience: coachExperience,
phone: coachPhone,
email: coachEmail,
photo: coachPhoto,
bio: coachBio,
headCoach: coachHeadCoach
};

try {
await addCoach(coachData);
// Reset all individual coach fields
setCoachName('');
setCoachRole('');
setCoachQualifications('');
setCoachExperience('');
setCoachPhone('');
setCoachEmail('');
setCoachPhoto('');
setCoachBio('');
setCoachHeadCoach(false);
setShowAddForm(false);
} catch (error) {
console.error("Error adding coach:",error);
alert("Failed to add coach. Please try again.");
}
},[coachName,coachRole,coachQualifications,coachExperience,coachPhone,coachEmail,coachPhoto,coachBio,coachHeadCoach,addCoach]);

const handleEditCoach=useCallback((coach)=> {
setEditingCoach(coach.id);
setCoachName(coach.name);
setCoachRole(coach.role);
setCoachQualifications(coach.qualifications || '');
setCoachExperience(coach.experience || '');
setCoachPhone(coach.phone || '');
setCoachEmail(coach.email || '');
setCoachPhoto(coach.photo);
setCoachBio(coach.bio || '');
setCoachHeadCoach(coach.headCoach || false);
},[]);

const handleUpdateCoach=useCallback(async (e)=> {
e.preventDefault();
const updateData={
name: coachName,
role: coachRole,
qualifications: coachQualifications,
experience: coachExperience,
phone: coachPhone,
email: coachEmail,
photo: coachPhoto,
bio: coachBio,
headCoach: coachHeadCoach
};

try {
await updateCoach(editingCoach,updateData);
setEditingCoach(null);
// Reset all individual coach fields
setCoachName('');
setCoachRole('');
setCoachQualifications('');
setCoachExperience('');
setCoachPhone('');
setCoachEmail('');
setCoachPhoto('');
setCoachBio('');
setCoachHeadCoach(false);
} catch (error) {
console.error("Error updating coach:",error);
alert("Failed to update coach. Please try again.");
}
},[editingCoach,coachName,coachRole,coachQualifications,coachExperience,coachPhone,coachEmail,coachPhoto,coachBio,coachHeadCoach,updateCoach]);

const handleDeleteCoach=useCallback(async (id,name)=> {
if (window.confirm(`Are you sure you want to delete ${name}? This action cannot be undone.`)) {
try {
await deleteCoach(id);
} catch (error) {
console.error("Error deleting coach:",error);
alert("Failed to delete coach. Please try again.");
}
}
},[deleteCoach]);

const handleCancelEdit=useCallback(()=> {
setEditingPlayer(null);
setEditingCoach(null);
setShowAddForm(false);
// Reset all individual player fields
setPlayerName('');
setPlayerPosition('');
setPlayerNumber('');
setPlayerAge('');
setPlayerHeight('');
setPlayerWeight('');
setPlayerPhoto('');
setPlayerCaptain(false);
setPlayerTries(0);
setPlayerConversions(0);
setPlayerPenalties(0);
setPlayerTackles(0);
setPlayerLineouts(0);
setPlayerAppearances(0);
// Reset all individual coach fields
setCoachName('');
setCoachRole('');
setCoachQualifications('');
setCoachExperience('');
setCoachPhone('');
setCoachEmail('');
setCoachPhoto('');
setCoachBio('');
setCoachHeadCoach(false);
},[]);

// 🔧 FIXED: Memoized sorted arrays to prevent re-sorting on every render
const sortedPlayers=useMemo(()=> {
return [...players].sort((a,b)=> {
if (a.number && b.number) return a.number - b.number;
if (a.number && !b.number) return -1;
if (!a.number && b.number) return 1;
return a.name.localeCompare(b.name);
});
},[players]);

const sortedCoaches=useMemo(()=> {
return [...coaches].sort((a,b)=> {
if (a.headCoach && !b.headCoach) return -1;
if (!a.headCoach && b.headCoach) return 1;
return a.name.localeCompare(b.name);
});
},[coaches]);

// Check if user is admin
const isAdmin=localStorage.getItem('rugbyAdminAuth')==='true';

// 🔧 FIXED: Memoized input components with direct individual state setters
const PlayerFormInputs=useMemo(()=> (
<>
<div>
<label className="block text-sm font-medium text-gray-700 mb-1">Name *</label>
<input
type="text"
value={playerName}
onChange={(e)=> setPlayerName(e.target.value)}
className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
required
/>
</div>
<div>
<label className="block text-sm font-medium text-gray-700 mb-1">Position *</label>
<select
value={playerPosition}
onChange={(e)=> setPlayerPosition(e.target.value)}
className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
required
>
<option value="">Select Position</option>
{positions.map(pos=> (
<option key={pos} value={pos}>{pos}</option>
))}
</select>
</div>
<div>
<label className="block text-sm font-medium text-gray-700 mb-1">Jersey Number (Optional)</label>
<input
type="number"
value={playerNumber}
onChange={(e)=> setPlayerNumber(e.target.value)}
className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
min="1"
max="99"
placeholder="Leave empty if no number"
/>
</div>
<div>
<label className="block text-sm font-medium text-gray-700 mb-1">Age (Optional)</label>
<input
type="number"
value={playerAge}
onChange={(e)=> setPlayerAge(e.target.value)}
className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
min="13"
max="18"
placeholder="Leave empty if not specified"
/>
</div>
<div>
<label className="block text-sm font-medium text-gray-700 mb-1">Height (Optional)</label>
<input
type="text"
value={playerHeight}
onChange={(e)=> setPlayerHeight(e.target.value)}
className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
placeholder="e.g.,5'10&quot;"
/>
</div>
<div>
<label className="block text-sm font-medium text-gray-700 mb-1">Weight (Optional)</label>
<input
type="text"
value={playerWeight}
onChange={(e)=> setPlayerWeight(e.target.value)}
className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
placeholder="e.g.,70kg"
/>
</div>
<div>
<label className="block text-sm font-medium text-gray-700 mb-1">Photo URL</label>
<input
type="url"
value={playerPhoto}
onChange={(e)=> setPlayerPhoto(e.target.value)}
className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
placeholder="https://example.com/photo.jpg"
/>
</div>
<div className="flex items-center">
<input
type="checkbox"
id="captain"
checked={playerCaptain}
onChange={(e)=> setPlayerCaptain(e.target.checked)}
className="mr-2"
/>
<label htmlFor="captain" className="text-sm font-medium text-gray-700">Team Captain</label>
</div>
</>
),[playerName,playerPosition,playerNumber,playerAge,playerHeight,playerWeight,playerPhoto,playerCaptain,positions]);

const PlayerStatsInputs=useMemo(()=> (
<div className="md:col-span-2 mt-4">
<h3 className="text-lg font-semibold text-gray-800 mb-3">Player Statistics</h3>
<div className="bg-gray-50 rounded-lg p-4">
<div className="grid grid-cols-2 md:grid-cols-3 gap-4">
<div>
<label className="block text-sm font-medium text-gray-700 mb-1">Tries</label>
<input
type="number"
value={playerTries}
onChange={(e)=> setPlayerTries(e.target.value)}
className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
min="0"
/>
</div>
<div>
<label className="block text-sm font-medium text-gray-700 mb-1">Conversions</label>
<input
type="number"
value={playerConversions}
onChange={(e)=> setPlayerConversions(e.target.value)}
className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
min="0"
/>
</div>
<div>
<label className="block text-sm font-medium text-gray-700 mb-1">Penalties</label>
<input
type="number"
value={playerPenalties}
onChange={(e)=> setPlayerPenalties(e.target.value)}
className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
min="0"
/>
</div>
<div>
<label className="block text-sm font-medium text-gray-700 mb-1">Tackles</label>
<input
type="number"
value={playerTackles}
onChange={(e)=> setPlayerTackles(e.target.value)}
className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
min="0"
/>
</div>
<div>
<label className="block text-sm font-medium text-gray-700 mb-1">Lineouts Won</label>
<input
type="number"
value={playerLineouts}
onChange={(e)=> setPlayerLineouts(e.target.value)}
className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
min="0"
/>
</div>
<div>
<label className="block text-sm font-medium text-gray-700 mb-1">Appearances</label>
<input
type="number"
value={playerAppearances}
onChange={(e)=> setPlayerAppearances(e.target.value)}
className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
min="0"
/>
</div>
</div>
<p className="text-xs text-gray-500 mt-2">
Enter the player's statistics for the current season.
</p>
</div>
</div>
),[playerTries,playerConversions,playerPenalties,playerTackles,playerLineouts,playerAppearances]);

const CoachFormInputs=useMemo(()=> (
<>
<div>
<label className="block text-sm font-medium text-gray-700 mb-1">Name *</label>
<input
type="text"
value={coachName}
onChange={(e)=> setCoachName(e.target.value)}
className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
required
/>
</div>
<div>
<label className="block text-sm font-medium text-gray-700 mb-1">Role *</label>
<select
value={coachRole}
onChange={(e)=> setCoachRole(e.target.value)}
className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
required
>
<option value="">Select Role</option>
{coachingRoles.map(role=> (
<option key={role} value={role}>{role}</option>
))}
</select>
</div>
<div>
<label className="block text-sm font-medium text-gray-700 mb-1">Qualifications</label>
<input
type="text"
value={coachQualifications}
onChange={(e)=> setCoachQualifications(e.target.value)}
className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
placeholder="e.g.,Level 2 Coaching,First Aid Certified"
/>
</div>
<div>
<label className="block text-sm font-medium text-gray-700 mb-1">Experience</label>
<input
type="text"
value={coachExperience}
onChange={(e)=> setCoachExperience(e.target.value)}
className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
placeholder="e.g.,5 years coaching,Former player"
/>
</div>
<div>
<label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
<input
type="tel"
value={coachPhone}
onChange={(e)=> setCoachPhone(e.target.value)}
className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
placeholder="Optional contact number"
/>
</div>
<div>
<label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
<input
type="email"
value={coachEmail}
onChange={(e)=> setCoachEmail(e.target.value)}
className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
placeholder="Optional email address"
/>
</div>
<div>
<label className="block text-sm font-medium text-gray-700 mb-1">Photo URL</label>
<input
type="url"
value={coachPhoto}
onChange={(e)=> setCoachPhoto(e.target.value)}
className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
placeholder="https://example.com/photo.jpg"
/>
</div>
<div className="flex items-center">
<input
type="checkbox"
id="headCoach"
checked={coachHeadCoach}
onChange={(e)=> setCoachHeadCoach(e.target.checked)}
className="mr-2"
/>
<label htmlFor="headCoach" className="text-sm font-medium text-gray-700">Head Coach</label>
</div>
<div className="md:col-span-2">
<label className="block text-sm font-medium text-gray-700 mb-1">Biography</label>
<textarea
value={coachBio}
onChange={(e)=> setCoachBio(e.target.value)}
className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
rows="4"
placeholder="Brief biography,coaching philosophy,background,etc."
/>
</div>
</>
),[coachName,coachRole,coachQualifications,coachExperience,coachPhone,coachEmail,coachPhoto,coachBio,coachHeadCoach,coachingRoles]);

const TeamContent=()=> {
const loading=playersLoading || coachesLoading;
const error=playersError || coachesError;

if (loading) {
return (
<div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
<div className="flex justify-center items-center h-64">
<div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
</div>
</div>
);
}

if (error) {
return (
<div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
<div className="bg-red-50 border border-red-200 rounded-lg p-4">
<p className="text-red-700">Error loading team: {error}</p>
</div>
</div>
);
}

return (
<div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
<div className="flex justify-between items-center mb-8">
<motion.h1
initial={{opacity: 0,x: -20}}
animate={{opacity: 1,x: 0}}
className="text-3xl font-bold text-gray-800"
>
Team Squad
</motion.h1>
{isAdmin && (
<button
onClick={()=> setShowAddForm(!showAddForm)}
className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center space-x-2"
>
<SafeIcon icon={FiPlus} className="w-4 h-4" />
<span>Add {activeTab==='players' ? 'Player' : 'Coach'}</span>
</button>
)}
</div>

{/* Permission Notice */}
<motion.div
initial={{opacity: 0,y: 20}}
animate={{opacity: 1,y: 0}}
className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6"
>
<p className="text-sm text-green-700">
All team information and photos are shared with appropriate permissions from players,coaches and parents/guardians.
</p>
</motion.div>

{/* Tab Navigation */}
<div className="flex border-b border-gray-200 mb-6">
<button
onClick={()=> {
setActiveTab('players');
handleCancelEdit();
}}
className={`px-6 py-3 font-medium text-sm ${
activeTab==='players'
? 'border-b-2 border-blue-500 text-blue-600'
: 'text-gray-500 hover:text-gray-700'
}`}
>
<SafeIcon icon={FiUsers} className="w-4 h-4 inline mr-2" />
Players ({players.length})
</button>
<button
onClick={()=> {
setActiveTab('coaches');
handleCancelEdit();
}}
className={`px-6 py-3 font-medium text-sm ${
activeTab==='coaches'
? 'border-b-2 border-blue-500 text-blue-600'
: 'text-gray-500 hover:text-gray-700'
}`}
>
<SafeIcon icon={FiBookOpen} className="w-4 h-4 inline mr-2" />
Coaching Staff ({coaches.length})
</button>
</div>

{/* Add/Edit Form */}
{(showAddForm || editingPlayer || editingCoach) && isAdmin && (
<motion.div
initial={{opacity: 0,y: -20}}
animate={{opacity: 1,y: 0}}
className="bg-white rounded-lg shadow-md p-6 mb-8"
>
<h2 className="text-xl font-bold text-gray-800 mb-4">
{editingPlayer ? 'Edit Player' : editingCoach ? 'Edit Coach' : `Add New ${activeTab==='players' ? 'Player' : 'Coach'}`}
</h2>

{/* Player Form */}
{(activeTab==='players' || editingPlayer) && (
<form onSubmit={editingPlayer ? handleUpdatePlayer : handleAddPlayer} className="grid grid-cols-1 md:grid-cols-2 gap-4">
{PlayerFormInputs}
{PlayerStatsInputs}
<div className="md:col-span-2 flex space-x-4 mt-4">
<button
type="submit"
className="bg-green-600 text-white px-6 py-2 rounded-lg hover:bg-green-700 transition-colors flex items-center space-x-2"
>
<SafeIcon icon={FiSave} className="w-4 h-4" />
<span>{editingPlayer ? 'Update Player' : 'Add Player'}</span>
</button>
<button
type="button"
onClick={handleCancelEdit}
className="bg-gray-600 text-white px-6 py-2 rounded-lg hover:bg-gray-700 transition-colors flex items-center space-x-2"
>
<SafeIcon icon={FiX} className="w-4 h-4" />
<span>Cancel</span>
</button>
</div>
</form>
)}

{/* Coach Form */}
{(activeTab==='coaches' || editingCoach) && (
<form onSubmit={editingCoach ? handleUpdateCoach : handleAddCoach} className="grid grid-cols-1 md:grid-cols-2 gap-4">
{CoachFormInputs}
<div className="md:col-span-2 flex space-x-4 mt-4">
<button
type="submit"
className="bg-green-600 text-white px-6 py-2 rounded-lg hover:bg-green-700 transition-colors flex items-center space-x-2"
>
<SafeIcon icon={FiSave} className="w-4 h-4" />
<span>{editingCoach ? 'Update Coach' : 'Add Coach'}</span>
</button>
<button
type="button"
onClick={handleCancelEdit}
className="bg-gray-600 text-white px-6 py-2 rounded-lg hover:bg-gray-700 transition-colors flex items-center space-x-2"
>
<SafeIcon icon={FiX} className="w-4 h-4" />
<span>Cancel</span>
</button>
</div>
</form>
)}
</motion.div>
)}

{/* Players Tab Content */}
{activeTab==='players' && (
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
{sortedPlayers.map((player,index)=> (
<motion.div
key={player.id}
initial={{opacity: 0,y: 20}}
animate={{opacity: 1,y: 0}}
transition={{delay: index * 0.1}}
className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow"
>
<div className="relative">
<img
src={player.photo || `https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=400&h=400&fit=crop&crop=face`}
alt={player.name}
className="w-full h-48 md:h-64 object-cover"
style={{'@media (max-width: 768px)': {height: '256px'}}}
/>
{player.number && (
<div className="absolute top-2 left-2">
<span className="bg-blue-600 text-white px-3 py-1 rounded-full text-sm font-bold">
#{player.number}
</span>
</div>
)}
{player.captain && (
<div className="absolute top-2 right-2">
<SafeIcon icon={FiAward} className="w-6 h-6 text-yellow-500" />
</div>
)}
{isAdmin && (
<div className="absolute bottom-2 right-2 flex space-x-2">
<button
onClick={()=> handleEditPlayer(player)}
className="bg-blue-600 text-white p-2 rounded-full hover:bg-blue-700 transition-colors"
>
<SafeIcon icon={FiEdit2} className="w-4 h-4" />
</button>
<button
onClick={()=> handleDeletePlayer(player.id,player.name)}
className="bg-red-600 text-white p-2 rounded-full hover:bg-red-700 transition-colors"
>
<SafeIcon icon={FiTrash2} className="w-4 h-4" />
</button>
</div>
)}
</div>
<div className="p-4">
<h3 className="text-lg font-bold text-gray-800 mb-1">{player.name}</h3>
<p className="text-blue-600 font-medium mb-2">{player.position}</p>
{player.captain && (
<p className="text-yellow-600 font-medium text-sm mb-2">Team Captain</p>
)}
<div className="grid grid-cols-2 gap-2 text-sm text-gray-600 mb-3">
{player.age && <div>Age: {player.age}</div>}
{player.height && <div>Height: {player.height}</div>}
{player.weight && <div className={player.height ? "col-span-2" : ""}>Weight: {player.weight}</div>}
{player.stats?.appearances > 0 && <div>Appearances: {player.stats.appearances}</div>}
</div>
<div className="border-t pt-3">
<p className="text-xs text-gray-500 mb-2">Season Stats</p>
<div className="grid grid-cols-3 gap-2 text-xs">
<div className="text-center">
<div className="font-bold text-gray-800">{player.stats?.tries || 0}</div>
<div className="text-gray-600">Tries</div>
</div>
<div className="text-center">
<div className="font-bold text-gray-800">{player.stats?.conversions || 0}</div>
<div className="text-gray-600">Conv.</div>
</div>
<div className="text-center">
<div className="font-bold text-gray-800">{player.stats?.penalties || 0}</div>
<div className="text-gray-600">Pen.</div>
</div>
</div>
{(player.stats?.tackles > 0 || player.stats?.lineouts > 0) && (
<div className="grid grid-cols-2 gap-2 text-xs mt-2">
{player.stats?.tackles > 0 && (
<div className="text-center">
<div className="font-bold text-gray-800">{player.stats.tackles}</div>
<div className="text-gray-600">Tackles</div>
</div>
)}
{player.stats?.lineouts > 0 && (
<div className="text-center">
<div className="font-bold text-gray-800">{player.stats.lineouts}</div>
<div className="text-gray-600">Lineouts</div>
</div>
)}
</div>
)}
</div>
</div>
</motion.div>
))}
</div>
)}

{/* Coaches Tab Content */}
{activeTab==='coaches' && (
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
{sortedCoaches.map((coach,index)=> (
<motion.div
key={coach.id}
initial={{opacity: 0,y: 20}}
animate={{opacity: 1,y: 0}}
transition={{delay: index * 0.1}}
className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow"
>
<div className="relative">
<img
src={coach.photo || `https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=400&fit=crop&crop=face`}
alt={coach.name}
className="w-full h-64 object-cover"
/>
{coach.headCoach && (
<div className="absolute top-2 left-2">
<span className="bg-green-600 text-white px-3 py-1 rounded-full text-sm font-bold">
Head Coach
</span>
</div>
)}
{isAdmin && (
<div className="absolute bottom-2 right-2 flex space-x-2">
<button
onClick={()=> handleEditCoach(coach)}
className="bg-blue-600 text-white p-2 rounded-full hover:bg-blue-700 transition-colors"
>
<SafeIcon icon={FiEdit2} className="w-4 h-4" />
</button>
<button
onClick={()=> handleDeleteCoach(coach.id,coach.name)}
className="bg-red-600 text-white p-2 rounded-full hover:bg-red-700 transition-colors"
>
<SafeIcon icon={FiTrash2} className="w-4 h-4" />
</button>
</div>
)}
</div>
<div className="p-4">
<h3 className="text-lg font-bold text-gray-800 mb-1">{coach.name}</h3>
<p className="text-green-600 font-medium mb-2">{coach.role}</p>
{coach.qualifications && (
<div className="text-sm text-gray-600 mb-2">
<strong>Qualifications:</strong> {coach.qualifications}
</div>
)}
{coach.experience && (
<div className="text-sm text-gray-600 mb-2">
<strong>Experience:</strong> {coach.experience}
</div>
)}
{(coach.phone || coach.email) && (
<div className="border-t pt-3 mt-3">
<p className="text-xs text-gray-500 mb-2">Contact</p>
{coach.phone && (
<div className="flex items-center space-x-2 text-sm text-gray-600 mb-1">
<SafeIcon icon={FiPhone} className="w-4 h-4" />
<span>{coach.phone}</span>
</div>
)}
{coach.email && (
<div className="flex items-center space-x-2 text-sm text-gray-600">
<SafeIcon icon={FiMail} className="w-4 h-4" />
<span className="truncate">{coach.email}</span>
</div>
)}
</div>
)}
{coach.bio && (
<div className="border-t pt-3 mt-3">
<p className="text-xs text-gray-500 mb-2">Biography</p>
<p className="text-sm text-gray-700 leading-relaxed">{coach.bio}</p>
</div>
)}
</div>
</motion.div>
))}
</div>
)}

{/* Empty States */}
{activeTab==='players' && players.length===0 && (
<div className="text-center py-12">
<SafeIcon icon={FiUsers} className="w-16 h-16 mx-auto text-gray-400 mb-4" />
<p className="text-gray-500 text-lg">No players added yet</p>
<p className="text-gray-400">Add players to build your team roster</p>
</div>
)}

{activeTab==='coaches' && coaches.length===0 && (
<div className="text-center py-12">
<SafeIcon icon={FiBookOpen} className="w-16 h-16 mx-auto text-gray-400 mb-4" />
<p className="text-gray-500 text-lg">No coaching staff added yet</p>
<p className="text-gray-400">Add coaches and support staff to complete your team</p>
</div>
)}

{/* Mobile-specific CSS fix for player photos */}
<style jsx>{`
@media (max-width: 768px) {
.grid img {
height: 256px !important;
}
}
`}</style>
</div>
);
};

return (
<ProtectedPage pageName="Team">
<TeamContent />
</ProtectedPage>
);
};

export default Team;