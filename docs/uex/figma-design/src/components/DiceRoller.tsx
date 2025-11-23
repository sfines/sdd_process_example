import React, { useState } from 'react';
import { Dices, ChevronDown, ChevronUp, Plus, Eye, EyeOff } from 'lucide-react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Badge } from './ui/badge';
import type { Roll } from './RoomView';

interface DiceRollerProps {
  onRoll: (roll: Omit<Roll, 'id' | 'timestamp'>) => void;
  isDM: boolean;
  roomMode: 'open' | 'dm-led';
}

type DiceType = 4 | 6 | 8 | 10 | 12 | 20 | 100;
type AdvantageMode = 'none' | 'advantage' | 'disadvantage';

interface Preset {
  id: string;
  name: string;
  diceType: DiceType;
  quantity: number;
  modifier: number;
}

export function DiceRoller({ onRoll, isDM, roomMode }: DiceRollerProps) {
  const [advancedMode, setAdvancedMode] = useState(false);
  
  // Simple mode state
  const [simpleModifier, setSimpleModifier] = useState(0);
  
  // Advanced mode state
  const [diceType, setDiceType] = useState<DiceType>(20);
  const [quantity, setQuantity] = useState(1);
  const [modifier, setModifier] = useState(0);
  const [advantageMode, setAdvantageMode] = useState<AdvantageMode>('none');
  const [isHidden, setIsHidden] = useState(false);
  
  // Presets
  const [presets, setPresets] = useState<Preset[]>([
    { id: '1', name: 'Attack', diceType: 20, quantity: 1, modifier: 5 },
    { id: '2', name: 'Damage', diceType: 8, quantity: 2, modifier: 3 },
  ]);

  const rollDice = (sides: number): number => {
    return Math.floor(Math.random() * sides) + 1;
  };

  const handleSimpleRoll = () => {
    const result = rollDice(20);
    const total = result + simpleModifier;
    
    onRoll({
      playerName: '',
      diceFormula: `1d20${simpleModifier >= 0 ? '+' : ''}${simpleModifier || ''}`,
      diceResults: [result],
      modifier: simpleModifier,
      total,
    });
  };

  const handleAdvancedRoll = () => {
    const results: number[] = [];
    
    if (advantageMode !== 'none') {
      // Roll twice for advantage/disadvantage
      const roll1 = rollDice(diceType);
      const roll2 = rollDice(diceType);
      const selectedRoll = advantageMode === 'advantage' 
        ? Math.max(roll1, roll2) 
        : Math.min(roll1, roll2);
      
      results.push(selectedRoll);
      
      onRoll({
        playerName: '',
        diceFormula: `1d${diceType}${modifier >= 0 ? '+' : ''}${modifier || ''}`,
        diceResults: [selectedRoll],
        modifier,
        total: selectedRoll + modifier,
        advantage: advantageMode,
        advantageRolls: [roll1, roll2],
        isHidden: isHidden && isDM && roomMode === 'dm-led',
      });
    } else {
      // Normal roll
      for (let i = 0; i < quantity; i++) {
        results.push(rollDice(diceType));
      }
      
      const sum = results.reduce((a, b) => a + b, 0);
      const total = sum + modifier;
      
      onRoll({
        playerName: '',
        diceFormula: `${quantity}d${diceType}${modifier >= 0 ? '+' : ''}${modifier || ''}`,
        diceResults: results,
        modifier,
        total,
        isHidden: isHidden && isDM && roomMode === 'dm-led',
      });
    }
  };

  const handlePresetRoll = (preset: Preset) => {
    const results: number[] = [];
    for (let i = 0; i < preset.quantity; i++) {
      results.push(rollDice(preset.diceType));
    }
    
    const sum = results.reduce((a, b) => a + b, 0);
    const total = sum + preset.modifier;
    
    onRoll({
      playerName: '',
      diceFormula: `${preset.quantity}d${preset.diceType}${preset.modifier >= 0 ? '+' : ''}${preset.modifier || ''}`,
      diceResults: results,
      modifier: preset.modifier,
      total,
    });
  };

  const savePreset = () => {
    const name = prompt('Preset name:');
    if (name) {
      setPresets([...presets, {
        id: Date.now().toString(),
        name,
        diceType,
        quantity,
        modifier,
      }]);
    }
  };

  const diceTypes: DiceType[] = [4, 6, 8, 10, 12, 20, 100];

  return (
    <div className="bg-slate-900 rounded-xl border border-slate-800 p-6">
      {!advancedMode ? (
        // Simple Mode
        <div className="space-y-4">
          <div className="flex items-center gap-4">
            <div className="flex-1">
              <div className="flex items-center gap-3">
                <div className="flex items-center justify-center w-16 h-16 bg-gradient-to-br from-purple-600 to-blue-600 rounded-xl">
                  <Dices className="w-8 h-8 text-white" />
                </div>
                <div className="flex-1">
                  <div className="text-2xl font-mono text-slate-100">1d20</div>
                  <div className="text-sm text-slate-400">Standard roll</div>
                </div>
              </div>
            </div>
            
            <div className="flex items-center gap-2">
              <label className="text-sm text-slate-400">Modifier:</label>
              <Input
                type="number"
                value={simpleModifier || ''}
                onChange={(e) => setSimpleModifier(parseInt(e.target.value) || 0)}
                className="w-20 h-10 bg-slate-800 border-slate-700 text-center font-mono"
                placeholder="0"
              />
            </div>
          </div>

          <div className="flex gap-3">
            <Button
              onClick={handleSimpleRoll}
              className="flex-1 h-12 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white"
              size="lg"
            >
              <Dices className="w-5 h-5 mr-2" />
              Roll
            </Button>
            <Button
              variant="ghost"
              onClick={() => setAdvancedMode(true)}
              className="text-slate-400 hover:text-slate-200"
            >
              Advanced
              <ChevronDown className="w-4 h-4 ml-1" />
            </Button>
          </div>
        </div>
      ) : (
        // Advanced Mode
        <div className="space-y-4">
          {/* Dice Type Selector */}
          <div>
            <label className="block text-sm text-slate-400 mb-2">Dice Type</label>
            <div className="flex flex-wrap gap-2">
              {diceTypes.map((type) => (
                <Badge
                  key={type}
                  onClick={() => setDiceType(type)}
                  className={`cursor-pointer px-4 py-2 text-sm font-mono ${
                    diceType === type
                      ? 'bg-purple-600 text-white border-purple-500'
                      : 'bg-slate-800 text-slate-300 border-slate-700 hover:bg-slate-750'
                  }`}
                >
                  d{type}
                </Badge>
              ))}
            </div>
          </div>

          {/* Quantity and Modifier */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm text-slate-400 mb-2">Quantity</label>
              <Input
                type="number"
                min="1"
                max="10"
                value={quantity}
                onChange={(e) => setQuantity(Math.max(1, Math.min(10, parseInt(e.target.value) || 1)))}
                className="bg-slate-800 border-slate-700 text-center font-mono"
              />
            </div>
            <div>
              <label className="block text-sm text-slate-400 mb-2">Modifier</label>
              <Input
                type="number"
                value={modifier || ''}
                onChange={(e) => setModifier(parseInt(e.target.value) || 0)}
                className="bg-slate-800 border-slate-700 text-center font-mono"
                placeholder="0"
              />
            </div>
          </div>

          {/* Advantage/Disadvantage */}
          <div>
            <label className="block text-sm text-slate-400 mb-2">Roll Type</label>
            <div className="flex gap-2">
              <Badge
                onClick={() => setAdvantageMode('none')}
                className={`cursor-pointer flex-1 justify-center py-2 ${
                  advantageMode === 'none'
                    ? 'bg-slate-700 text-white border-slate-600'
                    : 'bg-slate-800 text-slate-400 border-slate-700'
                }`}
              >
                Normal
              </Badge>
              <Badge
                onClick={() => setAdvantageMode('advantage')}
                className={`cursor-pointer flex-1 justify-center py-2 ${
                  advantageMode === 'advantage'
                    ? 'bg-green-600 text-white border-green-500'
                    : 'bg-slate-800 text-slate-400 border-slate-700'
                }`}
              >
                Advantage
              </Badge>
              <Badge
                onClick={() => setAdvantageMode('disadvantage')}
                className={`cursor-pointer flex-1 justify-center py-2 ${
                  advantageMode === 'disadvantage'
                    ? 'bg-red-600 text-white border-red-500'
                    : 'bg-slate-800 text-slate-400 border-slate-700'
                }`}
              >
                Disadvantage
              </Badge>
            </div>
          </div>

          {/* Hidden Roll (DM only) */}
          {isDM && roomMode === 'dm-led' && (
            <div className="flex items-center justify-between p-3 bg-slate-800 rounded-lg border border-slate-700">
              <div className="flex items-center gap-2">
                {isHidden ? <EyeOff className="w-4 h-4 text-slate-400" /> : <Eye className="w-4 h-4 text-slate-400" />}
                <span className="text-sm text-slate-300">Hidden Roll</span>
              </div>
              <button
                onClick={() => setIsHidden(!isHidden)}
                className={`relative w-11 h-6 rounded-full transition-colors ${
                  isHidden ? 'bg-purple-600' : 'bg-slate-700'
                }`}
              >
                <div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-transform ${
                  isHidden ? 'translate-x-6' : 'translate-x-1'
                }`} />
              </button>
            </div>
          )}

          {/* Formula Preview */}
          <div className="text-center p-3 bg-slate-800 rounded-lg border border-slate-700">
            <div className="text-lg font-mono text-slate-100">
              {quantity}d{diceType}{modifier >= 0 ? '+' : ''}{modifier || ''}
              {advantageMode === 'advantage' && ' (Advantage)'}
              {advantageMode === 'disadvantage' && ' (Disadvantage)'}
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3">
            <Button
              onClick={handleAdvancedRoll}
              className="flex-1 h-12 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white"
              size="lg"
            >
              <Dices className="w-5 h-5 mr-2" />
              Roll
            </Button>
            <Button
              variant="outline"
              onClick={savePreset}
              className="h-12 border-slate-700 hover:bg-slate-800"
            >
              <Plus className="w-5 h-5" />
            </Button>
            <Button
              variant="ghost"
              onClick={() => setAdvancedMode(false)}
              className="text-slate-400 hover:text-slate-200"
            >
              <ChevronUp className="w-4 h-4" />
            </Button>
          </div>
        </div>
      )}

      {/* Presets */}
      {presets.length > 0 && (
        <div className="mt-6 pt-6 border-t border-slate-800">
          <div className="text-sm text-slate-400 mb-3">Quick Presets</div>
          <div className="flex gap-2 overflow-x-auto pb-2">
            {presets.map((preset) => (
              <Badge
                key={preset.id}
                onClick={() => handlePresetRoll(preset)}
                className="cursor-pointer whitespace-nowrap bg-slate-800 text-slate-300 border-slate-700 hover:bg-slate-750 px-4 py-2"
              >
                <span className="text-xs text-slate-500 mr-2">{preset.name}:</span>
                <span className="font-mono">{preset.quantity}d{preset.diceType}{preset.modifier >= 0 ? '+' : ''}{preset.modifier || ''}</span>
              </Badge>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
