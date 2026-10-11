import React, { useState } from 'react';
import { FurnitureItem, FurnitureCategory } from '../../types';
import { FURNITURE_CATALOG } from '../../data/mockData';
import { Plus, Minus, Sofa, Bed, Utensils, Zap, Package, Sparkles } from 'lucide-react';

interface FurnitureSelectorProps {
  selectedItems: FurnitureItem[];
  onChange: (items: FurnitureItem[]) => void;
}

export const FurnitureSelector: React.FC<FurnitureSelectorProps> = ({
  selectedItems,
  onChange,
}) => {
  const [activeCategory, setActiveCategory] = useState<FurnitureCategory>('salon');
  const [customItemName, setCustomItemName] = useState('');
  const [customItemVolume, setCustomItemVolume] = useState('0.5');

  const categories: { id: FurnitureCategory; label: string; icon: React.ComponentType<{ className?: string }> }[] = [
    { id: 'salon', label: 'Salon', icon: Sofa },
    { id: 'chambre', label: 'Chambre', icon: Bed },
    { id: 'cuisine', label: 'Cuisine', icon: Utensils },
    { id: 'electromenager', label: 'Électro', icon: Zap },
    { id: 'cartons', label: 'Cartons', icon: Package },
    { id: 'divers', label: 'Divers', icon: Sparkles },
  ];

  const handleUpdateQuantity = (catalogItem: Omit<FurnitureItem, 'id' | 'quantity'>, delta: number) => {
    const existingIndex = selectedItems.findIndex(i => i.name === catalogItem.name);
    let updated = [...selectedItems];

    if (existingIndex >= 0) {
      const newQty = updated[existingIndex].quantity + delta;
      if (newQty <= 0) {
        updated.splice(existingIndex, 1);
      } else {
        updated[existingIndex] = {
          ...updated[existingIndex],
          quantity: newQty,
        };
      }
    } else if (delta > 0) {
      updated.push({
        id: `item_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
        name: catalogItem.name,
        category: catalogItem.category,
        quantity: 1,
        volumeM3: catalogItem.volumeM3,
        isFragile: catalogItem.isFragile,
        isHeavy: catalogItem.isHeavy,
        needsDisassembly: catalogItem.needsDisassembly,
      });
    }

    onChange(updated);
  };

  const handleAddCustomItem = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customItemName.trim()) return;

    const vol = parseFloat(customItemVolume) || 0.5;
    const newItem: FurnitureItem = {
      id: `item_${Date.now()}`,
      name: customItemName.trim(),
      category: activeCategory,
      quantity: 1,
      volumeM3: vol,
    };

    onChange([...selectedItems, newItem]);
    setCustomItemName('');
  };

  const totalSelectedVolume = selectedItems.reduce(
    (sum, item) => sum + item.quantity * item.volumeM3,
    0
  );

  const totalCount = selectedItems.reduce((sum, item) => sum + item.quantity, 0);

  const filteredCatalog = FURNITURE_CATALOG.filter(c => c.category === activeCategory);

  return (
    <div className="space-y-4">
      {/* Category selector */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-2 scrollbar-none">
        {categories.map(cat => {
          const Icon = cat.icon;
          const isSelected = activeCategory === cat.id;
          return (
            <button
              key={cat.id}
              type="button"
              onClick={() => setActiveCategory(cat.id)}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
                isSelected
                  ? 'bg-emerald-600 text-white shadow-xs'
                  : 'bg-white text-slate-700 hover:bg-slate-100 border border-slate-200'
              }`}
            >
              <Icon className="w-3.5 h-3.5" />
              <span>{cat.label}</span>
            </button>
          );
        })}
      </div>

      {/* Item cards for active category */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
        {filteredCatalog.map(catItem => {
          const inSelection = selectedItems.find(i => i.name === catItem.name);
          const qty = inSelection ? inSelection.quantity : 0;

          return (
            <div
              key={catItem.name}
              className={`p-3 rounded-2xl border transition-all flex items-center justify-between gap-3 ${
                qty > 0
                  ? 'bg-emerald-50/60 border-emerald-300 ring-1 ring-emerald-500/20'
                  : 'bg-white border-slate-200 hover:border-slate-300'
              }`}
            >
              <div className="min-w-0 flex-1">
                <p className="text-sm font-semibold text-slate-900 truncate">
                  {catItem.name}
                </p>
                <div className="flex items-center gap-2 text-xs text-slate-500 mt-0.5">
                  <span className="font-mono text-emerald-700 font-medium">~{catItem.volumeM3} m³</span>
                  {catItem.isHeavy && (
                    <>
                      <span>·</span>
                      <span className="text-amber-700">Lourd</span>
                    </>
                  )}
                  {catItem.isFragile && (
                    <>
                      <span>·</span>
                      <span className="text-rose-600">Fragile</span>
                    </>
                  )}
                  {catItem.needsDisassembly && (
                    <>
                      <span>·</span>
                      <span className="text-blue-600">À démonter</span>
                    </>
                  )}
                </div>
              </div>

              {/* Quantity controls */}
              <div className="flex items-center gap-1.5 shrink-0">
                {qty > 0 ? (
                  <>
                    <button
                      type="button"
                      onClick={() => handleUpdateQuantity(catItem, -1)}
                      className="w-8 h-8 rounded-lg bg-white border border-slate-200 text-slate-700 hover:bg-slate-100 flex items-center justify-center transition-colors"
                      title="Diminuer"
                    >
                      <Minus className="w-3.5 h-3.5" />
                    </button>
                    <span className="w-7 text-center font-bold text-sm text-emerald-800 font-mono">
                      {qty}
                    </span>
                    <button
                      type="button"
                      onClick={() => handleUpdateQuantity(catItem, 1)}
                      className="w-8 h-8 rounded-lg bg-emerald-600 text-white hover:bg-emerald-700 flex items-center justify-center transition-colors"
                      title="Augmenter"
                    >
                      <Plus className="w-3.5 h-3.5" />
                    </button>
                  </>
                ) : (
                  <button
                    type="button"
                    onClick={() => handleUpdateQuantity(catItem, 1)}
                    className="px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-emerald-600 hover:text-white text-slate-700 text-xs font-semibold flex items-center gap-1 transition-colors"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Ajouter</span>
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Add Custom Item */}
      <form onSubmit={handleAddCustomItem} className="p-3 bg-slate-100 rounded-2xl flex flex-wrap sm:flex-nowrap items-center gap-2">
        <input
          type="text"
          value={customItemName}
          onChange={e => setCustomItemName(e.target.value)}
          placeholder="Autre meuble (ex: Buffet vintage en fer forgé...)"
          className="flex-1 min-w-[200px] px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-hidden focus:ring-1 focus:ring-emerald-500"
        />
        <div className="flex items-center gap-1.5 shrink-0">
          <input
            type="number"
            step="0.1"
            min="0.1"
            max="15"
            value={customItemVolume}
            onChange={e => setCustomItemVolume(e.target.value)}
            className="w-16 px-2 py-2 bg-white border border-slate-200 rounded-xl text-xs text-center font-mono focus:outline-hidden"
            title="Volume unitaire en m³"
          />
          <span className="text-xs text-slate-500 font-medium">m³</span>
          <button
            type="submit"
            className="px-3 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition-colors"
          >
            Ajouter
          </button>
        </div>
      </form>

      {/* Live Volume Summary Box */}
      <div className="p-4 bg-emerald-50/70 border border-emerald-200/80 rounded-2xl flex items-center justify-between">
        <div>
          <p className="text-xs font-medium text-emerald-800">
            Total estimé sélectionné
          </p>
          <p className="text-xs text-slate-600 mt-0.5">
            {totalCount} élément{totalCount > 1 ? 's' : ''} au chargement
          </p>
        </div>
        <div className="text-right">
          <p className="text-2xl font-black text-emerald-700 font-mono">
            {totalSelectedVolume.toFixed(1)} m³
          </p>
          <p className="text-[11px] text-slate-500">
            {totalSelectedVolume <= 6
              ? 'Conseillé : Fourgonnette'
              : totalSelectedVolume <= 14
              ? 'Conseillé : Fourgon 12m³'
              : 'Conseillé : Camion 20m³ avec hayon'}
          </p>
        </div>
      </div>
    </div>
  );
};
