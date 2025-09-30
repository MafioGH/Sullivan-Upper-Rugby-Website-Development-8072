import React,{useState,useEffect,useCallback,useMemo} from 'react';
import {motion} from 'framer-motion';
import {format} from 'date-fns';
import {useLocation} from 'react-router-dom';
import * as FiIcons from 'react-icons/fi';
import SafeIcon from '../common/SafeIcon';
import RichTextEditor from '../components/RichTextEditor';
import {useSupabaseData} from '../hooks/useSupabaseData';

const {FiTrophy,FiTarget,FiCalendar,FiMapPin,FiPlus,FiEdit2,FiTrash2,FiSave,FiX,FiFileText,FiMinus}=FiIcons;

const Results=()=> {
const {data: results,loading,error,addItem,updateItem,deleteItem}=useSupabaseData('results');
const location=useLocation();

const [showAddForm,setShowAddForm]=useState(false);
const [editingResult,setEditingResult]=useState(null);

// 🔧 FIXED: Individual state hooks to prevent object re-rendering
const [opponent,setOpponent]=useState('');
const [date,setDate]=useState('');
const [venue,setVenue]=useState('');
const [homeAway,setHomeAway]=useState('Home');
const [sullivanScore,setSullivanScore]=useState('');
const [opponentScore,setOpponentScore]=useState('');
const [matchType,setMatchType]=useState('');
const [notes,setNotes]=useState('');

// Handle scrolling to specific match when URL has hash
useEffect(()=> {
if (location.hash && results.length > 0) {
// Small delay to ensure DOM is rendered
setTimeout(()=> {
const element=document.getElementById(location.hash.substring(1));
if (element) {
element.scrollIntoView({behavior: 'smooth',block: 'start',inline: 'nearest'});
}
},100);
}
},[location.hash,results]);

// 🔧 FIXED: Stable form handlers
const handleAddResult=useCallback(async (e)=> {
e.preventDefault();
const resultData={
opponent,
date,
venue,
homeAway,
sullivanScore: parseInt(sullivanScore),
opponentScore: parseInt(opponentScore),
matchType,
notes
};

try {
await addItem(resultData);
// Reset form
setOpponent('');
setDate('');
setVenue('');
setHomeAway('Home');
setSullivanScore('');
setOpponentScore('');
setMatchType('');
setNotes('');
setShowAddForm(false);
} catch (error) {
console.error("Error adding result:",error);
alert("Failed to add result. Please try again.");
}
},[opponent,date,venue,homeAway,sullivanScore,opponentScore,matchType,notes,addItem]);

const handleEditResult=useCallback((result)=> {
setEditingResult(result.id);
setOpponent(result.opponent);
setDate(result.date);
setVenue(result.venue);
setHomeAway(result.homeAway);
setSullivanScore(result.sullivanScore.toString());
setOpponentScore(result.opponentScore.toString());
setMatchType(result.matchType || '');
setNotes(result.notes || '');
},[]);

const handleUpdateResult=useCallback(async (e)=> {
e.preventDefault();
const updateData={
opponent,
date,
venue,
homeAway,
sullivanScore: parseInt(sullivanScore),
opponentScore: parseInt(opponentScore),
matchType,
notes
};

try {
await updateItem(editingResult,updateData);
setEditingResult(null);
// Reset form
setOpponent('');
setDate('');
setVenue('');
setHomeAway('Home');
setSullivanScore('');
setOpponentScore('');
setMatchType('');
setNotes('');
} catch (error) {
console.error("Error updating result:",error);
alert("Failed to update result. Please try again.");
}
},[editingResult,opponent,date,venue,homeAway,sullivanScore,opponentScore,matchType,notes,updateItem]);

const handleDeleteResult=useCallback(async (id,opponent)=> {
if (window.confirm(`Are you sure you want to delete the result against ${opponent}? This action cannot be undone.`)) {
try {
await deleteItem(id);
} catch (error) {
console.error("Error deleting result:",error);
alert("Failed to delete result. Please try again.");
}
}
},[deleteItem]);

const handleCancelEdit=useCallback(()=> {
setEditingResult(null);
setShowAddForm(false);
// Reset form
setOpponent('');
setDate('');
setVenue('');
setHomeAway('Home');
setSullivanScore('');
setOpponentScore('');
setMatchType('');
setNotes('');
},[]);

const getResultStatus=(sullivanScore,opponentScore)=> {
if (sullivanScore > opponentScore) return 'win';
if (sullivanScore < opponentScore) return 'loss';
return 'draw';
};

const getStatusColor=(status)=> {
switch (status) {
case 'win': return 'bg-green-100 text-green-800';
case 'loss': return 'bg-red-100 text-red-800';
case 'draw': return 'bg-yellow-100 text-yellow-800';
default: return 'bg-gray-100 text-gray-800';
}
};

const getStatusText=(status)=> {
switch (status) {
case 'win': return 'WIN';
case 'loss': return 'LOSS';
case 'draw': return 'DRAW';
default: return '';
}
};

// Calculate season stats
const wins=useMemo(()=> results.filter(r=> getResultStatus(r.sullivanScore,r.opponentScore)==='win').length,[results]);
const losses=useMemo(()=> results.filter(r=> getResultStatus(r.sullivanScore,r.opponentScore)==='loss').length,[results]);
const draws=useMemo(()=> results.filter(r=> getResultStatus(r.sullivanScore,r.opponentScore)==='draw').length,[results]);
const totalPointsFor=useMemo(()=> results.reduce((sum,r)=> sum + r.sullivanScore,0),[results]);
const totalPointsAgainst=useMemo(()=> results.reduce((sum,r)=> sum + r.opponentScore,0),[results]);

// Check if user is admin
const isAdmin=localStorage.getItem('rugbyAdminAuth')==='true';

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
<p className="text-red-700">Error loading results: {error}</p>
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
Results
</motion.h1>
{isAdmin && (
<button
onClick={()=> setShowAddForm(!showAddForm)}
className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center space-x-2"
>
<SafeIcon icon={FiPlus} className="w-4 h-4" />
<span>Add Result</span>
</button>
)}
</div>

{/* Season Stats - Now includes Draws */}
<motion.div
initial={{opacity: 0,y: 20}}
animate={{opacity: 1,y: 0}}
className="grid grid-cols-2 md:grid-cols-6 gap-4 mb-8"
>
<div className="bg-white rounded-lg shadow-md p-4 text-center">
<p className="text-2xl font-bold text-gray-800">{results.length}</p>
<p className="text-sm text-gray-600">Played</p>
</div>
<div className="bg-white rounded-lg shadow-md p-4 text-center">
<p className="text-2xl font-bold text-green-600">{wins}</p>
<p className="text-sm text-gray-600">Wins</p>
</div>
<div className="bg-white rounded-lg shadow-md p-4 text-center">
<p className="text-2xl font-bold text-red-600">{losses}</p>
<p className="text-sm text-gray-600">Losses</p>
</div>
<div className="bg-white rounded-lg shadow-md p-4 text-center">
<p className="text-2xl font-bold text-yellow-600">{draws}</p>
<p className="text-sm text-gray-600">Draws</p>
</div>
<div className="bg-white rounded-lg shadow-md p-4 text-center">
<p className="text-2xl font-bold text-blue-600">{totalPointsFor}</p>
<p className="text-sm text-gray-600">Points For</p>
</div>
<div className="bg-white rounded-lg shadow-md p-4 text-center">
<p className="text-2xl font-bold text-orange-600">{totalPointsAgainst}</p>
<p className="text-sm text-gray-600">Points Against</p>
</div>
</motion.div>

{/* Add/Edit Result Form */}
{(showAddForm || editingResult) && isAdmin && (
<motion.div
initial={{opacity: 0,y: -20}}
animate={{opacity: 1,y: 0}}
className="bg-white rounded-lg shadow-md p-6 mb-8"
>
<h2 className="text-xl font-bold text-gray-800 mb-4">
{editingResult ? 'Edit Match Result' : 'Add Match Result'}
</h2>
<form onSubmit={editingResult ? handleUpdateResult : handleAddResult} className="space-y-6">
<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
<div>
<label className="block text-sm font-medium text-gray-700 mb-1">Opponent</label>
<input
type="text"
value={opponent}
onChange={(e)=> setOpponent(e.target.value)}
className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
required
/>
</div>
<div>
<label className="block text-sm font-medium text-gray-700 mb-1">Date</label>
<input
type="date"
value={date}
onChange={(e)=> setDate(e.target.value)}
className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
required
/>
</div>
<div>
<label className="block text-sm font-medium text-gray-700 mb-1">Sullivan Upper Score</label>
<input
type="number"
value={sullivanScore}
onChange={(e)=> setSullivanScore(e.target.value)}
className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
required
min="0"
/>
</div>
<div>
<label className="block text-sm font-medium text-gray-700 mb-1">Opponent Score</label>
<input
type="number"
value={opponentScore}
onChange={(e)=> setOpponentScore(e.target.value)}
className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
required
min="0"
/>
</div>
<div>
<label className="block text-sm font-medium text-gray-700 mb-1">Home/Away</label>
<select
value={homeAway}
onChange={(e)=> setHomeAway(e.target.value)}
className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
>
<option value="Home">Home</option>
<option value="Away">Away</option>
</select>
</div>
<div>
<label className="block text-sm font-medium text-gray-700 mb-1">Venue</label>
<input
type="text"
value={venue}
onChange={(e)=> setVenue(e.target.value)}
className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
required
/>
</div>
<div className="md:col-span-2">
<label className="block text-sm font-medium text-gray-700 mb-1">Match Type</label>
<input
type="text"
value={matchType}
onChange={(e)=> setMatchType(e.target.value)}
className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
placeholder="e.g.,Friendly,Medallion Shield Round 1,Pre-season,etc."
/>
</div>
</div>

{/* Rich Text Editor for Match Report */}
<div>
<label className="block text-sm font-medium text-gray-700 mb-2 flex items-center space-x-2">
<SafeIcon icon={FiFileText} className="w-4 h-4" />
<span>Match Report</span>
</label>
<div className="bg-gray-50 p-3 rounded-lg mb-2">
<p className="text-sm text-gray-600">
Use the rich text editor below to create a detailed match report with proper formatting,including <strong>bold text</strong>,<em>italics</em>,bullet points,and different font sizes.
</p>
</div>
<RichTextEditor
value={notes}
onChange={(content)=> setNotes(content)}
placeholder="Write your match report here. Include key moments,player performances,tactical observations,and match highlights..."
/>
</div>

<div className="flex space-x-4">
<button
type="submit"
className="bg-green-600 text-white px-6 py-2 rounded-lg hover:bg-green-700 transition-colors flex items-center space-x-2"
>
<SafeIcon icon={FiSave} className="w-4 h-4" />
<span>{editingResult ? 'Update Result' : 'Add Result'}</span>
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
</motion.div>
)}

{/* Results List */}
<div className="space-y-6">
{results.map((result,index)=> {
const status=getResultStatus(result.sullivanScore,result.opponentScore);
// Create unique anchor ID for each match result
const anchorId=`match-${result.date}-${result.opponent.toLowerCase().replace(/\s+/g,'-')}`;

return (
<motion.div
key={result.id}
id={anchorId}
initial={{opacity: 0,y: 20}}
animate={{opacity: 1,y: 0}}
transition={{delay: index * 0.1}}
className="bg-white rounded-lg shadow-md p-6"
>
<div className="flex flex-col md:flex-row md:items-start justify-between mb-4">
<div className="flex-1">
<div className="flex items-center space-x-3 mb-2">
<h3 className="text-xl font-bold text-gray-800 leading-tight">
Sullivan Upper vs {result.opponent}
</h3>
<span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(status)}`}>
{getStatusText(status)}
</span>
</div>
<div className="flex items-center space-x-4 text-sm text-gray-600 mb-3">
<div className="flex items-center space-x-1">
<SafeIcon icon={FiCalendar} className="w-4 h-4" />
<span>{format(new Date(result.date),'MMMM do,yyyy')}</span>
</div>
<div className="flex items-center space-x-1">
<SafeIcon icon={FiMapPin} className="w-4 h-4" />
<span>{result.venue}</span>
</div>
</div>
{result.matchType && (
<div className="mb-3">
<span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
{result.matchType}
</span>
</div>
)}
</div>

<div className="mt-4 md:mt-0 flex items-center space-x-4">
<div className="text-right">
<div className="text-3xl font-bold text-gray-800">
{result.sullivanScore} - {result.opponentScore}
</div>
<div className="text-sm text-gray-600">{result.homeAway}</div>
</div>
{isAdmin && (
<div className="flex flex-col space-y-2">
<button
onClick={()=> handleEditResult(result)}
className="bg-blue-600 text-white p-2 rounded-lg hover:bg-blue-700 transition-colors"
title="Edit result"
>
<SafeIcon icon={FiEdit2} className="w-4 h-4" />
</button>
<button
onClick={()=> handleDeleteResult(result.id,result.opponent)}
className="bg-red-600 text-white p-2 rounded-lg hover:bg-red-700 transition-colors"
title="Delete result"
>
<SafeIcon icon={FiTrash2} className="w-4 h-4" />
</button>
</div>
)}
</div>
</div>

{/* Match Report with Rich Text Display */}
{result.notes && (
<div className="border-t pt-4">
<h4 className="text-lg font-semibold text-gray-800 mb-3 flex items-center space-x-2">
<SafeIcon icon={FiFileText} className="w-5 h-5" />
<span>Match Report</span>
</h4>
<div
className="newspaper-content text-gray-700 leading-relaxed"
dangerouslySetInnerHTML={{__html: result.notes}}
style={{fontSize: '15px',lineHeight: '1.7'}}
/>
</div>
)}
</motion.div>
);
})}
</div>

{results.length===0 && (
<div className="text-center py-12">
<SafeIcon icon={FiTrophy} className="w-16 h-16 mx-auto text-gray-400 mb-4" />
<p className="text-gray-500 text-lg">No results yet</p>
<p className="text-gray-400">Results will appear here after matches are played</p>
</div>
)}

{/* Additional inline styles to ensure headlines work */}
<style jsx>{`
.newspaper-content h1,.newspaper-content h2,.newspaper-content h3 {
line-height: 0.85 !important;
margin-bottom: 0.2em !important;
font-weight: 600 !important;
}
.newspaper-content h1 {
font-size: 1.5em !important;
line-height: 0.8 !important;
}
.newspaper-content h2 {
font-size: 1.3em !important;
line-height: 0.85 !important;
}
.newspaper-content h3 {
font-size: 1.1em !important;
line-height: 0.9 !important;
}
`}</style>
</div>
);
};

export default Results;