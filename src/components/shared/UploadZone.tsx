"use client";
import { useCallback } from "react";
import { Upload, FileImage, X } from "lucide-react";
import { motion } from "framer-motion";

interface UploadZoneProps {
  file: File | null;
  onFileSelect: (file: File | null) => void;
}

export function UploadZone({ file, onFileSelect }: UploadZoneProps) {
  const onDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const selected = e.dataTransfer.files[0];
      if (selected.type.startsWith('image/') && selected.size <= 10 * 1024 * 1024) {
        onFileSelect(selected);
      } else {
        alert("Invalid file. Please upload an image under 10MB.");
      }
    }
  }, [onFileSelect]);

  const onChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const selected = e.target.files[0];
      if (selected.type.startsWith('image/') && selected.size <= 10 * 1024 * 1024) {
        onFileSelect(selected);
      } else {
        alert("Invalid file. Please upload an image under 10MB.");
      }
    }
  };

  if (file) {
    return (
      <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="relative w-full h-64 bg-gray-50 rounded-2xl border border-gray-200 overflow-hidden flex items-center justify-center group">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={URL.createObjectURL(file)} alt="Preview" className="w-full h-full object-contain" />
        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
          <button onClick={() => onFileSelect(null)} className="bg-white text-red-600 p-2 rounded-full hover:bg-red-50 transition-colors shadow-lg">
            <X className="w-5 h-5" />
          </button>
        </div>
      </motion.div>
    );
  }

  return (
    <label 
      onDragOver={(e) => e.preventDefault()} 
      onDrop={onDrop}
      className="flex flex-col items-center justify-center w-full h-64 bg-white/50 backdrop-blur-sm border-2 border-dashed border-gray-300 rounded-2xl cursor-pointer hover:bg-gray-50 hover:border-accent-DEFAULT/50 transition-all"
    >
      <div className="flex flex-col items-center justify-center pt-5 pb-6">
        <div className="p-4 bg-gray-100 rounded-full mb-4">
          <Upload className="w-8 h-8 text-gray-400" />
        </div>
        <p className="mb-2 text-sm text-gray-600 font-medium"><span className="text-accent-DEFAULT font-semibold">Click to upload</span> or drag and drop</p>
        <p className="text-xs text-gray-500">PNG, JPG, WEBP (MAX. 10MB)</p>
      </div>
      <input type="file" accept="image/jpeg, image/png, image/webp" className="hidden" onChange={onChange} />
    </label>
  );
}
