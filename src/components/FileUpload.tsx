import React, { useState, useRef } from 'react';
import { Upload, FileCode } from 'lucide-react';
import { cn } from '../utils/cn';

interface FileUploadProps {
  onFileSelect: (file: File) => void;
  isLoading: boolean;
}

export const FileUpload: React.FC<FileUploadProps> = ({ onFileSelect, isLoading }) => {
  const [isDragging, setIsDragging] = useState(false);
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
      <div className="mt-6 flex items-center gap-2 text-xs text-slate-400">
        <FileCode size={14} />
        <span>Fully client-side. Your data never leaves your browser.</span>
      </div>
    </div>
  );
};
