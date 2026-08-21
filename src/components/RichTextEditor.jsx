import React, { useState, useRef, useEffect } from "react";
import {
  Bold,
  Italic,
  Underline,
  Strikethrough,
  List,
  ListOrdered,
  Heading,
  Quote,
  Code,
  Eraser,
  Eye,
  Edit3,
  Loader2
} from "lucide-react";

export default function RichTextEditor({
  value = "",
  onChange,
  placeholder = "Enter product description..."
}) {
  const [activeTab, setActiveTab] = useState("visual"); // 'visual' | 'code' | 'preview'
  const editorRef = useRef(null);
  const [htmlValue, setHtmlValue] = useState(value || "");

  // Sync internal state with props when value changes externally
  useEffect(() => {
    if (value !== htmlValue) {
      setHtmlValue(value || "");
    }
  }, [value]);

  // Sync contentEditable innerHTML whenever activeTab switches to 'visual' or htmlValue changes externally
  useEffect(() => {
    if (activeTab === "visual" && editorRef.current) {
      if (editorRef.current.innerHTML !== (htmlValue || "")) {
        editorRef.current.innerHTML = htmlValue || "";
      }
    }
  }, [activeTab, htmlValue]);

  const handleExecCommand = (command, valueArg = null) => {
    if (activeTab !== "visual") return;
    document.execCommand(command, false, valueArg);
    if (editorRef.current) {
      const newContent = editorRef.current.innerHTML;
      setHtmlValue(newContent);
      if (onChange) onChange(newContent);
    }
  };

  const handleInput = () => {
    if (editorRef.current) {
      const newContent = editorRef.current.innerHTML;
      setHtmlValue(newContent);
      if (onChange) onChange(newContent);
    }
  };

  const handleCodeChange = (e) => {
    const newVal = e.target.value;
    setHtmlValue(newVal);
    if (onChange) onChange(newVal);
  };

  return (
    <div className="flex flex-col rounded-xl border border-white/15 bg-slate-950/80 overflow-hidden shadow-lg transition-all focus-within:border-emerald-500/60">
      {/* Editor Header / Toolbar */}
      <div className="flex flex-wrap items-center justify-between gap-2 p-2 bg-white/5 border-b border-white/10 select-none">
        {/* Formatting Actions */}
        <div className="flex flex-wrap items-center gap-1">
          <button
            type="button"
            onClick={() => handleExecCommand("bold")}
            title="Bold (Ctrl+B)"
            className="p-1.5 rounded-lg text-white/70 hover:text-white hover:bg-white/10 active:scale-95 transition cursor-pointer"
          >
            <Bold size={14} />
          </button>
          <button
            type="button"
            onClick={() => handleExecCommand("italic")}
            title="Italic (Ctrl+I)"
            className="p-1.5 rounded-lg text-white/70 hover:text-white hover:bg-white/10 active:scale-95 transition cursor-pointer"
          >
            <Italic size={14} />
          </button>
          <button
            type="button"
            onClick={() => handleExecCommand("underline")}
            title="Underline (Ctrl+U)"
            className="p-1.5 rounded-lg text-white/70 hover:text-white hover:bg-white/10 active:scale-95 transition cursor-pointer"
          >
            <Underline size={14} />
          </button>
          <button
            type="button"
            onClick={() => handleExecCommand("strikeThrough")}
            title="Strikethrough"
            className="p-1.5 rounded-lg text-white/70 hover:text-white hover:bg-white/10 active:scale-95 transition cursor-pointer"
          >
            <Strikethrough size={14} />
          </button>

          <div className="h-4 w-px bg-white/15 mx-0.5" />

          <button
            type="button"
            onClick={() => handleExecCommand("insertUnorderedList")}
            title="Bullet List"
            className="p-1.5 rounded-lg text-white/70 hover:text-white hover:bg-white/10 active:scale-95 transition cursor-pointer"
          >
            <List size={14} />
          </button>
          <button
            type="button"
            onClick={() => handleExecCommand("insertOrderedList")}
            title="Numbered List"
            className="p-1.5 rounded-lg text-white/70 hover:text-white hover:bg-white/10 active:scale-95 transition cursor-pointer"
          >
            <ListOrdered size={14} />
          </button>

          <div className="h-4 w-px bg-white/15 mx-0.5" />

          <button
            type="button"
            onClick={() => handleExecCommand("formatBlock", "<h3>")}
            title="Heading"
            className="p-1.5 rounded-lg text-white/70 hover:text-white hover:bg-white/10 active:scale-95 transition cursor-pointer font-bold text-xs"
          >
            <Heading size={14} />
          </button>
          <button
            type="button"
            onClick={() => handleExecCommand("formatBlock", "<blockquote>")}
            title="Quote"
            className="p-1.5 rounded-lg text-white/70 hover:text-white hover:bg-white/10 active:scale-95 transition cursor-pointer"
          >
            <Quote size={14} />
          </button>
          <button
            type="button"
            onClick={() => handleExecCommand("removeFormat")}
            title="Clear Formatting"
            className="p-1.5 rounded-lg text-white/70 hover:text-white hover:bg-white/10 active:scale-95 transition cursor-pointer"
          >
            <Eraser size={14} />
          </button>
        </div>

        {/* View Mode Tabs */}
        <div className="flex items-center gap-1 bg-black/40 p-0.5 rounded-lg border border-white/10">
          <button
            type="button"
            onClick={() => setActiveTab("visual")}
            className={`flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-bold transition cursor-pointer ${
              activeTab === "visual"
                ? "bg-emerald-500 text-slate-950 shadow"
                : "text-white/60 hover:text-white"
            }`}
          >
            <Edit3 size={11} />
            <span>Visual</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("code")}
            className={`flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-bold transition cursor-pointer ${
              activeTab === "code"
                ? "bg-emerald-500 text-slate-950 shadow"
                : "text-white/60 hover:text-white"
            }`}
          >
            <Code size={11} />
            <span>HTML</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("preview")}
            className={`flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-bold transition cursor-pointer ${
              activeTab === "preview"
                ? "bg-emerald-500 text-slate-950 shadow"
                : "text-white/60 hover:text-white"
            }`}
          >
            <Eye size={11} />
            <span>Preview</span>
          </button>
        </div>
      </div>

      {/* Editor Body */}
      <div className="p-3 min-h-[110px] max-h-[220px] overflow-y-auto text-xs text-white">
        {activeTab === "visual" && (
          <div
            ref={editorRef}
            contentEditable
            onInput={handleInput}
            onBlur={handleInput}
            suppressContentEditableWarning
            className="outline-none min-h-[90px] rich-text-content max-w-none focus:outline-none"
            data-placeholder={placeholder}
            style={{
              wordBreak: "break-word"
            }}
          />
        )}

        {activeTab === "code" && (
          <textarea
            value={htmlValue}
            onChange={handleCodeChange}
            placeholder={placeholder}
            rows={5}
            className="w-full h-full bg-transparent outline-none font-mono text-xs text-emerald-300 resize-none"
          />
        )}

        {activeTab === "preview" && (
          <div className="min-h-[90px] rich-text-content max-w-none">
            {htmlValue ? (
              <div dangerouslySetInnerHTML={{ __html: htmlValue }} />
            ) : (
              <span className="text-white/30 italic">No description content to preview yet.</span>
            )}
          </div>
        )}
      </div>

      {/* Editor Footer / Character Count */}
      <div className="px-3 py-1 bg-black/40 border-t border-white/5 flex items-center justify-between text-[9px] text-white/40">
        <span>Rich Text Editor</span>
        <span>{htmlValue.replace(/<[^>]*>/g, "").length} characters</span>
      </div>
    </div>
  );
}
