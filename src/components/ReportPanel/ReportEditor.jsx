// components/ReportPanel/ReportEditor.jsx
import React, { useState, useRef, useEffect } from "react";
import {
  Bold,
  Italic,
  Underline,
  List,
  AlignLeft,
  Save,
  Undo,
  Redo,
} from "lucide-react";

const ReportEditor = ({
  content,
  onChange,
  placeholder = "Enter your report here...",
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [history, setHistory] = useState([content]);
  const [historyIndex, setHistoryIndex] = useState(0);
  const editorRef = useRef(null);
  const timeoutRef = useRef(null);

  useEffect(() => {
    if (editorRef.current) {
      editorRef.current.innerHTML = content || "";
    }
  }, [content]);

  const handleInput = () => {
    const newContent = editorRef.current.innerHTML;
    onChange(newContent);

    // Debounced history saving
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    timeoutRef.current = setTimeout(() => {
      setHistory((prev) => {
        const newHistory = prev.slice(0, historyIndex + 1);
        newHistory.push(newContent);
        return newHistory.slice(-50); // Keep last 50 states
      });
      setHistoryIndex((prev) => Math.min(prev + 1, 49));
    }, 1000);
  };

  const handleFormatting = (command, value = null) => {
    document.execCommand(command, false, value);
    editorRef.current.focus();
    handleInput();
  };

  const handleUndo = () => {
    if (historyIndex > 0) {
      const newIndex = historyIndex - 1;
      const content = history[newIndex];
      setHistoryIndex(newIndex);
      editorRef.current.innerHTML = content;
      onChange(content);
    }
  };

  const handleRedo = () => {
    if (historyIndex < history.length - 1) {
      const newIndex = historyIndex + 1;
      const content = history[newIndex];
      setHistoryIndex(newIndex);
      editorRef.current.innerHTML = content;
      onChange(content);
    }
  };

  const insertTemplate = (template) => {
    const selection = window.getSelection();
    if (selection.rangeCount > 0) {
      const range = selection.getRangeAt(0);
      range.deleteContents();
      range.insertNode(document.createTextNode(template));
      range.collapse(false);
      selection.removeAllRanges();
      selection.addRange(range);
    } else {
      editorRef.current.innerHTML += template;
    }
    handleInput();
  };

  const commonTemplates = [
    { label: "Normal", text: "No acute abnormalities identified." },
    { label: "Pending", text: "Awaiting comparison with prior studies." },
    { label: "Follow-up", text: "Recommend follow-up in 6 months." },
    { label: "Urgent", text: "Urgent clinical correlation recommended." },
  ];

  return (
    <div className="report-editor">
      <div className="editor-toolbar">
        <div className="format-group">
          <button
            type="button"
            onClick={() => handleFormatting("bold")}
            className="format-btn"
            title="Bold"
          >
            <Bold size={16} />
          </button>
          <button
            type="button"
            onClick={() => handleFormatting("italic")}
            className="format-btn"
            title="Italic"
          >
            <Italic size={16} />
          </button>
          <button
            type="button"
            onClick={() => handleFormatting("underline")}
            className="format-btn"
            title="Underline"
          >
            <Underline size={16} />
          </button>
        </div>

        <div className="format-group">
          <button
            type="button"
            onClick={() => handleFormatting("insertUnorderedList")}
            className="format-btn"
            title="Bullet List"
          >
            <List size={16} />
          </button>
          <button
            type="button"
            onClick={() => handleFormatting("justifyLeft")}
            className="format-btn"
            title="Align Left"
          >
            <AlignLeft size={16} />
          </button>
        </div>

        <div className="format-group">
          <button
            type="button"
            onClick={handleUndo}
            className="format-btn"
            disabled={historyIndex === 0}
            title="Undo"
          >
            <Undo size={16} />
          </button>
          <button
            type="button"
            onClick={handleRedo}
            className="format-btn"
            disabled={historyIndex === history.length - 1}
            title="Redo"
          >
            <Redo size={16} />
          </button>
        </div>

        <div className="template-dropdown">
          <select
            onChange={(e) => {
              if (e.target.value) {
                insertTemplate(e.target.value);
                e.target.value = "";
              }
            }}
            className="template-select"
          >
            <option value="">Quick Text...</option>
            {commonTemplates.map((template, index) => (
              <option key={index} value={template.text}>
                {template.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div
        ref={editorRef}
        className="editor-content"
        contentEditable
        onInput={handleInput}
        onFocus={() => setIsEditing(true)}
        onBlur={() => setIsEditing(false)}
        style={{
          minHeight: "200px",
          padding: "12px",
          border: "1px solid #ddd",
          borderRadius: "4px",
          outline: "none",
          backgroundColor: "white",
          lineHeight: "1.6",
        }}
        suppressContentEditableWarning={true}
      />

      {!content && !isEditing && (
        <div className="editor-placeholder">{placeholder}</div>
      )}
    </div>
  );
};

export default ReportEditor;
