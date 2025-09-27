import React,{useState,useEffect} from 'react';
import {motion} from 'framer-motion';
import * as FiIcons from 'react-icons/fi';
import SafeIcon from '../common/SafeIcon';

const {FiLock,FiEye,FiEyeOff,FiShield,FiCheck,FiX,FiClock}=FiIcons;

const ProtectedPage=({children,pageName})=> {
const [isAuthenticated,setIsAuthenticated]=useState(false);
const [password,setPassword]=useState('');
const [showPassword,setShowPassword]=useState(false);
const [error,setError]=useState('');
const [loading,setLoading]=useState(true);
const [rememberPassword,setRememberPassword]=useState(false);
const [sessionDuration,setSessionDuration]=useState('30days');// Default to 30 days for protected pages

// Password for protected pages - keep this secure and not displayed to users
const PAGE_PASSWORD='SUME005';

// Session duration options (in milliseconds)
const sessionDurations={
'1hour': 60 * 60 * 1000,
'24hours': 24 * 60 * 60 * 1000,
'7days': 7 * 24 * 60 * 60 * 1000,
'30days': 30 * 24 * 60 * 60 * 1000,
'90days': 90 * 24 * 60 * 60 * 1000,
'permanent': 365 * 24 * 60 * 60 * 1000 // 1 year (effectively permanent)
};

useEffect(()=> {
// Check if user is already authenticated for this specific page
const authKey=`rugby${pageName}Auth`;
const timeKey=`rugby${pageName}AuthTime`;
const passwordKey=`rugby${pageName}Password`;
const durationKey=`rugby${pageName}SessionDuration`;

const authStatus=localStorage.getItem(authKey);
const authTime=localStorage.getItem(timeKey);
const savedDuration=localStorage.getItem(durationKey) || '30days';

// Check for remembered password
const rememberedPassword=localStorage.getItem(passwordKey);
if (rememberedPassword) {
setPassword(rememberedPassword);
setRememberPassword(true);
}

// Set the saved session duration
setSessionDuration(savedDuration);

console.log(`Checking auth for ${pageName}:`,{authStatus,authTime,savedDuration});

if (authStatus==='true' && authTime) {
// Check if authentication is still valid based on selected duration
const sessionLength=sessionDurations[savedDuration];
const isExpired=Date.now() - parseInt(authTime) > sessionLength;

if (!isExpired) {
console.log(`${pageName} auth valid,granting access`);
setIsAuthenticated(true);
} else {
console.log(`${pageName} auth expired,clearing`);
// Clear expired authentication
localStorage.removeItem(authKey);
localStorage.removeItem(timeKey);
}
}

setLoading(false);
},[pageName]);

const handleLogin=(e)=> {
e.preventDefault();
console.log('Attempting login with password:',password);

if (password===PAGE_PASSWORD) {
const authKey=`rugby${pageName}Auth`;
const timeKey=`rugby${pageName}AuthTime`;
const passwordKey=`rugby${pageName}Password`;
const durationKey=`rugby${pageName}SessionDuration`;

setIsAuthenticated(true);
setError('');

// Store authentication with timestamp and duration
localStorage.setItem(authKey,'true');
localStorage.setItem(timeKey,Date.now().toString());
localStorage.setItem(durationKey,sessionDuration);

// Store password if remember is checked
if (rememberPassword) {
localStorage.setItem(passwordKey,password);
} else {
localStorage.removeItem(passwordKey);
}

console.log(`${pageName} authentication successful`);
} else {
setError('Incorrect password. Please try again.');
setPassword('');
console.log('Authentication failed - incorrect password');
}
};

const handleLogout=()=> {
const authKey=`rugby${pageName}Auth`;
const timeKey=`rugby${pageName}AuthTime`;
const passwordKey=`rugby${pageName}Password`;
const durationKey=`rugby${pageName}SessionDuration`;

setIsAuthenticated(false);
localStorage.removeItem(authKey);
localStorage.removeItem(timeKey);
localStorage.removeItem(durationKey);

// Only clear password if user doesn't want it remembered
if (!rememberPassword) {
setPassword('');
localStorage.removeItem(passwordKey);
}

setError('');
console.log(`${pageName} logout successful`);
};

const handleForgetPassword=()=> {
if (window.confirm('Are you sure you want to forget the saved password?')) {
const passwordKey=`rugby${pageName}Password`;
localStorage.removeItem(passwordKey);
setPassword('');
setRememberPassword(false);
}
};

const getSessionExpiryText=()=> {
const timeKey=`rugby${pageName}AuthTime`;
const authTime=localStorage.getItem(timeKey);
if (!authTime) return '';

const sessionLength=sessionDurations[sessionDuration];
const expiryTime=new Date(parseInt(authTime) + sessionLength);

if (sessionDuration==='permanent') {
return 'Session never expires';
}

return `Session expires: ${expiryTime.toLocaleDateString()} ${expiryTime.toLocaleTimeString()}`;
};

if (loading) {
return (
<div className="min-h-screen flex items-center justify-center">
<div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600"></div>
</div>
);
}

if (!isAuthenticated) {
const passwordKey=`rugby${pageName}Password`;
const hasRememberedPassword=localStorage.getItem(passwordKey);

return (
<div className="min-h-screen bg-gradient-to-br from-green-50 to-gray-50 flex items-center justify-center px-4">
<motion.div
initial={{opacity: 0,y: 20}}
animate={{opacity: 1,y: 0}}
className="bg-white rounded-lg shadow-xl p-8 w-full max-w-md"
>
<div className="text-center mb-8">
<div className="w-16 h-16 bg-green-600 rounded-full flex items-center justify-center mx-auto mb-4">
<SafeIcon icon={FiShield} className="w-8 h-8 text-white" />
</div>
<h1 className="text-2xl font-bold text-gray-800 mb-2">
Protected Content
</h1>
<p className="text-gray-600">
Enter the password to access {pageName==='Gallery' ? 'photo gallery' : 'team information'}
</p>
</div>

<form onSubmit={handleLogin} className="space-y-6">
<div>
<label className="block text-sm font-medium text-gray-700 mb-2">
Password
</label>
<div className="relative">
<input
type={showPassword ? 'text' : 'password'}
value={password}
onChange={(e)=> setPassword(e.target.value)}
className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 pr-12"
placeholder="Enter password"
required
/>
<button
type="button"
onClick={()=> setShowPassword(!showPassword)}
className="absolute right-3 top-3 text-gray-500 hover:text-gray-700"
>
<SafeIcon icon={showPassword ? FiEyeOff : FiEye} className="w-5 h-5" />
</button>
</div>
</div>

{/* Session Duration Selector */}
<div>
<label className="block text-sm font-medium text-gray-700 mb-2">
<SafeIcon icon={FiClock} className="w-4 h-4 inline mr-1" />
Session Duration
</label>
<select
value={sessionDuration}
onChange={(e)=> setSessionDuration(e.target.value)}
className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
>
<option value="1hour">1 Hour</option>
<option value="24hours">24 Hours</option>
<option value="7days">7 Days</option>
<option value="30days">30 Days (Recommended)</option>
<option value="90days">90 Days</option>
<option value="permanent">Never Expire</option>
</select>
<p className="text-xs text-gray-500 mt-1">
How long should your access last?
</p>
</div>

{/* Remember Password Options */}
<div className="space-y-3">
<div className="flex items-center justify-between">
<div className="flex items-center">
<input
id="remember-password"
type="checkbox"
checked={rememberPassword}
onChange={(e)=> setRememberPassword(e.target.checked)}
className="h-4 w-4 text-green-600 focus:ring-green-500 border-gray-300 rounded"
/>
<label htmlFor="remember-password" className="ml-2 block text-sm text-gray-700">
Remember password on this device
</label>
</div>
{hasRememberedPassword && (
<button
type="button"
onClick={handleForgetPassword}
className="text-sm text-red-600 hover:text-red-800 transition-colors"
>
Forget saved password
</button>
)}
</div>

{/* Password Status Indicator */}
{hasRememberedPassword && (
<div className="bg-green-50 border border-green-200 rounded-lg p-3 flex items-center space-x-2">
<SafeIcon icon={FiCheck} className="w-5 h-5 text-green-600" />
<span className="text-green-700 text-sm">Password remembered on this device</span>
</div>
)}
</div>

{error && (
<motion.div
initial={{opacity: 0,x: -20}}
animate={{opacity: 1,x: 0}}
className="bg-red-50 border border-red-200 rounded-lg p-3 flex items-center space-x-2"
>
<SafeIcon icon={FiLock} className="w-5 h-5 text-red-500" />
<span className="text-red-700 text-sm">{error}</span>
</motion.div>
)}

<button
type="submit"
className="w-full bg-green-600 text-white py-3 px-4 rounded-lg hover:bg-green-700 transition-colors font-medium"
>
Access {pageName}
</button>
</form>

<div className="mt-8 p-4 bg-gray-50 rounded-lg">
<p className="text-sm text-gray-600">
<strong>Note:</strong> This content is protected to ensure appropriate access to{' '}
{pageName==='Gallery' ? 'photos and videos' : 'player information'}.
</p>
{rememberPassword && (
<p className="text-sm text-green-600 mt-2">
<strong>Remember Password:</strong> Your password will be securely stored on this device only.
</p>
)}
<p className="text-sm text-gray-500 mt-2">
<strong>Session Duration:</strong> Your access will last for {sessionDuration==='permanent' ? 'until manually logged out' : sessionDuration.replace(/(\d+)/,'$1 ').replace('days','day(s)').replace('hours','hour(s)')}
</p>
</div>
</motion.div>
</div>
);
}

return (
<div>
{/* Simple Access Badge - NO admin session details */}
<div className="bg-green-50 border-b border-green-200 px-4 py-2">
<div className="max-w-7xl mx-auto flex justify-between items-center">
<div className="flex items-center space-x-2 text-sm text-green-600">
<SafeIcon icon={FiShield} className="w-4 h-4" />
<span>{pageName} Access Granted</span>
</div>
<div className="flex items-center space-x-4">
<button
onClick={handleLogout}
className="text-xs text-red-600 hover:text-red-800 transition-colors px-2 py-1 rounded border border-red-200 hover:bg-red-50"
>
Logout
</button>
</div>
</div>
</div>
{children}
</div>
);
};

export default ProtectedPage;