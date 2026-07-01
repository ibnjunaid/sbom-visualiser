import React, { useState, useRef } from 'react';
import { Upload, FileCode } from 'lucide-react';
import { cn } from '../utils/cn';

interface FileUploadProps {
  onFileSelect: (file: File) => void;
  onUrlLoad: (url: string) => void;
  isLoading: boolean;
}

export const FileUpload: React.FC<FileUploadProps> = ({ onFileSelect, onUrlLoad, isLoading }) => {
  const [isDragging, setIsDragging] = useState(false);
  const [urlInput, setUrlInput] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      onFileSelect(e.dataTransfer.files[0]);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      onFileSelect(e.target.files[0]);
    }
  };

  const handleUrlSubmit = (e?: React.FormEvent) => {
    e?.preventDefault();
    onUrlLoad(urlInput);
  };

  return (
    <div
      className={cn(
        "border-2 border-dashed rounded-xl p-12 flex flex-col items-center justify-center transition-colors cursor-pointer",
        isDragging ? "border-blue-500 bg-blue-50" : "border-slate-300 hover:border-slate-400",
        isLoading && "opacity-50 cursor-not-allowed"
      )}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      onClick={() => !isLoading && fileInputRef.current?.click()}
    >
      <input
        type="file"
        className="hidden"
        ref={fileInputRef}
        onChange={handleFileChange}
        disabled={isLoading}
      />
      <div className="bg-blue-100 p-4 rounded-full mb-4">
        <Upload className="w-8 h-8 text-blue-600" />
      </div>
      <h3 className="text-xl font-semibold mb-2 text-slate-800">
        {isLoading ? 'Parsing SBOM...' : 'Upload SBOM file'}
      </h3>
      <p className="text-slate-500 text-center max-w-sm">
        Drag and drop your SPDX (.spdx, .json, .yaml) or CycloneDX (.json, .xml) file here, or click to browse.
      </p>
      <form className="mt-6 w-full max-w-md space-y-3" onSubmit={handleUrlSubmit} onClick={(e) => e.stopPropagation()}>
        <label className="text-xs font-semibold uppercase tracking-[0.24em] text-slate-400">
          Or load from URL
        </label>
        <div className="flex gap-2">
          <input
            type="url"
            value={urlInput}
            onChange={(e) => setUrlInput(e.target.value)}
            placeholder="https://example.com/sbom.spdx.json"
            className="flex-1 rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700 shadow-sm outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100"
            disabled={isLoading}
          />
          <button
            type="submit"
            disabled={isLoading}
            className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-blue-700 disabled:cursor-not-allowed disabled:bg-blue-300"
          >
            Load
          </button>
        </div>
      </form>
      <div className="mt-6 flex items-center gap-2 text-xs text-slate-400">
        <FileCode size={14} />
        <span>Fully client-side. Your data never leaves your browser.</span>
      </div>
    </div>
  );
};
