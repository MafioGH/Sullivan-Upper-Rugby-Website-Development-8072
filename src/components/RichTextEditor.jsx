import React,{useState,useRef,useEffect} from 'react';
import * as FiIcons from 'react-icons/fi';
import SafeIcon from '../common/SafeIcon';

const {FiBold,FiItalic,FiUnderline,FiList,FiAlignLeft,FiAlignCenter,FiAlignRight,FiType,FiEye,FiEdit3,FiImage,FiLink,FiCode,FiVideo,FiPlay,FiMaximize2,FiMinimize2}=FiIcons;

const RichTextEditor=({value,onChange,placeholder="Enter your text..."})=> {
const [isPreviewMode,setIsPreviewMode]=useState(false);
const editorRef=useRef(null);
const [fontSize,setFontSize]=useState('14');
const [isEditorFocused,setIsEditorFocused]=useState(false);
const [showImageDialog,setShowImageDialog]=useState(false);
const [showVideoDialog,setShowVideoDialog]=useState(false);
const [showLinkDialog,setShowLinkDialog]=useState(false);
const [showVideoResizeDialog,setShowVideoResizeDialog]=useState(false);

// Image state
const [imageUrl,setImageUrl]=useState('');
const [imageAlt,setImageAlt]=useState('');
const [imageCaption,setImageCaption]=useState('');

// Video state
const [videoUrl,setVideoUrl]=useState('');
const [videoTitle,setVideoTitle]=useState('');
const [videoCaption,setVideoCaption]=useState('');
const [videoType,setVideoType]=useState('youtube');

// Link state
const [linkUrl,setLinkUrl]=useState('');
const [linkText,setLinkText]=useState('');

// Video resize state
const [selectedVideoElement,setSelectedVideoElement]=useState(null);
const [videoSize,setVideoSize]=useState('100');
const [videoAlignment,setVideoAlignment]=useState('center');

// Store cursor position with a more robust approach
const [savedSelection,setSavedSelection]=useState(null);

useEffect(()=> {
if (editorRef.current && !isPreviewMode) {
if (!isEditorFocused) {
editorRef.current.innerHTML=value || '';
}
}
},[value,isPreviewMode,isEditorFocused]);

// Enhanced cursor position saving
const saveCursorPosition=()=> {
if (!editorRef.current) return;

const selection=window.getSelection();
if (selection.rangeCount > 0) {
const range=selection.getRangeAt(0);
// Store both the range and additional context
const savedData={
range: range.cloneRange(),
containerOffset: getContainerOffset(range.startContainer,range.startOffset),
textContent: editorRef.current.textContent,
innerHTML: editorRef.current.innerHTML
};
setSavedSelection(savedData);
console.log('✅ Cursor position saved with context:',savedData.containerOffset);
}
};

// Helper function to get container offset for better position tracking
const getContainerOffset=(container,offset)=> {
const walker=document.createTreeWalker(
editorRef.current,
NodeFilter.SHOW_TEXT,
null,
false
);

let totalOffset=0;
let node=walker.nextNode();

while (node) {
if (node===container) {
return totalOffset + offset;
}
totalOffset +=node.textContent.length;
node=walker.nextNode();
}
return totalOffset;
};

// Enhanced cursor position restoration
const restoreCursorPosition=()=> {
if (!savedSelection || !editorRef.current) {
// Fallback: place cursor at end
editorRef.current?.focus();
const range=document.createRange();
range.selectNodeContents(editorRef.current);
range.collapse(false);
const selection=window.getSelection();
selection.removeAllRanges();
selection.addRange(range);
console.log('⚠️ Using fallback cursor position (end)');
return false;
}

try {
// First try to use the saved range directly
const selection=window.getSelection();
selection.removeAllRanges();

// Validate the range is still valid
if (savedSelection.range.startContainer.parentNode && editorRef.current.contains(savedSelection.range.startContainer)) {
selection.addRange(savedSelection.range);
editorRef.current.focus();
console.log('✅ Cursor position restored using saved range');
return true;
}

// Fallback: try to restore using text offset
const targetOffset=savedSelection.containerOffset;
const walker=document.createTreeWalker(
editorRef.current,
NodeFilter.SHOW_TEXT,
null,
false
);

let currentOffset=0;
let node=walker.nextNode();

while (node) {
const nodeLength=node.textContent.length;
if (currentOffset + nodeLength >=targetOffset) {
const range=document.createRange();
const offset=Math.min(targetOffset - currentOffset,nodeLength);
range.setStart(node,offset);
range.collapse(true);
selection.addRange(range);
editorRef.current.focus();
console.log('✅ Cursor position restored using text offset');
return true;
}
currentOffset +=nodeLength;
node=walker.nextNode();
}

throw new Error('Could not find target position');

} catch (e) {
console.warn('❌ Could not restore cursor position:',e);
// Ultimate fallback
editorRef.current?.focus();
const range=document.createRange();
range.selectNodeContents(editorRef.current);
range.collapse(false);
const selection=window.getSelection();
selection.removeAllRanges();
selection.addRange(range);
return false;
}
};

const executeCommand=(command,value=null)=> {
editorRef.current?.focus();
document.execCommand(command,false,value);
handleInput();
};

const handleInput=()=> {
if (editorRef.current) {
const content=editorRef.current.innerHTML;
onChange(content);
}
};

const handleKeyDown=(e)=> {
if (e.key==='Enter' && !e.shiftKey) {
e.preventDefault();
executeCommand('insertHTML','<br><br>');
}
};

const handleFocus=()=> {
setIsEditorFocused(true);
};

const handleBlur=()=> {
setIsEditorFocused(false);
handleInput();
};

const handleFontSizeChange=(size)=> {
setFontSize(size);
editorRef.current?.focus();
const selection=window.getSelection();
if (selection.rangeCount > 0) {
executeCommand('fontSize','7');
setTimeout(()=> {
if (editorRef.current) {
const fontElements=editorRef.current.querySelectorAll('font[size="7"]');
fontElements.forEach(el=> {
el.style.fontSize=size + 'px';
el.removeAttribute('size');
});
}
},10);
}
};

const insertParagraphBreak=()=> {
editorRef.current?.focus();
executeCommand('insertHTML','<p><br></p>');
};

const formatText=(format)=> {
editorRef.current?.focus();
switch (format) {
case 'bold':
executeCommand('bold');
break;
case 'italic':
executeCommand('italic');
break;
case 'underline':
executeCommand('underline');
break;
case 'alignLeft':
executeCommand('justifyLeft');
break;
case 'alignCenter':
executeCommand('justifyCenter');
break;
case 'alignRight':
executeCommand('justifyRight');
break;
case 'insertUnorderedList':
executeCommand('insertUnorderedList');
break;
case 'insertOrderedList':
executeCommand('insertOrderedList');
break;
default:
break;
}
};

const processVideoUrl=(url,videoType)=> {
if (!url) return url;

console.log(`Processing ${videoType} URL:`,url);

if (videoType==='youtube' || url.includes('youtube.com') || url.includes('youtu.be')) {
if (url.includes('youtube.com/watch?v=')) {
const videoId=new URLSearchParams(new URL(url).search).get('v');
if (videoId) {
return `https://www.youtube.com/embed/${videoId}`;
}
} else if (url.includes('youtu.be/')) {
const videoId=url.split('youtu.be/')[1].split('?')[0];
if (videoId) {
return `https://www.youtube.com/embed/${videoId}`;
}
}
return url;
}

if (videoType==='bunny' || url.includes('.b-cdn.net') || url.includes('iframe.mediadelivery.net')) {
console.log('Processing Bunny.net URL:',url);
if (url.includes('iframe.mediadelivery.net')) {
return url;
}
if (url.includes('.b-cdn.net')) {
const bunnyMatch=url.match(/https:\/\/([^.]+)\.b-cdn\.net\/([^/]+)\/([^/?]+)/);
if (bunnyMatch) {
const [,pullZone,libraryId,videoId]=bunnyMatch;
return `https://iframe.mediadelivery.net/embed/${libraryId}/${videoId.replace(/\.[^.]*$/,'')}`;
}
}
return url;
}

if (videoType==='dropbox' || url.includes('dropbox.com')) {
console.log('Processing Dropbox URL:',url);
let processedUrl=url;
if (url.includes('?dl=0')) {
processedUrl=url.replace('?dl=0','?dl=1');
} else if (url.includes('?dl=1')) {
processedUrl=url;
} else if (!url.includes('?dl=')) {
processedUrl=url + (url.includes('?') ? '&dl=1' : '?dl=1');
}

if (url.includes('dropbox.com/s/') && !url.includes('?')) {
processedUrl=url + '?dl=1';
}

if (url.includes('dropbox.com/s/')) {
const rawUrl=url.replace('dropbox.com','dl.dropboxusercontent.com').replace('?dl=0','').replace('?dl=1','');
console.log('Alternative Dropbox raw URL:',rawUrl);
return {
primary: processedUrl,
fallback: rawUrl
};
}

console.log('Processed Dropbox URL:',processedUrl);
return processedUrl;
}

if (url.includes('drive.google.com')) {
const fileIdMatch=url.match(/\/file\/d\/([a-zA-Z0-9_-]+)/);
if (fileIdMatch) {
const fileId=fileIdMatch[1];
return `https://drive.google.com/file/d/${fileId}/preview`;
}
}

if (url.includes('onedrive.live.com') || url.includes('1drv.ms')) {
if (url.includes('embed')) {
return url;
}
return url.replace('view','embed');
}

if (url.includes('vimeo.com')) {
const videoId=url.split('vimeo.com/')[1]?.split('?')[0];
if (videoId) {
return `https://player.vimeo.com/video/${videoId}`;
}
}

return url;
};

// ENHANCED: Insert content at saved cursor position with better handling
const insertAtCursor=(html)=> {
console.log('🎯 Inserting content at cursor position');

// Ensure editor is focused
editorRef.current?.focus();

// Try to restore the exact cursor position first
const restored=restoreCursorPosition();

// Small delay to ensure DOM is ready
setTimeout(()=> {
try {
// Use the browser's insertHTML command which respects cursor position
if (document.queryCommandSupported('insertHTML')) {
document.execCommand('insertHTML',false,html);
console.log('✅ Content inserted using execCommand');
} else {
// Fallback for browsers that don't support insertHTML
const selection=window.getSelection();
if (selection.rangeCount > 0) {
const range=selection.getRangeAt(0);
range.deleteContents();

// Create a document fragment from the HTML
const fragment=document.createRange().createContextualFragment(html);
range.insertNode(fragment);

// Move cursor after inserted content
range.collapse(false);
selection.removeAllRanges();
selection.addRange(range);
console.log('✅ Content inserted using range API');
}
}

// Clear saved selection after use
setSavedSelection(null);

// Update content
handleInput();

// CRITICAL: Add event listeners to newly inserted videos for resize functionality
// Use multiple timeouts to ensure DOM is fully updated
setTimeout(()=> {
addVideoEventListeners();
},100);
setTimeout(()=> {
addVideoEventListeners();
},500);
setTimeout(()=> {
addVideoEventListeners();
},1000);

} catch (error) {
console.error('❌ Error inserting content:',error);
// Ultimate fallback: append to current content
if (editorRef.current) {
editorRef.current.innerHTML +=html;
handleInput();
console.log('⚠️ Content appended as fallback');
// Add event listeners even in fallback
setTimeout(()=> {
addVideoEventListeners();
},100);
}
}
},10);
};

// ENHANCED: Add click event listeners to videos for resize functionality
const addVideoEventListeners=()=> {
if (!editorRef.current) {
console.log('❌ Editor ref not available');
return;
}

console.log('🔧 Adding video event listeners...');
const videoContainers=editorRef.current.querySelectorAll('.video-container');
console.log(`Found ${videoContainers.length} video containers`);

videoContainers.forEach((container,index)=> {
console.log(`Setting up container ${index + 1}`);

// Check if this container already has event listeners
if (container.dataset.listenersAdded==='true') {
console.log(`Container ${index + 1} already has listeners,skipping`);
return;
}

// Mark this container as having listeners
container.dataset.listenersAdded='true';

// Ensure container is positioned relatively for absolute positioning of resize button
if (getComputedStyle(container).position==='static') {
container.style.position='relative';
}

// Add resize button if not already present
if (!container.querySelector('.video-resize-btn')) {
console.log(`Adding resize button to container ${index + 1}`);
const resizeBtn=document.createElement('button');
resizeBtn.className='video-resize-btn';
resizeBtn.innerHTML='⚙️ Resize';
resizeBtn.title='Click to resize this video';
resizeBtn.type='button'; // Prevent form submission

// Enhanced button styling for better visibility
resizeBtn.style.cssText=`
position: absolute !important;
top: 8px !important;
right: 8px !important;
background: rgba(59,130,246,0.9) !important;
color: white !important;
border: 2px solid white !important;
border-radius: 6px !important;
padding: 6px 12px !important;
cursor: pointer !important;
font-size: 12px !important;
font-weight: 600 !important;
opacity: 0 !important;
transition: all 0.3s ease !important;
z-index: 100 !important;
box-shadow: 0 2px 8px rgba(0,0,0,0.3) !important;
user-select: none !important;
pointer-events: auto !important;
`;

container.appendChild(resizeBtn);

// Enhanced hover effects for better UX
const showResizeButton=()=> {
resizeBtn.style.opacity='1';
resizeBtn.style.transform='scale(1.05)';
};

const hideResizeButton=()=> {
resizeBtn.style.opacity='0';
resizeBtn.style.transform='scale(1)';
};

// Show/hide resize button on hover
container.addEventListener('mouseenter',showResizeButton);
container.addEventListener('mouseleave',hideResizeButton);

// Handle resize button click
resizeBtn.addEventListener('click',(e)=> {
e.preventDefault();
e.stopPropagation();
console.log('🎯 Resize button clicked for container',index + 1);
handleVideoResize(container);
});

// Add visual feedback on button hover
resizeBtn.addEventListener('mouseenter',()=> {
resizeBtn.style.background='rgba(37,99,235,1)';
resizeBtn.style.transform='scale(1.1)';
});

resizeBtn.addEventListener('mouseleave',()=> {
resizeBtn.style.background='rgba(59,130,246,0.9)';
resizeBtn.style.transform='scale(1.05)';
});
}

// Add visual indication that video is interactive
container.style.cursor='pointer';
container.style.border='2px solid transparent';
container.style.borderRadius='8px';

// Add hover effect to container
const handleContainerMouseEnter=()=> {
container.style.border='2px solid rgba(59,130,246,0.3)';
container.style.boxShadow='0 4px 20px rgba(59,130,246,0.2)';
};

const handleContainerMouseLeave=()=> {
container.style.border='2px solid transparent';
container.style.boxShadow='0 4px 12px rgba(0,0,0,0.1)';
};

container.addEventListener('mouseenter',handleContainerMouseEnter);
container.addEventListener('mouseleave',handleContainerMouseLeave);
});

console.log('✅ Video event listeners added successfully');
};

const handleVideoResize=(videoContainer)=> {
console.log('🔧 Opening video resize dialog');
setSelectedVideoElement(videoContainer);

// Extract current size and alignment from the container
const currentWidth=videoContainer.style.width || '100%';
const currentAlign=videoContainer.style.textAlign || 'center';

// Parse width percentage
const widthMatch=currentWidth.match(/(\d+)%?/);
const currentSize=widthMatch ? widthMatch[1] : '100';

console.log('Current video size:',currentSize + '%');
console.log('Current video alignment:',currentAlign);

setVideoSize(currentSize);
setVideoAlignment(currentAlign);
setShowVideoResizeDialog(true);
};

const applyVideoResize=()=> {
if (!selectedVideoElement) return;

console.log('✅ Applying video resize:',`${videoSize}%`,videoAlignment);

// Apply new size and alignment with enhanced styling
selectedVideoElement.style.width=`${videoSize}%`;
selectedVideoElement.style.textAlign=videoAlignment;
selectedVideoElement.style.margin='20px auto';
selectedVideoElement.style.display='block';

// Add visual feedback for the change
selectedVideoElement.style.transition='all 0.3s ease';
selectedVideoElement.style.transform='scale(1.02)';
setTimeout(()=> {
selectedVideoElement.style.transform='scale(1)';
},300);

// Update the content
handleInput();

// Close dialog
setShowVideoResizeDialog(false);
setSelectedVideoElement(null);

console.log('🎉 Video resized successfully');
};

// CRITICAL: Add event listeners when editor content changes
useEffect(()=> {
if (!isPreviewMode && editorRef.current) {
// Add multiple delays to ensure DOM is fully rendered
const timeouts=[100,300,500,1000].map(delay=>
setTimeout(()=> {
addVideoEventListeners();
},delay)
);

return ()=> {
timeouts.forEach(timeout=> clearTimeout(timeout));
};
}
},[value,isPreviewMode]);

// Also add listeners when switching from preview mode
useEffect(()=> {
if (!isPreviewMode && editorRef.current) {
setTimeout(()=> {
addVideoEventListeners();
},100);
}
},[isPreviewMode]);

// Add listeners when the component mounts or editor gets focus
useEffect(()=> {
if (editorRef.current && !isPreviewMode) {
const handleEditorClick=()=> {
setTimeout(()=> {
addVideoEventListeners();
},100);
};

editorRef.current.addEventListener('click',handleEditorClick);

return ()=> {
if (editorRef.current) {
editorRef.current.removeEventListener('click',handleEditorClick);
}
};
}
},[isPreviewMode]);

const insertImage=()=> {
if (!imageUrl.trim()) return;

const imageHtml=`
<div class="image-container" style="margin: 15px 0;text-align: center;">
<img src="${imageUrl}" alt="${imageAlt}" style="max-width: 100%;height: auto;border-radius: 8px;box-shadow: 0 2px 8px rgba(0,0,0,0.1);" />
${imageCaption ? `<div class="image-caption" style="font-size: 14px;color: #666;font-style: italic;margin-top: 8px;text-align: center;">${imageCaption}</div>` : ''}
</div>
`;

insertAtCursor(imageHtml);

setImageUrl('');
setImageAlt('');
setImageCaption('');
setShowImageDialog(false);
};

const insertVideo=()=> {
if (!videoUrl.trim()) return;

const processedUrl=processVideoUrl(videoUrl,videoType);
console.log('Final processed video URL:',processedUrl);

// Enhanced video HTML with proper structure and resize functionality
let videoHtml='';

if (videoType==='youtube' || (typeof processedUrl==='string' && processedUrl.includes('youtube.com/embed'))) {
videoHtml=`
<div class="video-container" style="width: 100%;aspect-ratio: 16/9;margin: 20px auto;position: relative;text-align: center;border-radius: 8px;overflow: hidden;box-shadow: 0 4px 12px rgba(0,0,0,0.1);">
<iframe src="${processedUrl}" title="${videoTitle}" style="width: 100%;height: 100%;border: none;" frameborder="0" allowfullscreen allow="accelerometer;autoplay;clipboard-write;encrypted-media;gyroscope;picture-in-picture">
</iframe>
</div>
${videoTitle ? `<div style="font-size: 16px;font-weight: 600;color: #333;margin: 5px 0;text-align: center;">${videoTitle}</div>` : ''}
${videoCaption ? `<div style="font-size: 14px;color: #666;font-style: italic;margin: 5px 0;text-align: center;">${videoCaption}</div>` : ''}
`;
} else if (videoType==='bunny' || (typeof processedUrl==='string' && (processedUrl.includes('.b-cdn.net') || processedUrl.includes('iframe.mediadelivery.net')))) {
if (processedUrl.includes('iframe.mediadelivery.net')) {
videoHtml=`
<div class="video-container" style="width: 100%;aspect-ratio: 16/9;margin: 20px auto;position: relative;text-align: center;border-radius: 8px;overflow: hidden;box-shadow: 0 4px 12px rgba(0,0,0,0.1);">
<iframe src="${processedUrl}" title="${videoTitle}" style="width: 100%;height: 100%;border: none;" frameborder="0" allowfullscreen allow="accelerometer;autoplay;clipboard-write;encrypted-media;gyroscope;picture-in-picture">
</iframe>
</div>
${videoTitle ? `<div style="font-size: 16px;font-weight: 600;color: #333;margin: 5px 0;text-align: center;">${videoTitle}</div>` : ''}
${videoCaption ? `<div style="font-size: 14px;color: #666;font-style: italic;margin: 5px 0;text-align: center;">${videoCaption}</div>` : ''}
`;
} else {
videoHtml=`
<div class="video-container" style="width: 100%;margin: 20px auto;position: relative;text-align: center;border-radius: 8px;overflow: hidden;box-shadow: 0 4px 12px rgba(0,0,0,0.1);">
<video controls style="width: 100%;height: auto;" preload="metadata" crossorigin="anonymous">
<source src="${processedUrl}" type="video/mp4">
<p style="color: #666;font-style: italic;">Your browser does not support the video tag. <a href="${processedUrl}" target="_blank" style="color: #2563eb;">Click here to view the video</a>.</p>
</video>
</div>
${videoTitle ? `<div style="font-size: 16px;font-weight: 600;color: #333;margin: 5px 0;text-align: center;">${videoTitle}</div>` : ''}
${videoCaption ? `<div style="font-size: 14px;color: #666;font-style: italic;margin: 5px 0;text-align: center;">${videoCaption}</div>` : ''}
`;
}
} else if (videoType==='vimeo' || (typeof processedUrl==='string' && processedUrl.includes('player.vimeo.com'))) {
videoHtml=`
<div class="video-container" style="width: 100%;aspect-ratio: 16/9;margin: 20px auto;position: relative;text-align: center;border-radius: 8px;overflow: hidden;box-shadow: 0 4px 12px rgba(0,0,0,0.1);">
<iframe src="${processedUrl}" title="${videoTitle}" style="width: 100%;height: 100%;border: none;" frameborder="0" allowfullscreen allow="autoplay;fullscreen;picture-in-picture">
</iframe>
</div>
${videoCaption ? `<div style="font-size: 14px;color: #666;font-style: italic;margin: 5px 0;text-align: center;">${videoCaption}</div>` : ''}
`;
} else if (videoType==='dropbox' || (typeof processedUrl==='string' && processedUrl.includes('dropbox'))) {
const urls=typeof processedUrl==='object' ? processedUrl : {primary: processedUrl};
videoHtml=`
<div class="video-container" style="width: 100%;margin: 20px auto;position: relative;text-align: center;border-radius: 8px;overflow: hidden;box-shadow: 0 4px 12px rgba(0,0,0,0.1);">
<video controls style="width: 100%;height: auto;" preload="metadata" crossorigin="anonymous" onError="this.style.display='none';this.nextElementSibling.style.display='flex';">
<source src="${urls.primary}" type="video/mp4">
${urls.fallback ? `<source src="${urls.fallback}" type="video/mp4">` : ''}
<p style="color: #666;font-style: italic;">Your browser does not support the video tag.</p>
</video>
<div style="display: none;width: 100%;height: 200px;flex-direction: column;align-items: center;justify-center;text-align: center;background: #f3f4f6;">
<div style="width: 64px;height: 64px;background: #9ca3af;border-radius: 50%;display: flex;align-items: center;justify-content: center;margin-bottom: 16px;">
<svg width="24" height="24" fill="currentColor" viewBox="0 0 24 24"><path d="M8 5v14l11-7z"/></svg>
</div>
<p style="color: #6b7280;margin-bottom: 16px;">Unable to preview this video directly.</p>
<a href="${urls.primary}" target="_blank" rel="noopener noreferrer" style="background: #2563eb;color: white;padding: 8px 16px;border-radius: 6px;text-decoration: none;display: inline-flex;align-items: center;gap: 8px;">
<span>Open Video</span>
</a>
</div>
</div>
${videoTitle ? `<div style="font-size: 16px;font-weight: 600;color: #333;margin: 5px 0;text-align: center;">${videoTitle}</div>` : ''}
${videoCaption ? `<div style="font-size: 14px;color: #666;font-style: italic;margin: 5px 0;text-align: center;">${videoCaption}</div>` : ''}
`;
} else if (videoType==='googledrive' || (typeof processedUrl==='string' && processedUrl.includes('drive.google.com'))) {
// PROTECTED: Google Drive videos - no popup,no download access
videoHtml=`
<div class="video-container google-drive-video" data-protected="true" style="width: 100%;aspect-ratio: 16/9;margin: 20px auto;position: relative;text-align: center;border-radius: 8px;overflow: hidden;box-shadow: 0 4px 12px rgba(0,0,0,0.1);">
<iframe src="${processedUrl}" title="${videoTitle}" style="width: 100%;height: 100%;border: none;" frameborder="0" allowfullscreen allow="autoplay">
</iframe>
</div>
${videoCaption ? `<div style="font-size: 14px;color: #666;font-style: italic;margin: 5px 0;text-align: center;">${videoCaption}</div>` : ''}
`;
} else if ((typeof processedUrl==='string' && processedUrl.match(/\.(mp4|webm|ogg|mov|avi|wmv)(\?.*)?$/i))) {
videoHtml=`
<div class="video-container" style="width: 100%;margin: 20px auto;position: relative;text-align: center;border-radius: 8px;overflow: hidden;box-shadow: 0 4px 12px rgba(0,0,0,0.1);">
<video controls style="width: 100%;height: auto;" preload="metadata">
<source src="${processedUrl}">
<p style="color: #666;font-style: italic;">Your browser does not support the video tag.</p>
</video>
</div>
${videoTitle ? `<div style="font-size: 16px;font-weight: 600;color: #333;margin: 5px 0;text-align: center;">${videoTitle}</div>` : ''}
${videoCaption ? `<div style="font-size: 14px;color: #666;font-style: italic;margin: 5px 0;text-align: center;">${videoCaption}</div>` : ''}
`;
} else {
videoHtml=`
<div class="video-container" style="width: 100%;aspect-ratio: 16/9;margin: 20px auto;position: relative;text-align: center;border-radius: 8px;overflow: hidden;box-shadow: 0 4px 12px rgba(0,0,0,0.1);">
<iframe src="${typeof processedUrl==='object' ? processedUrl.primary : processedUrl}" title="${videoTitle}" style="width: 100%;height: 100%;border: none;" frameborder="0" allowfullscreen>
</iframe>
</div>
${videoCaption ? `<div style="font-size: 14px;color: #666;font-style: italic;margin: 5px 0;text-align: center;">${videoCaption}</div>` : ''}
`;
}

insertAtCursor(videoHtml);

setVideoUrl('');
setVideoTitle('');
setVideoCaption('');
setVideoType('youtube');
setShowVideoDialog(false);
};

const insertLink=()=> {
if (!linkUrl.trim() || !linkText.trim()) return;

const linkHtml=`<a href="${linkUrl}" target="_blank" rel="noopener noreferrer" style="color: #2563eb;text-decoration: underline;">${linkText}</a>`;

insertAtCursor(linkHtml);

setLinkUrl('');
setLinkText('');
setShowLinkDialog(false);
};

const insertDivider=()=> {
const dividerHtml='<hr style="margin: 20px 0;border: none;border-top: 2px solid #e5e7eb;border-radius: 2px;" />';

editorRef.current?.focus();
executeCommand('insertHTML',dividerHtml);
};

const cleanHTML=(html)=> {
return html
.replace(/<div><br><\/div>/g,'<br>')
.replace(/<div>/g,'<p>')
.replace(/<\/div>/g,'</p>')
.replace(/<br><br>/g,'</p><p>')
.replace(/^<p><\/p>/,'')
.replace(/<p><\/p>$/g,'');
};

const handleToolbarClick=(e,action,...args)=> {
e.preventDefault();
e.stopPropagation();
action(...args);
};

const handleOpenImageDialog=()=> {
saveCursorPosition();
setShowImageDialog(true);
};

const handleOpenVideoDialog=()=> {
saveCursorPosition();
setShowVideoDialog(true);
};

const handleOpenLinkDialog=()=> {
saveCursorPosition();
setShowLinkDialog(true);
};

return (
<div className="border border-gray-300 rounded-lg overflow-hidden">
{/* Toolbar */}
<div className="bg-gray-50 border-b border-gray-300 p-2 flex flex-wrap items-center gap-2">
{/* Text Formatting */}
<div className="flex items-center space-x-1 border-r border-gray-300 pr-2">
<button
type="button"
onMouseDown={(e)=> handleToolbarClick(e,formatText,'bold')}
className="p-2 hover:bg-gray-200 rounded transition-colors"
title="Bold"
>
<SafeIcon icon={FiBold} className="w-4 h-4" />
</button>
<button
type="button"
onMouseDown={(e)=> handleToolbarClick(e,formatText,'italic')}
className="p-2 hover:bg-gray-200 rounded transition-colors"
title="Italic"
>
<SafeIcon icon={FiItalic} className="w-4 h-4" />
</button>
<button
type="button"
onMouseDown={(e)=> handleToolbarClick(e,formatText,'underline')}
className="p-2 hover:bg-gray-200 rounded transition-colors"
title="Underline"
>
<SafeIcon icon={FiUnderline} className="w-4 h-4" />
</button>
</div>

{/* Alignment */}
<div className="flex items-center space-x-1 border-r border-gray-300 pr-2">
<button
type="button"
onMouseDown={(e)=> handleToolbarClick(e,formatText,'alignLeft')}
className="p-2 hover:bg-gray-200 rounded transition-colors"
title="Align Left"
>
<SafeIcon icon={FiAlignLeft} className="w-4 h-4" />
</button>
<button
type="button"
onMouseDown={(e)=> handleToolbarClick(e,formatText,'alignCenter')}
className="p-2 hover:bg-gray-200 rounded transition-colors"
title="Align Center"
>
<SafeIcon icon={FiAlignCenter} className="w-4 h-4" />
</button>
<button
type="button"
onMouseDown={(e)=> handleToolbarClick(e,formatText,'alignRight')}
className="p-2 hover:bg-gray-200 rounded transition-colors"
title="Align Right"
>
<SafeIcon icon={FiAlignRight} className="w-4 h-4" />
</button>
</div>

{/* Lists */}
<div className="flex items-center space-x-1 border-r border-gray-300 pr-2">
<button
type="button"
onMouseDown={(e)=> handleToolbarClick(e,formatText,'insertUnorderedList')}
className="p-2 hover:bg-gray-200 rounded transition-colors"
title="Bullet List"
>
<SafeIcon icon={FiList} className="w-4 h-4" />
</button>
<button
type="button"
onMouseDown={(e)=> handleToolbarClick(e,formatText,'insertOrderedList')}
className="p-2 hover:bg-gray-200 rounded transition-colors"
title="Numbered List"
>
<span className="text-sm font-bold">1.</span>
</button>
</div>

{/* Font Size */}
<div className="flex items-center space-x-2 border-r border-gray-300 pr-2">
<SafeIcon icon={FiType} className="w-4 h-4 text-gray-600" />
<select
value={fontSize}
onChange={(e)=> handleFontSizeChange(e.target.value)}
onMouseDown={(e)=> e.stopPropagation()}
className="text-sm border border-gray-300 rounded px-2 py-1 focus:outline-none focus:ring-1 focus:ring-blue-500"
>
<option value="10">10px</option>
<option value="12">12px</option>
<option value="14">14px</option>
<option value="16">16px</option>
<option value="18">18px</option>
<option value="20">20px</option>
<option value="24">24px</option>
<option value="28">28px</option>
<option value="32">32px</option>
</select>
</div>

{/* Media & Links */}
<div className="flex items-center space-x-1 border-r border-gray-300 pr-2">
<button
type="button"
onClick={(e)=> handleToolbarClick(e,handleOpenImageDialog)}
className="p-2 hover:bg-gray-200 rounded transition-colors"
title="Insert Image"
>
<SafeIcon icon={FiImage} className="w-4 h-4" />
</button>
<button
type="button"
onClick={(e)=> handleToolbarClick(e,handleOpenVideoDialog)}
className="p-2 hover:bg-gray-200 rounded transition-colors"
title="Insert Video"
>
<SafeIcon icon={FiVideo} className="w-4 h-4" />
</button>
<button
type="button"
onClick={(e)=> handleToolbarClick(e,handleOpenLinkDialog)}
className="p-2 hover:bg-gray-200 rounded transition-colors"
title="Insert Link"
>
<SafeIcon icon={FiLink} className="w-4 h-4" />
</button>
<button
type="button"
onMouseDown={(e)=> handleToolbarClick(e,insertDivider)}
className="p-2 hover:bg-gray-200 rounded transition-colors text-sm"
title="Insert Divider"
>
━
</button>
</div>

{/* Paragraph Break */}
<div className="flex items-center space-x-1 border-r border-gray-300 pr-2">
<button
type="button"
onMouseDown={(e)=> handleToolbarClick(e,insertParagraphBreak)}
className="p-2 hover:bg-gray-200 rounded transition-colors text-sm"
title="Insert Paragraph Break"
>
¶
</button>
</div>

{/* Preview Toggle */}
<div className="ml-auto">
<button
type="button"
onClick={(e)=> {
e.preventDefault();
setIsPreviewMode(!isPreviewMode);
}}
className={`p-2 rounded transition-colors flex items-center space-x-1 ${
isPreviewMode
? 'bg-blue-100 text-blue-600 hover:bg-blue-200'
: 'hover:bg-gray-200'
}`}
title={isPreviewMode ? "Edit Mode" : "Preview Mode"}
>
<SafeIcon icon={isPreviewMode ? FiEdit3 : FiEye} className="w-4 h-4" />
<span className="text-sm">{isPreviewMode ? 'Edit' : 'Preview'}</span>
</button>
</div>
</div>

{/* Editor/Preview Area */}
<div className="min-h-[200px] max-h-[400px] overflow-y-auto">
{isPreviewMode ? (
<div
className="p-4 prose max-w-none"
dangerouslySetInnerHTML={{__html: cleanHTML(value || '')}}
/>
) : (
<div
ref={editorRef}
contentEditable
onInput={handleInput}
onKeyDown={handleKeyDown}
onFocus={handleFocus}
onBlur={handleBlur}
className="p-4 min-h-[200px] focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-inset"
style={{fontSize: '14px',lineHeight: '1.6'}}
data-placeholder={placeholder}
suppressContentEditableWarning={true}
/>
)}
</div>

{/* Helper Text */}
<div className="bg-gray-50 border-t border-gray-300 px-4 py-2">
<p className="text-xs text-gray-500">
{isPreviewMode
? "Preview mode - switch to Edit to make changes"
: "Use the toolbar to format text,insert images/videos,and add links. Hover over videos to see the resize button. Press Enter for line breaks,use ¶ for paragraph breaks."}
</p>
</div>

{/* Video Resize Dialog */}
{showVideoResizeDialog && (
<div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
<div className="bg-white rounded-lg p-6 w-full max-w-md mx-4">
<h3 className="text-lg font-semibold mb-4 flex items-center space-x-2">
<SafeIcon icon={FiMaximize2} className="w-5 h-5" />
<span>Resize Video</span>
</h3>

<div className="space-y-4">
<div>
<label className="block text-sm font-medium text-gray-700 mb-2">
Video Width
</label>
<div className="flex items-center space-x-4">
<input
type="range"
min="25"
max="100"
step="5"
value={videoSize}
onChange={(e)=> setVideoSize(e.target.value)}
className="flex-1"
/>
<span className="text-sm font-medium text-gray-600 min-w-[3rem]">
{videoSize}%
</span>
</div>
<div className="flex justify-between text-xs text-gray-500 mt-1">
<span>Smaller (more white space)</span>
<span>Larger (less white space)</span>
</div>
</div>

<div>
<label className="block text-sm font-medium text-gray-700 mb-2">
Alignment
</label>
<div className="flex space-x-2">
<button
type="button"
onClick={()=> setVideoAlignment('left')}
className={`px-3 py-2 rounded text-sm ${
videoAlignment==='left'
? 'bg-blue-600 text-white'
: 'bg-gray-200 text-gray-700 hover:bg-gray-300'
}`}
>
Left
</button>
<button
type="button"
onClick={()=> setVideoAlignment('center')}
className={`px-3 py-2 rounded text-sm ${
videoAlignment==='center'
? 'bg-blue-600 text-white'
: 'bg-gray-200 text-gray-700 hover:bg-gray-300'
}`}
>
Center
</button>
<button
type="button"
onClick={()=> setVideoAlignment('right')}
className={`px-3 py-2 rounded text-sm ${
videoAlignment==='right'
? 'bg-blue-600 text-white'
: 'bg-gray-200 text-gray-700 hover:bg-gray-300'
}`}
>
Right
</button>
</div>
</div>

<div className="bg-blue-50 p-3 rounded-lg">
<p className="text-sm text-blue-700">
<strong>Preview:</strong> Video will be {videoSize}% width,aligned {videoAlignment}.
{parseInt(videoSize) < 100 && " This creates white space around the video for a cleaner layout in match reports."}
</p>
</div>
</div>

<div className="flex space-x-3 mt-6">
<button
type="button"
onClick={applyVideoResize}
className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
>
Apply Changes
</button>
<button
type="button"
onClick={()=> {
setShowVideoResizeDialog(false);
setSelectedVideoElement(null);
}}
className="bg-gray-500 text-white px-4 py-2 rounded-lg hover:bg-gray-600 transition-colors"
>
Cancel
</button>
</div>
</div>
</div>
)}

{/* Image Dialog */}
{showImageDialog && (
<div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
<div className="bg-white rounded-lg p-6 w-full max-w-md mx-4">
<h3 className="text-lg font-semibold mb-4 flex items-center space-x-2">
<SafeIcon icon={FiImage} className="w-5 h-5" />
<span>Insert Image</span>
</h3>

<div className="space-y-4">
<div>
<label className="block text-sm font-medium text-gray-700 mb-1">
Image URL *
</label>
<input
type="url"
value={imageUrl}
onChange={(e)=> setImageUrl(e.target.value)}
className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
placeholder="https://example.com/image.jpg"
required
/>
</div>

<div>
<label className="block text-sm font-medium text-gray-700 mb-1">
Alt Text
</label>
<input
type="text"
value={imageAlt}
onChange={(e)=> setImageAlt(e.target.value)}
className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
placeholder="Describe the image for accessibility"
/>
</div>

<div>
<label className="block text-sm font-medium text-gray-700 mb-1">
Caption (Optional)
</label>
<input
type="text"
value={imageCaption}
onChange={(e)=> setImageCaption(e.target.value)}
className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
placeholder="Image caption or description"
/>
</div>
</div>

<div className="flex space-x-3 mt-6">
<button
onClick={insertImage}
disabled={!imageUrl.trim()}
className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
>
Insert Image
</button>
<button
onClick={()=> {
setShowImageDialog(false);
setImageUrl('');
setImageAlt('');
setImageCaption('');
setSavedSelection(null);
}}
className="bg-gray-500 text-white px-4 py-2 rounded-lg hover:bg-gray-600 transition-colors"
>
Cancel
</button>
</div>
</div>
</div>
)}

{/* Video Dialog */}
{showVideoDialog && (
<div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
<div className="bg-white rounded-lg p-6 w-full max-w-lg mx-4 max-h-[90vh] overflow-y-auto">
<h3 className="text-lg font-semibold mb-4 flex items-center space-x-2">
<SafeIcon icon={FiVideo} className="w-5 h-5" />
<span>Insert Video</span>
</h3>

<div className="space-y-4">
<div>
<label className="block text-sm font-medium text-gray-700 mb-1">
Video Source *
</label>
<select
value={videoType}
onChange={(e)=> setVideoType(e.target.value)}
className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
>
<option value="youtube">YouTube</option>
<option value="vimeo">Vimeo</option>
<option value="bunny">Bunny.net</option>
<option value="dropbox">Dropbox</option>
<option value="googledrive">Google Drive (Protected)</option>
<option value="onedrive">OneDrive</option>
<option value="direct">Direct Video URL (.mp4,etc.)</option>
<option value="other">Other (Custom Embed)</option>
</select>
</div>

<div>
<label className="block text-sm font-medium text-gray-700 mb-1">
Video URL *
</label>
<input
type="url"
value={videoUrl}
onChange={(e)=> setVideoUrl(e.target.value)}
className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
placeholder={
videoType==='youtube' ? 'https://www.youtube.com/watch?v=VIDEO_ID' :
videoType==='vimeo' ? 'https://vimeo.com/VIDEO_ID' :
videoType==='bunny' ? 'https://iframe.mediadelivery.net/embed/LIBRARY_ID/VIDEO_ID or https://your-zone.b-cdn.net/video.mp4' :
videoType==='dropbox' ? 'https://www.dropbox.com/s/abc123/video.mp4?dl=0' :
videoType==='googledrive' ? 'https://drive.google.com/file/d/FILE_ID/view' :
videoType==='direct' ? 'https://example.com/video.mp4' :
'https://example.com/video-url'
}
required
/>
<div className="mt-2 p-3 bg-blue-50 rounded-md">
<div className="flex items-start space-x-2">
<SafeIcon icon={FiPlay} className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
<div className="text-sm text-blue-700">
{videoType==='youtube' && (
<div>
<p><strong>YouTube:</strong> Enter any YouTube URL</p>
<p className="text-xs mt-1">• https://www.youtube.com/watch?v=VIDEO_ID</p>
<p className="text-xs">• https://youtu.be/VIDEO_ID</p>
</div>
)}
{videoType==='vimeo' && (
<div>
<p><strong>Vimeo:</strong> Enter a Vimeo video URL</p>
<p className="text-xs mt-1">• https://vimeo.com/VIDEO_ID</p>
</div>
)}
{videoType==='bunny' && (
<div>
<p><strong>Bunny.net:</strong> Your video hosting provider</p>
<p className="text-xs mt-1"><strong>Iframe URL (Recommended):</strong></p>
<p className="text-xs">• https://iframe.mediadelivery.net/embed/LIBRARY_ID/VIDEO_ID</p>
<p className="text-xs mt-1"><strong>Direct Video URL:</strong></p>
<p className="text-xs">• https://your-pull-zone.b-cdn.net/video.mp4</p>
<p className="text-xs mt-1 text-blue-600">💡 Use iframe URLs for better player controls and streaming</p>
</div>
)}
{videoType==='dropbox' && (
<div>
<p><strong>Dropbox:</strong> Upload video and share link</p>
<p className="text-xs mt-1">1. Upload video to Dropbox</p>
<p className="text-xs">2. Right-click → Share → Copy link</p>
<p className="text-xs">3. Paste any Dropbox share URL here</p>
<p className="text-xs mt-1 text-amber-600">⚠️ Large videos may load slowly</p>
</div>
)}
{videoType==='googledrive' && (
<div>
<p><strong>Google Drive (Protected):</strong> Share video with public access</p>
<p className="text-xs mt-1">1. Upload to Google Drive</p>
<p className="text-xs">2. Share → Anyone with link can view</p>
<p className="text-xs">3. Copy and paste the link</p>
<p className="text-xs mt-1 text-green-600">🔒 Protected: No download options will be shown to viewers</p>
</div>
)}
{videoType==='direct' && (
<div>
<p><strong>Direct Video:</strong> Link to video file</p>
<p className="text-xs mt-1">Supports: .mp4,.webm,.ogg,.mov,etc.</p>
</div>
)}
{videoType==='other' && (
<p><strong>Other:</strong> Enter any video URL or embed URL</p>
)}
</div>
</div>
</div>
</div>

<div>
<label className="block text-sm font-medium text-gray-700 mb-1">
Video Title (Optional)
</label>
<input
type="text"
value={videoTitle}
onChange={(e)=> setVideoTitle(e.target.value)}
className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
placeholder="e.g.,Match Highlights vs Opponent"
/>
</div>

<div>
<label className="block text-sm font-medium text-gray-700 mb-1">
Caption (Optional)
</label>
<input
type="text"
value={videoCaption}
onChange={(e)=> setVideoCaption(e.target.value)}
className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
placeholder="Video description or context"
/>
</div>

<div className="bg-green-50 p-3 rounded-lg">
<div className="flex items-start space-x-2">
<SafeIcon icon={FiMaximize2} className="w-4 h-4 text-green-600 flex-shrink-0 mt-0.5" />
<div className="text-sm text-green-700">
<p><strong>💡 Pro Tip:</strong> After inserting the video,hover over it to see the "⚙️ Resize" button. Click it to adjust the video size and create white space around it for better layout in your match reports!</p>
</div>
</div>
</div>
</div>

<div className="flex space-x-3 mt-6">
<button
onClick={insertVideo}
disabled={!videoUrl.trim()}
className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
>
Insert Video
</button>
<button
onClick={()=> {
setShowVideoDialog(false);
setVideoUrl('');
setVideoTitle('');
setVideoCaption('');
setVideoType('youtube');
setSavedSelection(null);
}}
className="bg-gray-500 text-white px-4 py-2 rounded-lg hover:bg-gray-600 transition-colors"
>
Cancel
</button>
</div>
</div>
</div>
)}

{/* Link Dialog */}
{showLinkDialog && (
<div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
<div className="bg-white rounded-lg p-6 w-full max-w-md mx-4">
<h3 className="text-lg font-semibold mb-4 flex items-center space-x-2">
<SafeIcon icon={FiLink} className="w-5 h-5" />
<span>Insert Link</span>
</h3>

<div className="space-y-4">
<div>
<label className="block text-sm font-medium text-gray-700 mb-1">
Link Text *
</label>
<input
type="text"
value={linkText}
onChange={(e)=> setLinkText(e.target.value)}
className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
placeholder="Text to display"
required
/>
</div>

<div>
<label className="block text-sm font-medium text-gray-700 mb-1">
URL *
</label>
<input
type="url"
value={linkUrl}
onChange={(e)=> setLinkUrl(e.target.value)}
className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
placeholder="https://example.com"
required
/>
</div>
</div>

<div className="flex space-x-3 mt-6">
<button
onClick={insertLink}
disabled={!linkUrl.trim() || !linkText.trim()}
className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
>
Insert Link
</button>
<button
onClick={()=> {
setShowLinkDialog(false);
setLinkUrl('');
setLinkText('');
setSavedSelection(null);
}}
className="bg-gray-500 text-white px-4 py-2 rounded-lg hover:bg-gray-600 transition-colors"
>
Cancel
</button>
</div>
</div>
</div>
)}

<style jsx>{`
[contenteditable]:empty:before {
content: attr(data-placeholder);
color: #9ca3af;
font-style: italic;
}

.prose p {
margin-bottom: 0.75em;
}

.prose ul,.prose ol {
margin: 0.75em 0;
padding-left: 1.5em;
}

.prose li {
margin-bottom: 0.25em;
}

.prose strong {
font-weight: 600;
}

.prose em {
font-style: italic;
}

.prose u {
text-decoration: underline;
}

.prose .image-container {
margin: 15px 0;
text-align: center;
}

.prose .image-container img {
max-width: 100%;
height: auto;
border-radius: 8px;
box-shadow: 0 2px 8px rgba(0,0,0,0.1);
}

.prose .image-caption {
font-size: 14px;
color: #666;
font-style: italic;
margin-top: 8px;
text-align: center;
}

.prose a {
color: #2563eb;
text-decoration: underline;
}

.prose a:hover {
text-decoration: none;
}

.prose hr {
margin: 20px 0;
border: none;
border-top: 2px solid #e5e7eb;
border-radius: 2px;
}

.prose .video-container {
position: relative;
margin: 20px auto;
border-radius: 8px;
overflow: hidden;
box-shadow: 0 4px 12px rgba(0,0,0,0.1);
transition: all 0.3s ease;
}

.prose .video-container:hover {
box-shadow: 0 4px 20px rgba(59,130,246,0.2);
}

.prose .video-container:hover .video-resize-btn {
opacity: 1 !important;
}

/* Google Drive videos should not show popup */
.prose .video-container.google-drive-video {
pointer-events: auto;
}

.prose .video-container.google-drive-video iframe {
pointer-events: auto;
}

/* FIXED: Better headline styling that works with videos */
.prose h1, .prose h2, .prose h3, .prose h4, .prose h5, .prose h6 {
font-weight: 600 !important;
color: #1f2937 !important;
margin-top: 1.25em !important;
margin-bottom: 0.5em !important;
line-height: 1.2 !important;
}

.prose h1 {
font-size: 1.5em !important;
}

.prose h2 {
font-size: 1.3em !important;
}

.prose h3 {
font-size: 1.1em !important;
}

/* Ensure headlines don't interfere with video containers */
.prose h1 + .video-container,
.prose h2 + .video-container,
.prose h3 + .video-container {
margin-top: 1em !important;
}

.prose .video-container + h1,
.prose .video-container + h2,
.prose .video-container + h3 {
margin-top: 1.5em !important;
}
`}</style>
</div>
);
};

export default RichTextEditor;