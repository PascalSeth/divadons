'use client';

import React, { useState } from 'react';
import { toast } from 'sonner';

interface ColorPickerProps {
  value: string[];
  onChange: (colors: string[]) => void;
  maxColors?: number;
}

const PRESET_COLORS = [
// ... (rest of presets)
  '#000000', '#FFFFFF', '#F5F5F5', '#9CA3AF', '#6B7280', '#374151',
  '#EF4444', '#F97316', '#F59E0B', '#EAB308', '#84CC16', '#22C55E',
  '#10B981', '#14B8A6', '#06B6D4', '#0EA5E9', '#3B82F6', '#6366F1',
  '#8B5CF6', '#A855F7', '#D946EF', '#EC4899', '#F43F5E', '#78716C',
  '#92400E', '#B45309', '#CA8A04', '#4D7C0F', '#15803D', '#0F766E',
  '#0E7490', '#0369A1', '#1D4ED8', '#4338CA', '#6D28D9', '#7E22CE',
  '#A21CAF', '#BE185D', '#BE123C', '#FCA5A5', '#FDBA74', '#FDE047',
  '#86EFAC', '#6EE7B7', '#5EEAD4', '#7DD3FC', '#A5B4FC', '#C4B5FD',
  '#F0ABFC', '#FBCFE8', '#D4A574', '#C5A059', '#D4AF37', '#FFD700',
];

export function ColorPicker({ value, onChange, maxColors = 10 }: ColorPickerProps) {
  const [showPicker, setShowPicker] = useState(false);
  const [customColor, setCustomColor] = useState('#000000');

  const addColor = (color: string) => {
    if (value.includes(color)) return;
    if (value.length >= maxColors) {
      toast.error(`Maximum ${maxColors} colors allowed`);
      return;
    }
    onChange([...value, color]);
  };

  const removeColor = (color: string) => {
    onChange(value.filter((c) => c !== color));
  };

  const handleCustomColorAdd = () => {
    if (customColor && !value.includes(customColor)) {
      addColor(customColor);
    }
  };

  return (
    <div className="space-y-3">
      {/* Selected Colors */}
      {value.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {value.map((color) => (
            <div
              key={color}
              className="group relative flex items-center gap-2 px-2 py-1 bg-stone-100 rounded-md text-xs"
            >
              <div
                className="w-4 h-4 rounded-full border border-stone-300"
                style={{ backgroundColor: color }}
              />
              <span className="text-stone-600">{color}</span>
              <button
                type="button"
                onClick={() => removeColor(color)}
                className="ml-1 text-stone-400 hover:text-stone-600"
              >
                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Add Color Button */}
      <button
        type="button"
        onClick={() => setShowPicker(!showPicker)}
        className="inline-flex items-center gap-2 px-3 py-2 text-sm border border-stone-300 rounded-md hover:border-stone-400 transition-colors"
      >
        <div className="w-4 h-4 rounded-full border border-stone-300 bg-gradient-to-br from-red-500 via-green-500 to-blue-500" />
        {showPicker ? 'Close Picker' : 'Add Color'}
        <span className="text-stone-400 text-xs">({value.length}/{maxColors})</span>
      </button>

      {/* Color Picker Panel */}
      {showPicker && (
        <div className="p-4 border border-stone-200 rounded-lg bg-white shadow-sm space-y-4">
          {/* Preset Colors */}
          <div>
            <label className="block text-xs font-medium text-stone-500 mb-2">Preset Colors</label>
            <div className="grid grid-cols-12 gap-1">
              {PRESET_COLORS.map((color) => (
                <button
                  key={color}
                  type="button"
                  onClick={() => addColor(color)}
                  className={`w-6 h-6 rounded border-2 transition-transform hover:scale-110 ${
                    value.includes(color) ? 'border-stone-900 ring-2 ring-stone-300' : 'border-stone-200'
                  }`}
                  style={{ backgroundColor: color }}
                  title={color}
                />
              ))}
            </div>
          </div>

          {/* Custom Color */}
          <div>
            <label className="block text-xs font-medium text-stone-500 mb-2">Custom Color</label>
            <div className="flex items-center gap-2">
              <input
                type="color"
                value={customColor}
                onChange={(e) => setCustomColor(e.target.value)}
                className="w-10 h-10 rounded cursor-pointer border border-stone-200"
              />
              <input
                type="text"
                value={customColor}
                onChange={(e) => setCustomColor(e.target.value)}
                placeholder="#000000"
                className="flex-1 px-3 py-2 text-sm border border-stone-300 rounded-md focus:outline-none focus:ring-1 focus:ring-stone-900"
              />
              <button
                type="button"
                onClick={handleCustomColorAdd}
                className="px-3 py-2 text-sm bg-stone-900 text-white rounded-md hover:bg-stone-800"
              >
                Add
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
