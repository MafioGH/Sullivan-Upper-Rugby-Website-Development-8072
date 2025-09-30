import React,{useState,useEffect} from 'react';
import {Link} from 'react-router-dom';
import {motion} from 'framer-motion';
import {format} from 'date-fns';
import * as FiIcons from 'react-icons/fi';
import SafeIcon from '../common/SafeIcon';
import {useSupabaseData} from '../hooks/useSupabaseData';

const {FiCalendar,FiMapPin,FiClock,FiTarget}=FiIcons;

const FixtureCountdown=()=> {
const {data: fixtures,loading}=useSupabaseData('fixtures');
const [nextFixture,setNextFixture]=useState(null);
const [timeLeft,setTimeLeft]=useState({days: 0,hours: 0,minutes: 0,seconds: 0});

// 🔧 FIXED: Consistent match completion logic with match duration
const isMatchCompleted=(date,time)=> {
const now=new Date();
const matchStartTime=new Date(`${date} ${time}`);
// Rugby matches typically last 80 minutes + stoppage time + halftime = ~120 minutes (2 hours)
const matchDurationMs=2 * 60 * 60 * 1000; // 2 hours in milliseconds
const matchEndTime=new Date(matchStartTime.getTime() + matchDurationMs);
return now > matchEndTime;
};

useEffect(()=> {
if (!loading && fixtures.length > 0) {
const now=new Date();
// Find the next upcoming fixture (not completed)
const upcomingFixtures=fixtures
.filter(fixture=> !isMatchCompleted(fixture.date,fixture.time))
.sort((a,b)=> new Date(`${a.date} ${a.time}`) - new Date(`${b.date} ${b.time}`));

if (upcomingFixtures.length > 0) {
setNextFixture(upcomingFixtures[0]);
}
}
},[loading,fixtures]);

useEffect(()=> {
if (!nextFixture) return;

const timer=setInterval(()=> {
const now=new Date().getTime();
const matchTime=new Date(`${nextFixture.date} ${nextFixture.time}`).getTime();
const difference=matchTime - now;

if (difference > 0) {
const days=Math.floor(difference / (1000 * 60 * 60 * 24));
const hours=Math.floor((difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
const minutes=Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60));
const seconds=Math.floor((difference % (1000 * 60)) / 1000);

setTimeLeft({days,hours,minutes,seconds});
} else {
setTimeLeft({days: 0,hours: 0,minutes: 0,seconds: 0});
}
},1000);

return ()=> clearInterval(timer);
},[nextFixture]);

if (loading) {
return (
<motion.div
initial={{opacity: 0,y: 20}}
animate={{opacity: 1,y: 0}}
className="bg-gradient-to-r from-green-600 to-gray-800 rounded-lg p-6 text-white mb-8"
>
<div className="text-center">
<div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white mx-auto mb-3"></div>
<h3 className="text-lg font-semibold mb-2">Loading Next Fixture...</h3>
</div>
</motion.div>
);
}

if (!nextFixture) {
return (
<motion.div
initial={{opacity: 0,y: 20}}
animate={{opacity: 1,y: 0}}
className="bg-gradient-to-r from-green-600 to-gray-800 rounded-lg p-6 text-white mb-8"
>
<div className="text-center">
<SafeIcon icon={FiCalendar} className="w-8 h-8 mx-auto mb-3" />
<h3 className="text-lg font-semibold mb-2">Next Fixture</h3>
<p className="text-green-100">No upcoming fixtures scheduled</p>
<Link
to="/fixtures"
className="inline-block mt-3 bg-white text-green-600 px-4 py-2 rounded-lg hover:bg-green-50 transition-colors font-medium"
>
View All Fixtures
</Link>
</div>
</motion.div>
);
}

const isMatchToday=timeLeft.days===0 && timeLeft.hours < 24;
const isMatchSoon=timeLeft.days===0;

return (
<motion.div
initial={{opacity: 0,y: 20}}
animate={{opacity: 1,y: 0}}
className="bg-gradient-to-r from-green-600 to-gray-800 rounded-lg p-6 text-white mb-8 relative overflow-hidden"
>
{/* Background Pattern */}
<div className="absolute inset-0 opacity-10">
<div className="absolute top-0 right-0 w-32 h-32 bg-white rounded-full -translate-y-16 translate-x-16"></div>
<div className="absolute bottom-0 left-0 w-24 h-24 bg-white rounded-full translate-y-12 -translate-x-12"></div>
</div>

<div className="relative z-10">
<div className="flex items-center justify-between mb-4">
<h3 className="text-xl font-bold flex items-center space-x-2">
<SafeIcon icon={FiTarget} className="w-6 h-6" />
<span>Next Match</span>
</h3>
{isMatchToday && (
<span className="bg-red-500 text-white px-3 py-1 rounded-full text-sm font-bold animate-pulse">
MATCH DAY!
</span>
)}
<span className="bg-blue-500 text-white px-2 py-1 rounded-full text-xs font-bold">
LIVE
</span>
</div>

<div className="grid grid-cols-1 md:grid-cols-2 gap-6">
{/* Match Details */}
<div>
<h4 className="text-lg font-semibold mb-3">
Sullivan Upper vs {nextFixture.opponent}
</h4>
<div className="space-y-2 text-green-100">
<div className="flex items-center space-x-2">
<SafeIcon icon={FiCalendar} className="w-4 h-4" />
<span>{format(new Date(nextFixture.date),'EEEE,MMMM do,yyyy')}</span>
</div>
<div className="flex items-center space-x-2">
<SafeIcon icon={FiClock} className="w-4 h-4" />
<span>{nextFixture.time}</span>
</div>
<div className="flex items-center space-x-2">
<SafeIcon icon={FiMapPin} className="w-4 h-4" />
<span>{nextFixture.venue}</span>
</div>
</div>
<div className="mt-3">
<span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
nextFixture.homeAway==='Home' 
? 'bg-green-500 text-white' 
: 'bg-gray-700 text-white'
}`}>
{nextFixture.homeAway}
</span>
</div>
</div>

{/* Countdown Timer */}
<div>
<h4 className="text-lg font-semibold mb-3">Countdown</h4>
<div className="grid grid-cols-4 gap-2">
<div className="text-center">
<div className={`text-2xl font-bold ${isMatchSoon ? 'text-yellow-300' : 'text-white'}`}>
{timeLeft.days}
</div>
<div className="text-xs text-green-100">Days</div>
</div>
<div className="text-center">
<div className={`text-2xl font-bold ${isMatchSoon ? 'text-yellow-300' : 'text-white'}`}>
{timeLeft.hours}
</div>
<div className="text-xs text-green-100">Hours</div>
</div>
<div className="text-center">
<div className={`text-2xl font-bold ${isMatchSoon ? 'text-yellow-300' : 'text-white'}`}>
{timeLeft.minutes}
</div>
<div className="text-xs text-green-100">Minutes</div>
</div>
<div className="text-center">
<div className={`text-2xl font-bold ${isMatchSoon ? 'text-yellow-300' : 'text-white'}`}>
{timeLeft.seconds}
</div>
<div className="text-xs text-green-100">Seconds</div>
</div>
</div>

{isMatchSoon && (
<div className="mt-3 text-center">
<span className="text-yellow-300 font-semibold animate-pulse">
⚡ Match starting soon!
</span>
</div>
)}
</div>
</div>

<div className="mt-6 flex justify-center">
<Link
to="/fixtures"
className="bg-white text-green-600 px-6 py-2 rounded-lg hover:bg-green-50 transition-colors font-medium flex items-center space-x-2"
>
<SafeIcon icon={FiCalendar} className="w-4 h-4" />
<span>View All Fixtures</span>
</Link>
</div>
</div>
</motion.div>
);
};

export default FixtureCountdown;