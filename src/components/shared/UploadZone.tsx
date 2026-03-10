"use client";
import { useCallback, useState } from "react";
import { Upload, X, FileCheck, AlertCircle } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface UploadZoneProps {
  file: File | null;
  onFileSelect: (file: File | null) => void;
}

export function UploadZone({ file, onFileSelect }: UploadZoneProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const validateAndSetFile = (selected: File) => {
    setError(null);
    if (!selected.type.startsWith('image/')) {
      setError("Please select a valid image file (JPEG, PNG, WEBP).");
      return;
    }
    if (selected.size > 10 * 1024 * 1024) {
      setError("Image size exceeds 10MB limit. Please upload a smaller file.");
      return;
    }
    onFileSelect(selected);
  };

  const onDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      validateAndSetFile(e.dataTransfer.files[0]);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [onFileSelect]);

  const onChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      validateAndSetFile(e.target.files[0]);
    }
  };

  return (
    <div className="w-full">
      <AnimatePresence mode="wait">
        {file ? (
          <motion.div 
            key="preview"
            initial={{ opacity: 0, scale: 0.95 }} 
            animate={{ opacity: 1, scale: 1 }} 
            exit={{ opacity: 0, scale: 0.95 }}
            className="relative w-full h-72 bg-gray-50/50 rounded-3xl border border-gray-200 overflow-hidden flex items-center justify-center group shadow-sm"
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={URL.createObjectURL(file)} alt="Preview" className="w-full h-full object-contain p-2" />
            
            {/* Hover overlay with actions */}
            <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col items-center justify-center backdrop-blur-sm">
              <FileCheck className="w-12 h-12 text-emerald-400 mb-4 drop-shadow-md" />
              <p className="text-white font-bold mb-6 text-sm bg-black/40 px-4 py-1.5 rounded-full backdrop-blur-md">
                {file.name}
              </p>
              <button 
                onClick={(e) => { e.preventDefault(); onFileSelect(null); }} 
                className="bg-white text-red-500 px-6 py-2.5 rounded-full font-bold hover:bg-red-50 hover:text-red-600 transition-all shadow-lg flex items-center transform hover:scale-105 active:scale-95"
              >
                <X className="w-4 h-4 mr-2" />
                Remove Image
              </button>
            </div>
          </motion.div>
        ) : (
          <motion.label 
            key="dropzone"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }} 
            onDragLeave={(e) => { e.preventDefault(); setIsDragging(false); }}
            onDrop={onDrop}
            className={`flex flex-col items-center justify-center w-full h-72 bg-white/50 backdrop-blur-sm border-2 border-dashed rounded-3xl cursor-pointer transition-all duration-300 ${isDragging ? 'border-accent-DEFAULT bg-accent-DEFAULT/5 scale-[1.01]' : 'border-gray-300 hover:bg-gray-50 hover:border-gray-400'}`}
          >
            <div className="flex flex-col items-center justify-center pt-5 pb-6 pointer-events-none">
              <motion.div 
                animate={{ y: isDragging ? -10 : 0 }}
                className={`p-5 rounded-full mb-6 transition-colors ${isDragging ? 'bg-accent-DEFAULT text-white' : 'bg-gray-100 text-gray-500'}`}
              >
                <Upload className="w-8 h-8" />
              </motion.div>
              <p className="mb-2 text-lg text-gray-600 font-medium">
                <span className="text-accent-DEFAULT font-bold">Click to upload</span> or drag and drop
              </p>
              <p className="text-sm text-gray-400 font-medium">JPEG, PNG, WEBP (Max 10MB)</p>
            </div>
            <input type="file" accept="image/jpeg, image/png, image/webp" className="hidden" onChange={onChange} />
          </motion.label>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {error && (
          <motion.div 
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="mt-4 p-4 bg-red-50 border border-red-100 rounded-xl flex items-start text-red-600"
          >
            <AlertCircle className="w-5 h-5 mr-3 shrink-0 mt-0.5" />
            <p className="text-sm font-medium">{error}</p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
