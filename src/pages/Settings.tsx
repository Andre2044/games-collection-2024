import React, { useState } from 'react';
import { Settings as SettingsIcon, Sun, Moon, Volume2, VolumeX, Sliders, Clock, RotateCcw, Save } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';
import { showNotification } from '../utils/animations';

interface SettingsState {
  soundEffects: boolean;
  animations: boolean;
  autoSave: boolean;
  highContrastMode: boolean;
  largeText: boolean;
  saveInterval: number;
}

const Settings: React.FC = () => {
  const { theme, toggleTheme } = useTheme();
  
  // Initial settings state
  const [settings, setSettings] = useState<SettingsState>({
    soundEffects: localStorage.getItem('soundEffects') === 'true' || true,
    animations: localStorage.getItem('animations') === 'true' || true,
    autoSave: localStorage.getItem('autoSave') === 'true' || true,
    highContrastMode: localStorage.getItem('highContrastMode') === 'true' || false,
    largeText: localStorage.getItem('largeText') === 'true' || false,
    saveInterval: parseInt(localStorage.getItem('saveInterval') || '30', 10)
  });
  
  // Settings form values
  const [formValues, setFormValues] = useState<SettingsState>({ ...settings });
  
  // Handle toggle inputs
  const handleToggle = (setting: keyof SettingsState) => {
    setFormValues({
      ...formValues,
      [setting]: !formValues[setting]
    });
  };
  
  // Handle range input
  const handleRangeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormValues({
      ...formValues,
      saveInterval: parseInt(e.target.value, 10)
    });
  };
  
  // Save settings
  const saveSettings = () => {
    // Update settings state
    setSettings(formValues);
    
    // Save to localStorage
    Object.entries(formValues).forEach(([key, value]) => {
      localStorage.setItem(key, value.toString());
    });
    
    // Show notification
    showNotification('Settings saved successfully!', 'success');
  };
  
  // Reset to defaults
  const resetDefaults = () => {
    const defaults: SettingsState = {
      soundEffects: true,
      animations: true,
      autoSave: true,
      highContrastMode: false,
      largeText: false,
      saveInterval: 30
    };
    
    setFormValues(defaults);
    showNotification('Settings reset to defaults', 'info');
  };
  
  return (
    <div className="game-container">
      <div className="settings-board">
        <div className="game-header">
          <div className="game-title">
            <SettingsIcon size={28} className="text-purple-500" />
            <h1>Settings</h1>
          </div>
        </div>
        
        <div className="settings-content">
          <div className="settings-section appearance-section">
            <h2>
              <Sun size={18} className="mr-2" />
              Appearance
            </h2>
            
            <div className="setting-item">
              <div className="setting-label">
                <span>Theme</span>
                <p className="setting-description">Choose between light and dark mode</p>
              </div>
              <button
                className="theme-toggle-button"
                onClick={toggleTheme}
              >
                {theme === 'dark' ? (
                  <Sun size={18} className="text-yellow-300" />
                ) : (
                  <Moon size={18} className="text-purple-600" />
                )}
                {theme === 'dark' ? 'Light Mode' : 'Dark Mode'}
              </button>
            </div>
            
            <div className="setting-item">
              <div className="setting-label">
                <span>High Contrast Mode</span>
                <p className="setting-description">Increase contrast for better readability</p>
              </div>
              <label className="toggle-switch">
                <input
                  type="checkbox"
                  checked={formValues.highContrastMode}
                  onChange={() => handleToggle('highContrastMode')}
                />
                <span className="toggle-slider"></span>
              </label>
            </div>
            
            <div className="setting-item">
              <div className="setting-label">
                <span>Large Text</span>
                <p className="setting-description">Increase text size throughout the app</p>
              </div>
              <label className="toggle-switch">
                <input
                  type="checkbox"
                  checked={formValues.largeText}
                  onChange={() => handleToggle('largeText')}
                />
                <span className="toggle-slider"></span>
              </label>
            </div>
          </div>
          
          <div className="settings-section gameplay-section">
            <h2>
              <Sliders size={18} className="mr-2" />
              Gameplay
            </h2>
            
            <div className="setting-item">
              <div className="setting-label">
                <span>Sound Effects</span>
                <p className="setting-description">Enable game sound effects</p>
              </div>
              <label className="toggle-switch">
                <input
                  type="checkbox"
                  checked={formValues.soundEffects}
                  onChange={() => handleToggle('soundEffects')}
                />
                <span className="toggle-slider"></span>
              </label>
            </div>
            
            <div className="setting-item">
              <div className="setting-label">
                <span>Animations</span>
                <p className="setting-description">Enable game animations and transitions</p>
              </div>
              <label className="toggle-switch">
                <input
                  type="checkbox"
                  checked={formValues.animations}
                  onChange={() => handleToggle('animations')}
                />
                <span className="toggle-slider"></span>
              </label>
            </div>
            
            <div className="setting-item">
              <div className="setting-label">
                <span>Auto-Save</span>
                <p className="setting-description">Automatically save game progress</p>
              </div>
              <label className="toggle-switch">
                <input
                  type="checkbox"
                  checked={formValues.autoSave}
                  onChange={() => handleToggle('autoSave')}
                />
                <span className="toggle-slider"></span>
              </label>
            </div>
            
            {formValues.autoSave && (
              <div className="setting-item">
                <div className="setting-label">
                  <span>Save Interval</span>
                  <p className="setting-description">How often to save (in seconds)</p>
                </div>
                <div className="range-control">
                  <input
                    type="range"
                    min="10"
                    max="120"
                    step="10"
                    value={formValues.saveInterval}
                    onChange={handleRangeChange}
                    className="range-slider"
                  />
                  <span className="range-value">{formValues.saveInterval}s</span>
                </div>
              </div>
            )}
          </div>
          
          <div className="settings-actions">
            <button
              className="settings-button reset-button"
              onClick={resetDefaults}
            >
              <RotateCcw size={16} />
              Reset to Defaults
            </button>
            
            <button
              className="settings-button save-button"
              onClick={saveSettings}
            >
              <Save size={16} />
              Save Settings
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Settings; 