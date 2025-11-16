import React, { useRef } from "react";
import { Upload as UploadIcon } from "lucide-react";

// ✅ Definisikan props agar bisa dikasih className dari luar
interface UploadProps {
  className?: string;
  label?: string;
  description?: string;
  onChange?: (file: File) => void;
}

export const Upload: React.FC<UploadProps> = ({
  className = "",
  label = "Upload File",
  description = "Format: JPG, PNG (Max. 2MB)",
  onChange,
}) => {
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const handleClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && onChange) onChange(file);
  };

  return (
    <div
      className={`border-2 border-dashed border-gray-300 rounded-2xl p-8 text-center hover:border-emerald-500 cursor-pointer transition-all hover:bg-emerald-50/50 ${className}`}
      onClick={handleClick}
    >
      <UploadIcon className="h-10 w-10 text-gray-400 mx-auto mb-3" />
      <p className="text-sm text-gray-700 mb-1">{label}</p>
      <p className="text-xs text-gray-500">{description}</p>
      <input
        ref={fileInputRef}
        type="file"
        className="hidden"
        accept="image/*"
        onChange={handleFileChange}
      />
    </div>
  );
};
