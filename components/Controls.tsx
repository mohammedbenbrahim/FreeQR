import React from 'react';
import { Type, Palette, Layout, Image as ImageIcon, Settings } from 'lucide-react';
import { Input } from './ui/Input';
import { QRConfig, DotType, CornerSquareType, ErrorCorrectionLevel } from '../types';

interface ControlsProps {
  config: QRConfig;
  setConfig: React.Dispatch<React.SetStateAction<QRConfig>>;
}

const TABS = [
  { id: 'content', label: 'Content', icon: Type },
  { id: 'colors', label: 'Colors', icon: Palette },
  { id: 'design', label: 'Design', icon: Layout },
  { id: 'logo', label: 'Logo', icon: ImageIcon },
];

export const Controls: React.FC<ControlsProps> = ({ config, setConfig }) => {
  const [activeTab, setActiveTab] = React.useState('content');

  const handleInputChange = (field: keyof QRConfig, value: any) => {
    setConfig(prev => ({ ...prev, [field]: value }));
  };

  const handleNestedChange = (parent: keyof QRConfig, field: string, value: any) => {
    setConfig(prev => ({
      ...prev,
      [parent]: {
        ...(prev[parent] as object),
        [field]: value
      }
    }));
  };

  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => {
        handleInputChange('image', reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const removeLogo = () => {
    handleInputChange('image', undefined);
  };

  const ColorPicker = ({ label, value, onChange }: { label: string, value: string, onChange: (val: string) => void }) => (
    <div className="flex flex-col gap-2">
        <label className="text-xs font-semibold text-slate-500 uppercase tracking-wide">{label}</label>
        <div className="flex items-center gap-3">
            <div className="relative overflow-hidden w-10 h-10 rounded-full shadow-sm ring-1 ring-slate-200 shrink-0">
                <input 
                    type="color" 
                    value={value} 
                    onChange={(e) => onChange(e.target.value)}
                    className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[150%] h-[150%] p-0 border-0 cursor-pointer"
                />
            </div>
            <input 
                type="text" 
                value={value}
                onChange={(e) => onChange(e.target.value)}
                className="flex-1 px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:border-brand-500 font-mono uppercase"
            />
        </div>
    </div>
  );

  return (
    <div className="bg-white rounded-2xl shadow-xl shadow-slate-200/50 border border-slate-100 overflow-hidden flex flex-col h-full">
      {/* Tabs */}
      <div className="flex border-b border-slate-100 overflow-x-auto no-scrollbar">
        {TABS.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex-1 flex items-center justify-center gap-2 py-4 px-4 text-sm font-medium transition-colors border-b-2 whitespace-nowrap ${
                isActive 
                  ? 'border-brand-500 text-brand-600 bg-brand-50/50' 
                  : 'border-transparent text-slate-500 hover:text-slate-700 hover:bg-slate-50'
              }`}
            >
              <Icon size={16} />
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* Content Area */}
      <div className="p-6 flex-1 overflow-y-auto min-h-[400px]">
        
        {/* TAB: CONTENT */}
        {activeTab === 'content' && (
          <div className="space-y-6">
            <div className="space-y-4">
              <Input
                label="Website URL or Text"
                placeholder="https://example.com"
                value={config.data}
                onChange={(e) => handleInputChange('data', e.target.value)}
                autoFocus
              />
              <p className="text-xs text-slate-400">
                Enter any text or URL. The QR code will update automatically.
              </p>
            </div>
            
             <div className="space-y-2">
                <label className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Error Correction</label>
                <div className="grid grid-cols-4 gap-2">
                    {['L', 'M', 'Q', 'H'].map((level) => (
                        <button
                            key={level}
                            onClick={() => handleNestedChange('qrOptions', 'errorCorrectionLevel', level)}
                            className={`py-2 text-sm rounded-lg border font-medium transition-all ${
                                config.qrOptions.errorCorrectionLevel === level 
                                ? 'bg-brand-600 border-brand-600 text-white shadow-md' 
                                : 'bg-white border-slate-200 text-slate-600 hover:border-brand-300'
                            }`}
                        >
                            {level}
                        </button>
                    ))}
                </div>
                <p className="text-xs text-slate-400">Higher levels allow the QR to be readable even if partially damaged or covered.</p>
            </div>

            <div className="space-y-2 pt-4 border-t border-slate-100">
                <label className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Download Quality</label>
                <select 
                    value={config.downloadOptions.resolution}
                    onChange={(e) => handleNestedChange('downloadOptions', 'resolution', Number(e.target.value))}
                    className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-sm text-slate-800 focus:outline-none focus:border-brand-500 focus:ring-1 focus:ring-brand-500"
                >
                    <option value="512">Standard (512px)</option>
                    <option value="1024">High (1024px)</option>
                    <option value="2048">Ultra High (2048px)</option>
                    <option value="4096">Print (4096px)</option>
                </select>
            </div>
          </div>
        )}

        {/* TAB: COLORS */}
        {activeTab === 'colors' && (
          <div className="space-y-6">
            <ColorPicker 
                label="Foreground Color" 
                value={config.dotsOptions.color} 
                onChange={(val) => handleNestedChange('dotsOptions', 'color', val)} 
            />
            <ColorPicker 
                label="Background Color" 
                value={config.backgroundOptions.color} 
                onChange={(val) => handleNestedChange('backgroundOptions', 'color', val)} 
            />
             <ColorPicker 
                label="Outer Border Color" 
                value={config.frameOptions.color} 
                onChange={(val) => handleNestedChange('frameOptions', 'color', val)} 
            />
            <div className="border-t border-slate-100 pt-4 space-y-6">
                <ColorPicker 
                    label="Corner Square Color" 
                    value={config.cornersSquareOptions.color} 
                    onChange={(val) => handleNestedChange('cornersSquareOptions', 'color', val)} 
                />
                <ColorPicker 
                    label="Corner Dot Color" 
                    value={config.cornersDotOptions.color} 
                    onChange={(val) => handleNestedChange('cornersDotOptions', 'color', val)} 
                />
            </div>
          </div>
        )}

        {/* TAB: DESIGN */}
        {activeTab === 'design' && (
          <div className="space-y-6">
            
            <div className="space-y-3">
                <label className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Dot Style</label>
                <div className="grid grid-cols-3 gap-2">
                    {(['square', 'dots', 'rounded', 'extra-rounded', 'classy', 'classy-rounded'] as DotType[]).map((type) => (
                         <button
                            key={type}
                            onClick={() => handleNestedChange('dotsOptions', 'type', type)}
                            className={`py-2 text-xs rounded-lg border font-medium transition-all capitalize ${
                                config.dotsOptions.type === type
                                ? 'bg-brand-600 border-brand-600 text-white shadow-md' 
                                : 'bg-white border-slate-200 text-slate-600 hover:border-brand-300'
                            }`}
                        >
                            {type.replace('-', ' ')}
                        </button>
                    ))}
                </div>
            </div>

            <div className="space-y-3">
                <label className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Corner Style</label>
                <div className="grid grid-cols-3 gap-2">
                    {(['square', 'dot', 'extra-rounded'] as CornerSquareType[]).map((type) => (
                         <button
                            key={type}
                            onClick={() => handleNestedChange('cornersSquareOptions', 'type', type)}
                            className={`py-2 text-xs rounded-lg border font-medium transition-all capitalize ${
                                config.cornersSquareOptions.type === type
                                ? 'bg-brand-600 border-brand-600 text-white shadow-md' 
                                : 'bg-white border-slate-200 text-slate-600 hover:border-brand-300'
                            }`}
                        >
                            {type.replace('-', ' ')}
                        </button>
                    ))}
                </div>
            </div>

            <div className="border-t border-slate-100 pt-4 space-y-6">
                <div className="space-y-3">
                    <div className="flex justify-between items-center">
                        <label className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Border Width</label>
                        <span className="text-xs font-mono text-slate-500">{config.frameOptions.width}px</span>
                    </div>
                    <input 
                        type="range" 
                        min="0" 
                        max="50" 
                        value={config.frameOptions.width} 
                        onChange={(e) => handleNestedChange('frameOptions', 'width', Number(e.target.value))}
                        className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-brand-600"
                    />
                </div>

                <div className="space-y-3">
                    <div className="flex justify-between items-center">
                        <label className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Corner Radius</label>
                        <span className="text-xs font-mono text-slate-500">{config.frameOptions.radius}px</span>
                    </div>
                    <input 
                        type="range" 
                        min="0" 
                        max="100" 
                        value={config.frameOptions.radius} 
                        onChange={(e) => handleNestedChange('frameOptions', 'radius', Number(e.target.value))}
                        className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-brand-600"
                    />
                </div>

                <div className="space-y-3">
                    <label className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Internal Margin (Quiet Zone)</label>
                    <input 
                        type="range" 
                        min="0" 
                        max="50" 
                        step="5"
                        value={config.margin} 
                        onChange={(e) => handleInputChange('margin', Number(e.target.value))}
                        className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-brand-600"
                    />
                </div>
            </div>
          </div>
        )}

        {/* TAB: LOGO */}
        {activeTab === 'logo' && (
          <div className="space-y-6">
            <div className="border-2 border-dashed border-slate-300 rounded-xl p-6 flex flex-col items-center justify-center text-center gap-4 hover:bg-slate-50 transition-colors relative">
                <input 
                    type="file" 
                    accept="image/*" 
                    onChange={handleLogoUpload}
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                />
                <div className="w-12 h-12 bg-brand-100 text-brand-600 rounded-full flex items-center justify-center">
                    <ImageIcon size={24} />
                </div>
                <div>
                    <h3 className="text-sm font-semibold text-slate-800">Upload Logo</h3>
                    <p className="text-xs text-slate-500 mt-1">PNG, JPG, SVG up to 2MB</p>
                </div>
            </div>

            {config.image && (
                <div className="flex items-center justify-between p-3 bg-slate-50 border border-slate-200 rounded-lg">
                    <div className="flex items-center gap-3">
                        <img src={config.image} alt="Logo Preview" className="w-10 h-10 object-contain rounded bg-white shadow-sm" />
                        <span className="text-sm text-slate-700 font-medium">Custom Logo</span>
                    </div>
                    <button 
                        onClick={removeLogo}
                        className="text-xs text-red-500 hover:text-red-700 font-medium px-2 py-1"
                    >
                        Remove
                    </button>
                </div>
            )}
            
            <p className="text-xs text-slate-400 leading-relaxed">
                Logos are placed in the center. Ensure high contrast and use 'High' error correction for best scannability.
            </p>
          </div>
        )}

      </div>
    </div>
  );
};