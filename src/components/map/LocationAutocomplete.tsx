import React, { useState, useEffect, useRef } from 'react';
import { Search, MapPin, Loader2, X } from 'lucide-react';
import { searchPlaces, PlaceSuggestion } from '../../services/mapService';

interface LocationAutocompleteProps {
  label: string;
  placeholder: string;
  value: string;
  tripType: 'city_to_city' | 'local';
  pinColor?: string;
  required?: boolean;
  onSelect: (suggestion: PlaceSuggestion) => void;
  onChangeText: (text: string) => void;
}

export const LocationAutocomplete: React.FC<LocationAutocompleteProps> = ({
  label,
  placeholder,
  value,
  tripType,
  pinColor = '#00A86B',
  required = false,
  onSelect,
  onChangeText,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [suggestions, setSuggestions] = useState<PlaceSuggestion[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const abortControllerRef = useRef<AbortController | null>(null);

  // Debounced real autocomplete fetch
  useEffect(() => {
    if (!isOpen || value.trim().length < 2) {
      setSuggestions([]);
      setIsLoading(false);
      return;
    }

    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }

    const controller = new AbortController();
    abortControllerRef.current = controller;
    setIsLoading(true);

    const timer = setTimeout(async () => {
      try {
        const results = await searchPlaces(value, tripType, controller.signal);
        setSuggestions(results);
      } catch (e) {
        setSuggestions([]);
      } finally {
        setIsLoading(false);
      }
    }, 280);

    return () => {
      clearTimeout(timer);
      controller.abort();
    };
  }, [value, isOpen, tripType]);

  // Click outside listener
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className="relative" ref={containerRef}>
      <label className="block text-xs font-bold text-slate-700 mb-1.5">
        {label} {required && <span className="text-[#00A86B]">*</span>}
      </label>

      <div className="relative">
        <MapPin
          className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2"
          style={{ color: pinColor }}
        />

        <input
          type="text"
          value={value}
          required={required}
          onFocus={() => {
            if (value.trim().length >= 2) setIsOpen(true);
          }}
          onChange={(e) => {
            onChangeText(e.target.value);
            setIsOpen(true);
          }}
          placeholder={placeholder}
          className="w-full pl-10 pr-9 py-3 bg-[#F8FAFC] border border-slate-200 rounded-2xl text-xs sm:text-sm text-[#111111] focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-[#00A86B]/30 focus:border-[#00A86B] transition-all"
        />

        {isLoading ? (
          <Loader2 className="w-4 h-4 text-slate-400 animate-spin absolute right-3.5 top-1/2 -translate-y-1/2" />
        ) : value ? (
          <button
            type="button"
            onClick={() => {
              onChangeText('');
              setSuggestions([]);
            }}
            className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        ) : null}
      </div>

      {/* Autocomplete Dropdown List */}
      {isOpen && suggestions.length > 0 && (
        <div className="absolute left-0 right-0 mt-2 bg-white rounded-2xl shadow-xl border border-slate-200 py-2 z-50 max-h-60 overflow-y-auto">
          <div className="px-3 py-1 text-[11px] font-extrabold uppercase tracking-wider text-slate-400">
            Suggestions d'adresses vérifiées
          </div>
          {suggestions.map((item, idx) => (
            <button
              key={`${item.lat}-${item.lon}-${idx}`}
              type="button"
              onClick={() => {
                onSelect(item);
                setIsOpen(false);
              }}
              className="w-full px-3.5 py-2.5 text-left hover:bg-emerald-50/70 transition-colors flex items-start gap-2.5 cursor-pointer group"
            >
              <MapPin className="w-4 h-4 text-[#00A86B] shrink-0 mt-0.5 group-hover:scale-110 transition-transform" />
              <div className="min-w-0 flex-1">
                <p className="text-xs font-bold text-slate-800 truncate">
                  {item.shortAddress}
                </p>
                <p className="text-[11px] text-slate-500 truncate">
                  {item.displayName}
                </p>
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  );
};
