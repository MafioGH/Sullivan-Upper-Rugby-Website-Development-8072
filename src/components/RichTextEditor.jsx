import React, { useState, useRef, useEffect } from 'react';
import * as FiIcons from 'react-icons/fi';
import SafeIcon from '../common/SafeIcon';

const { FiBold, FiItalic, FiUnderline, FiList, FiAlignLeft, FiAlignCenter, FiAlignRight, FiType, FiEye, FiEdit3 } = FiIcons;

const RichTextEditor = ({ value, onChange, placeholder = "Enter your text..." }) => {
  const [isPreviewMode, setIsPreviewMode] = useState(false);
  const editorRef = useRef(null);
  const [fontSize, setFontSize] = useState('14');
  const [isEditorFocused, setIsEditorFocused] = useState(false);

  useEffect(() => {
    if (editorRef.current && !isPreviewMode) {
      // Only update content if the editor is not currently focused to prevent cursor jumping
      if (!isEditorFocused) {
        editorRef.current.innerHTML = value || '';
      }
    }
  }, [value, isPreviewMode, isEditorFocused]);

  const executeCommand = (command, value = null) => {
    // Prevent default behavior and ensure editor maintains focus
    editorRef.current?.focus();
    document.execCommand(command, false, value);
    handleInput();
  };

  const handleInput = () => {
    if (editorRef.current) {
      const content = editorRef.current.innerHTML;
      onChange(content);
    }
  };

  const handleKeyDown = (e) => {
    // Handle Enter key for line breaks
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      executeCommand('insertHTML', '<br><br>');
    }
  };

  const handleFocus = () => {
    setIsEditorFocused(true);
  };

  const handleBlur = () => {
    setIsEditorFocused(false);
    handleInput(); // Save content when losing focus
  };

  const handleFontSizeChange = (size) => {
    setFontSize(size);
    editorRef.current?.focus();
    
    const selection = window.getSelection();
    if (selection.rangeCount > 0) {
      const range = selection.getRangeAt(0);
      if (!range.collapsed) {
        executeCommand('fontSize', '7'); // Temporary
        // Apply custom font size via CSS
        setTimeout(() => {
          if (editorRef.current) {
            const fontElements = editorRef.current.querySelectorAll('font[size="7"]');
            fontElements.forEach(el => {
              el.style.fontSize = size + 'px';
              el.removeAttribute('size');
            });
          }
        }, 10);
      }
    }
  };

  const insertParagraphBreak = () => {
    editorRef.current?.focus();
    executeCommand('insertHTML', '<p><br></p>');
  };

  const formatText = (format) => {
    // Ensure editor is focused before executing commands
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

  const cleanHTML = (html) => {
    // Clean up the HTML for better display
    return html
      .replace(/<div><br><\/div>/g, '<br>')
      .replace(/<div>/g, '<p>')
      .replace(/<\/div>/g, '</p>')
      .replace(/<br><br>/g, '</p><p>')
      .replace(/^<p><\/p>/, '')
      .replace(/<p><\/p>$/g, '');
  };

  // Handle toolbar button clicks to prevent form submission and focus issues
  const handleToolbarClick = (e, action, ...args) => {
    e.preventDefault();
    e.stopPropagation();
    action(...args);
  };

  return (
    <div className="border border-gray-300 rounded-lg overflow-hidden">
      {/* Toolbar */}
      <div className="bg-gray-50 border-b border-gray-300 p-2 flex flex-wrap items-center gap-2">
        <div className="flex items-center space-x-1 border-r border-gray-300 pr-2">
          <button
            type="button"
            onMouseDown={(e) => handleToolbarClick(e, formatText, 'bold')}
            className="p-2 hover:bg-gray-200 rounded transition-colors"
            title="Bold"
          >
            <SafeIcon icon={FiBold} className="w-4 h-4" />
          </button>
          <button
            type="button"
            onMouseDown={(e) => handleToolbarClick(e, formatText, 'italic')}
            className="p-2 hover:bg-gray-200 rounded transition-colors"
            title="Italic"
          >
            <SafeIcon icon={FiItalic} className="w-4 h-4" />
          </button>
          <button
            type="button"
            onMouseDown={(e) => handleToolbarClick(e, formatText, 'underline')}
            className="p-2 hover:bg-gray-200 rounded transition-colors"
            title="Underline"
          >
            <SafeIcon icon={FiUnderline} className="w-4 h-4" />
          </button>
        </div>

        <div className="flex items-center space-x-1 border-r border-gray-300 pr-2">
          <button
            type="button"
            onMouseDown={(e) => handleToolbarClick(e, formatText, 'alignLeft')}
            className="p-2 hover:bg-gray-200 rounded transition-colors"
            title="Align Left"
          >
            <SafeIcon icon={FiAlignLeft} className="w-4 h-4" />
          </button>
          <button
            type="button"
            onMouseDown={(e) => handleToolbarClick(e, formatText, 'alignCenter')}
            className="p-2 hover:bg-gray-200 rounded transition-colors"
            title="Align Center"
          >
            <SafeIcon icon={FiAlignCenter} className="w-4 h-4" />
          </button>
          <button
            type="button"
            onMouseDown={(e) => handleToolbarClick(e, formatText, 'alignRight')}
            className="p-2 hover:bg-gray-200 rounded transition-colors"
            title="Align Right"
          >
            <SafeIcon icon={FiAlignRight} className="w-4 h-4" />
          </button>
        </div>

        <div className="flex items-center space-x-1 border-r border-gray-300 pr-2">
          <button
            type="button"
            onMouseDown={(e) => handleToolbarClick(e, formatText, 'insertUnorderedList')}
            className="p-2 hover:bg-gray-200 rounded transition-colors"
            title="Bullet List"
          >
            <SafeIcon icon={FiList} className="w-4 h-4" />
          </button>
          <button
            type="button"
            onMouseDown={(e) => handleToolbarClick(e, formatText, 'insertOrderedList')}
            className="p-2 hover:bg-gray-200 rounded transition-colors"
            title="Numbered List"
          >
            <span className="text-sm font-bold">1.</span>
          </button>
        </div>

        <div className="flex items-center space-x-2 border-r border-gray-300 pr-2">
          <SafeIcon icon={FiType} className="w-4 h-4 text-gray-600" />
          <select
            value={fontSize}
            onChange={(e) => handleFontSizeChange(e.target.value)}
            onMouseDown={(e) => e.stopPropagation()}
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

        <div className="flex items-center space-x-1">
          <button
            type="button"
            onMouseDown={(e) => handleToolbarClick(e, insertParagraphBreak)}
            className="p-2 hover:bg-gray-200 rounded transition-colors text-sm"
            title="Insert Paragraph Break"
          >
            ¶
          </button>
        </div>

        <div className="ml-auto">
          <button
            type="button"
            onClick={(e) => {
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
            dangerouslySetInnerHTML={{ __html: cleanHTML(value || '') }}
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
            style={{ 
              fontSize: '14px',
              lineHeight: '1.6'
            }}
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
            : "Use the toolbar to format text. Press Enter for line breaks, use ¶ for paragraph breaks."
          }
        </p>
      </div>

      <style jsx>{`
        [contenteditable]:empty:before {
          content: attr(data-placeholder);
          color: #9ca3af;
          font-style: italic;
        }
        
        .prose p {
          margin-bottom: 0.75em;
        }
        
        .prose ul, .prose ol {
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
      `}</style>
    </div>
  );
};

export default RichTextEditor;