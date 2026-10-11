import React, { useRef, useState } from 'react';
import {
  UploadCloud,
  FileText,
  CheckCircle2,
  Trash2,
  RefreshCw,
  AlertCircle,
  FileCheck2,
  Eye
} from 'lucide-react';

interface DocumentUploadCardProps {
  title: string;
  description: string;
  required?: boolean;
  fileUrl?: string;
  fileName?: string;
  onUpload: (fileUrl: string, fileName: string) => void;
  onDelete: () => void;
}

export const DocumentUploadCard: React.FC<DocumentUploadCardProps> = ({
  title,
  description,
  required = true,
  fileUrl,
  fileName,
  onUpload,
  onDelete,
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isDragOver, setIsDragOver] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const isUploaded = !!fileUrl;

  const handleProcessFile = (file: File) => {
    setErrorMsg(null);

    // Validate extension/mime
    const validTypes = ['image/jpeg', 'image/png', 'image/jpg', 'image/webp', 'application/pdf'];
    const isPdf = file.type === 'application/pdf' || file.name.toLowerCase().endsWith('.pdf');
    const isImage = file.type.startsWith('image/');

    if (!isPdf && !isImage) {
      setErrorMsg('Format non supporté. Veuillez sélectionner un fichier JPG, PNG ou PDF.');
      return;
    }

    // Validate size: max 5MB
    if (file.size > 5 * 1024 * 1024) {
      setErrorMsg('Le fichier dépasse la taille maximale autorisée (5 Mo).');
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === 'string') {
        onUpload(reader.result, file.name);
      }
    };
    reader.onerror = () => {
      setErrorMsg('Erreur lors de la lecture du fichier. Veuillez réessayer.');
    };
    reader.readAsDataURL(file);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      handleProcessFile(file);
    }
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    const file = e.dataTransfer.files?.[0];
    if (file) {
      handleProcessFile(file);
    }
  };

  return (
    <div className="bg-slate-50/80 rounded-2xl border border-slate-200/90 p-4 sm:p-5 transition-all">
      {/* Header */}
      <div className="flex items-start justify-between gap-3 mb-3">
        <div className="flex items-center gap-2.5">
          <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${
            isUploaded ? 'bg-emerald-100 text-[#00A86B]' : 'bg-slate-200 text-slate-600'
          }`}>
            <FileText className="w-4 h-4 stroke-[2.2]" />
          </div>
          <div>
            <h4 className="text-xs sm:text-sm font-bold text-slate-900 flex items-center gap-1.5">
              <span>{title}</span>
              {required && <span className="text-rose-500 font-bold">*</span>}
            </h4>
            <p className="text-[11px] text-slate-500">{description}</p>
          </div>
        </div>

        {/* Status Pill */}
        {isUploaded ? (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-emerald-50 border border-emerald-200 text-[#00A86B] text-[10px] font-bold shrink-0">
            <CheckCircle2 className="w-3 h-3 stroke-[2.5]" />
            <span>Document téléversé</span>
          </span>
        ) : (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-amber-50 border border-amber-200 text-amber-700 text-[10px] font-semibold shrink-0">
            En attente d'import
          </span>
        )}
      </div>

      {/* Error Message */}
      {errorMsg && (
        <div className="mb-3 p-2.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center gap-1.5">
          <AlertCircle className="w-3.5 h-3.5 shrink-0 text-rose-600" />
          <span>{errorMsg}</span>
        </div>
      )}

      {/* Hidden file input */}
      <input
        ref={fileInputRef}
        type="file"
        accept=".jpg,.jpeg,.png,.webp,.pdf,image/jpeg,image/png,application/pdf"
        className="hidden"
        onChange={handleFileChange}
      />

      {/* Upload Box / Uploaded View */}
      {isUploaded ? (
        <div className="bg-white rounded-xl border border-emerald-200 p-3 flex flex-col sm:flex-row items-center justify-between gap-3 shadow-2xs">
          <div className="flex items-center gap-3 min-w-0 w-full sm:w-auto">
            {fileUrl.startsWith('data:image') ? (
              <img
                src={fileUrl}
                alt={fileName || title}
                className="w-12 h-12 rounded-lg object-cover ring-1 ring-slate-200 shrink-0"
              />
            ) : (
              <div className="w-12 h-12 rounded-lg bg-emerald-50 text-[#00A86B] flex items-center justify-center shrink-0">
                <FileCheck2 className="w-6 h-6 stroke-[2]" />
              </div>
            )}
            <div className="min-w-0 flex-1">
              <p className="text-xs font-bold text-slate-800 truncate">
                {fileName || 'Document enregistré'}
              </p>
              <p className="text-[10px] text-emerald-600 font-semibold flex items-center gap-1 mt-0.5">
                <CheckCircle2 className="w-3 h-3" />
                <span>Prêt pour vérification (max 5 Mo)</span>
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              <RefreshCw className="w-3 h-3" />
              <span>Remplacer</span>
            </button>
            <button
              type="button"
              onClick={onDelete}
              className="px-3 py-1.5 border border-rose-200 text-rose-600 hover:bg-rose-50 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              <Trash2 className="w-3 h-3" />
              <span>Supprimer</span>
            </button>
          </div>
        </div>
      ) : (
        <div
          onDragOver={(e) => {
            e.preventDefault();
            setIsDragOver(true);
          }}
          onDragLeave={() => setIsDragOver(false)}
          onDrop={handleDrop}
          onClick={() => fileInputRef.current?.click()}
          className={`rounded-xl border-2 border-dashed p-4 text-center cursor-pointer transition-all ${
            isDragOver
              ? 'border-[#00A86B] bg-emerald-50/60 scale-[1.01]'
              : 'border-slate-200 hover:border-emerald-400 bg-white/70 hover:bg-white'
          }`}
        >
          <div className="w-9 h-9 rounded-xl bg-slate-100 text-slate-500 mx-auto flex items-center justify-center mb-1.5">
            <UploadCloud className="w-4 h-4 stroke-[2.2]" />
          </div>
          <p className="text-xs font-bold text-slate-700">
            Glissez votre fichier ici ou cliquez pour téléverser
          </p>
          <p className="text-[10px] text-slate-400 mt-0.5">
            Formats acceptés : JPG, JPEG, PNG, PDF (max 5 Mo)
          </p>
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              fileInputRef.current?.click();
            }}
            className="mt-2.5 px-3 py-1 bg-white hover:bg-emerald-50 text-[#00A86B] border border-emerald-200 rounded-lg text-xs font-bold shadow-2xs transition-colors cursor-pointer"
          >
            Choisir un fichier
          </button>
        </div>
      )}
    </div>
  );
};
