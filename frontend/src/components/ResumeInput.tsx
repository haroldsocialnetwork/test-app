import { useState, useRef } from 'react';

interface ResumeInputProps {
  onFileChange: (file: File | null) => void;
  onTextChange: (text: string) => void;
  disabled?: boolean;
}

export function ResumeInput({ onFileChange, onTextChange, disabled }: ResumeInputProps) {
  const [mode, setMode] = useState<'file' | 'text'>('file');
  const [fileName, setFileName] = useState<string | null>(null);
  const [pasteText, setPasteText] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0] ?? null;
    setFileName(file ? file.name : null);
    onFileChange(file);
  }

  function handleTextChange(e: React.ChangeEvent<HTMLTextAreaElement>) {
    setPasteText(e.target.value);
    onTextChange(e.target.value);
  }

  function switchToText() {
    setMode('text');
    setFileName(null);
    onFileChange(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  }

  function switchToFile() {
    setMode('file');
    setPasteText('');
    onTextChange('');
  }

  return (
    <div className="input-section">
      <div className="input-label-row">
        <label className="section-label">Resume</label>
        {mode === 'file' ? (
          <button type="button" className="toggle-link" onClick={switchToText} disabled={disabled}>
            Paste text instead
          </button>
        ) : (
          <button type="button" className="toggle-link" onClick={switchToFile} disabled={disabled}>
            Upload PDF instead
          </button>
        )}
      </div>

      {mode === 'file' ? (
        <div className="file-upload-area">
          <input
            ref={fileInputRef}
            type="file"
            accept="application/pdf"
            onChange={handleFileChange}
            disabled={disabled}
            className="file-input"
            id="resume-file"
          />
          <label htmlFor="resume-file" className={`file-label ${disabled ? 'disabled' : ''}`}>
            {fileName ? (
              <span className="file-name">📄 {fileName}</span>
            ) : (
              <span>Click to upload a PDF resume (max 5 MB)</span>
            )}
          </label>
        </div>
      ) : (
        <textarea
          className="text-input"
          placeholder="Paste resume text here…"
          value={pasteText}
          onChange={handleTextChange}
          disabled={disabled}
          rows={8}
        />
      )}
    </div>
  );
}
