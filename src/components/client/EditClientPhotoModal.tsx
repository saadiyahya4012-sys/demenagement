import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Camera,
  X,
  UploadCloud,
  Trash2,
  CheckCircle2,
  RefreshCw,
  Sparkles,
  ShieldCheck,
  AlertCircle
} from 'lucide-react';
import { MOCK_CLIENT } from '../../data/mockData';

interface EditClientPhotoModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentPhoto: string;
  onSave: (photoUrl: string) => void;
  onDelete: () => void;
}

// 4 high-quality preset portraits for quick client testing
const CLIENT_PRESET_AVATARS = [
  {
    id: 'preset_1',
    label: 'Photo par défaut (Camille)',
    url: MOCK_CLIENT.avatar,
  },
  {
    id: 'preset_2',
    label: 'Portrait Professionnel',
    url: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=256',
  },
  {
    id: 'preset_3',
    label: 'Portrait Studio',
    url: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&q=80&w=256',
  },
  {
    id: 'preset_4',
    label: 'Portrait Urbain',
    url: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&q=80&w=256',
  },
];

export const EditClientPhotoModal: React.FC<EditClientPhotoModalProps> = ({
  isOpen,
  onClose,
  currentPhoto,
  onSave,
  onDelete,
}) => {
  const [previewPhoto, setPreviewPhoto] = useState<string>(currentPhoto);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [isSuccess, setIsSuccess] = useState(false);
  const [isDragOver, setIsDragOver] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Sync when modal opens or currentPhoto changes
  useEffect(() => {
    if (isOpen) {
      setPreviewPhoto(currentPhoto);
      setErrorMsg(null);
      setIsSuccess(false);
    }
  }, [isOpen, currentPhoto]);

  if (!isOpen) return null;

  const hasChanges = previewPhoto !== currentPhoto;
  const isDefaultPhoto = previewPhoto === MOCK_CLIENT.avatar;

  const handleFileProcess = (file: File) => {
    setErrorMsg(null);

    // Validate type
    if (!file.type.startsWith('image/')) {
      setErrorMsg('Veuillez sélectionner un fichier image valide (JPG, PNG ou WEBP).');
      return;
    }

    // Validate size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      setErrorMsg('L’image est trop volumineuse (maximum 5 Mo).');
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === 'string') {
        setPreviewPhoto(reader.result);
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
      handleFileProcess(file);
    }
    // Reset file input so user can re-select the same file if needed
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    const file = e.dataTransfer.files?.[0];
    if (file) {
      handleFileProcess(file);
    }
  };

  const handleSave = () => {
    setIsSuccess(true);
    onSave(previewPhoto);
    setTimeout(() => {
      setIsSuccess(false);
      onClose();
    }, 600);
  };

  const handleDelete = () => {
    setPreviewPhoto(MOCK_CLIENT.avatar);
    onDelete();
    setIsSuccess(true);
    setTimeout(() => {
      setIsSuccess(false);
      onClose();
    }, 600);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs overflow-y-auto animate-fade-in">
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 12 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 12 }}
        transition={{ duration: 0.2, ease: 'easeOut' }}
        className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-7 shadow-2xl border border-slate-200 relative my-8"
      >
        {/* Header */}
        <div className="flex items-start justify-between pb-4 border-b border-slate-100">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-emerald-50 text-[#00A86B] flex items-center justify-center shrink-0">
              <Camera className="w-5 h-5 stroke-[2]" />
            </div>
            <div>
              <h2 className="text-lg font-black text-slate-900">
                Photo de profil Client
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Modifiez votre avatar exclusivement pour votre profil Client MoovVert.
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-xl transition-colors cursor-pointer"
            title="Fermer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Isolation Notice Banner */}
        <div className="mt-4 p-3 rounded-2xl bg-emerald-50/80 border border-emerald-200/70 flex items-center gap-2.5 text-xs text-emerald-900">
          <ShieldCheck className="w-4 h-4 text-[#00A86B] shrink-0" />
          <p className="text-[11px] leading-tight">
            <span className="font-bold">Espace Client indépendant :</span> Cette photo ne modifiera en aucun cas le profil ou la photo du compte Chauffeur.
          </p>
        </div>

        {/* Error message */}
        {errorMsg && (
          <div className="mt-3 p-3 rounded-2xl bg-rose-50 border border-rose-200 flex items-center gap-2 text-xs text-rose-700">
            <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
            <span>{errorMsg}</span>
          </div>
        )}

        {/* Photo Preview & Upload Zone */}
        <div className="mt-6 flex flex-col items-center">
          {/* Large Avatar Preview */}
          <div className="relative group">
            <div className="w-28 h-28 sm:w-32 sm:h-32 rounded-3xl overflow-hidden ring-4 ring-emerald-500/20 shadow-xl bg-slate-100">
              <img
                src={previewPhoto}
                alt="Aperçu du profil"
                referrerPolicy="no-referrer"
                className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
              />
            </div>

            {hasChanges && (
              <span className="absolute -bottom-2.5 left-1/2 -translate-x-1/2 px-2.5 py-0.5 rounded-full bg-[#00A86B] text-white text-[10px] font-bold shadow-md whitespace-nowrap flex items-center gap-1">
                <Sparkles className="w-3 h-3" />
                <span>Nouvel aperçu</span>
              </span>
            )}
          </div>

          <p className="text-xs text-slate-500 mt-4 text-center">
            {hasChanges
              ? 'Aperçu prêt — cliquez sur « Enregistrer la photo » pour valider.'
              : 'Photo actuelle affichée dans vos demandes et messages.'}
          </p>
        </div>

        {/* Drag & Drop Upload Card */}
        <div
          onDragOver={(e) => {
            e.preventDefault();
            setIsDragOver(true);
          }}
          onDragLeave={() => setIsDragOver(false)}
          onDrop={handleDrop}
          onClick={() => fileInputRef.current?.click()}
          className={`mt-5 p-4 sm:p-5 rounded-2xl border-2 border-dashed transition-all text-center cursor-pointer ${
            isDragOver
              ? 'border-[#00A86B] bg-emerald-50/50 scale-[1.01]'
              : 'border-slate-200 hover:border-emerald-400 hover:bg-slate-50'
          }`}
        >
          <input
            ref={fileInputRef}
            type="file"
            accept="image/png,image/jpeg,image/webp,image/jpg"
            className="hidden"
            onChange={handleFileChange}
          />

          <div className="w-10 h-10 rounded-2xl bg-emerald-50 text-[#00A86B] mx-auto flex items-center justify-center mb-2">
            <UploadCloud className="w-5 h-5 stroke-[2.2]" />
          </div>

          <p className="text-xs font-bold text-slate-800">
            {hasChanges ? 'Remplacer par une autre photo' : 'Téléverser une nouvelle photo'}
          </p>
          <p className="text-[11px] text-slate-400 mt-0.5">
            Glissez-déposez ou parcourez vos fichiers (PNG, JPG, WEBP jusqu'à 5 Mo)
          </p>
        </div>

        {/* Quick Portrait Presets */}
        <div className="mt-5">
          <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block mb-2">
            Ou choisir un portrait rapide :
          </span>
          <div className="grid grid-cols-4 gap-2.5">
            {CLIENT_PRESET_AVATARS.map((preset) => {
              const isSelected = previewPhoto === preset.url;
              return (
                <button
                  key={preset.id}
                  type="button"
                  onClick={() => setPreviewPhoto(preset.url)}
                  className={`p-1 rounded-2xl border-2 transition-all cursor-pointer relative group ${
                    isSelected
                      ? 'border-[#00A86B] bg-emerald-50/40 ring-2 ring-emerald-500/20'
                      : 'border-slate-200 hover:border-slate-300 bg-white'
                  }`}
                  title={preset.label}
                >
                  <img
                    src={preset.url}
                    alt={preset.label}
                    referrerPolicy="no-referrer"
                    className="w-full aspect-square rounded-xl object-cover"
                  />
                  {isSelected && (
                    <span className="absolute top-1 right-1 w-4 h-4 rounded-full bg-[#00A86B] text-white flex items-center justify-center shadow-xs">
                      <CheckCircle2 className="w-3 h-3 stroke-[3]" />
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="mt-7 pt-4 border-t border-slate-100 flex flex-col-reverse sm:flex-row items-center justify-between gap-3">
          {/* Delete / Reset button */}
          {!isDefaultPhoto ? (
            <button
              type="button"
              onClick={handleDelete}
              className="w-full sm:w-auto px-4 py-2.5 rounded-xl border border-rose-200 text-rose-600 hover:bg-rose-50 active:bg-rose-100 text-xs font-bold transition-colors cursor-pointer flex items-center justify-center gap-1.5"
            >
              <Trash2 className="w-4 h-4" />
              <span>Supprimer la photo</span>
            </button>
          ) : (
            <button
              type="button"
              onClick={onClose}
              className="w-full sm:w-auto px-4 py-2.5 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-50 text-xs font-bold transition-colors cursor-pointer"
            >
              Annuler
            </button>
          )}

          <div className="flex items-center gap-2 w-full sm:w-auto">
            {!isDefaultPhoto && (
              <button
                type="button"
                onClick={onClose}
                className="w-1/2 sm:w-auto px-4 py-2.5 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-50 text-xs font-bold transition-colors cursor-pointer"
              >
                Annuler
              </button>
            )}

            <button
              type="button"
              disabled={!hasChanges && !isSuccess}
              onClick={handleSave}
              className={`w-full sm:w-auto px-6 py-2.5 rounded-xl text-white text-xs font-black shadow-md flex items-center justify-center gap-2 transition-all cursor-pointer ${
                hasChanges || isSuccess
                  ? 'bg-[#00A86B] hover:bg-[#008f5a] active:bg-[#007a4d] shadow-emerald-600/25 hover:shadow-lg'
                  : 'bg-slate-300 cursor-not-allowed opacity-60'
              }`}
            >
              {isSuccess ? (
                <>
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Photo enregistrée !</span>
                </>
              ) : (
                <span>Enregistrer la photo</span>
              )}
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  );
};
