import { useState, useCallback } from 'react';
import { generatePassword, generatePassphrase, analyzePasswordStrength, PASSWORD_PRESETS } from '../utils/passwordGenerator';
import { FaRedo, FaCopy, FaCheck, FaKey, FaSlidersH } from 'react-icons/fa';
import { toast } from 'react-toastify';
import './PasswordGenerator.css';

const PasswordGenerator = ({ onUsePassword, embedded = false }) => {
    const [password, setPassword] = useState('');
    const [copied, setCopied] = useState(false);
    const [showAdvanced, setShowAdvanced] = useState(false);
    const [mode, setMode] = useState('password'); // 'password' or 'passphrase'

    const [options, setOptions] = useState(PASSWORD_PRESETS.STRONG);
    const [passphraseOptions, setPassphraseOptions] = useState({
        wordCount: 4,
        separator: '-',
        capitalize: true
    });

    const strength = password ? analyzePasswordStrength(password) : null;

    const handleGenerate = useCallback(() => {
        try {
            const newPassword = mode === 'password'
                ? generatePassword(options)
                : generatePassphrase(
                    passphraseOptions.wordCount,
                    passphraseOptions.separator,
                    passphraseOptions.capitalize
                );
            setPassword(newPassword);
            setCopied(false);
        } catch (error) {
            toast.error(error.message);
        }
    }, [mode, options, passphraseOptions]);

    const handleCopy = () => {
        navigator.clipboard.writeText(password);
        setCopied(true);
        toast.success('Password copied to clipboard');
        setTimeout(() => setCopied(false), 2000);
    };

    const handleUsePassword = () => {
        if (onUsePassword && password) {
            onUsePassword(password);
            toast.success('Password applied');
        }
    };

    const applyPreset = (preset) => {
        setOptions(PASSWORD_PRESETS[preset]);
        setTimeout(handleGenerate, 100);
    };

    return (
        <div className={`password-generator ${embedded ? 'embedded' : ''}`}>
            <div className="password-generator-header">
                <div className="password-generator-title">
                    <FaKey /> Password Generator
                </div>
                <button
                    className="btn-icon"
                    onClick={() => setShowAdvanced(!showAdvanced)}
                    title="Advanced options"
                >
                    <FaSlidersH />
                </button>
            </div>

            <div className="password-generator-mode">
                <button
                    className={`mode-btn ${mode === 'password' ? 'active' : ''}`}
                    onClick={() => setMode('password')}
                >
                    Password
                </button>
                <button
                    className={`mode-btn ${mode === 'passphrase' ? 'active' : ''}`}
                    onClick={() => setMode('passphrase')}
                >
                    Passphrase
                </button>
            </div>

            <div className="password-display">
                <input
                    type="text"
                    className="password-output"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Click generate to create a password"
                />
                <div className="password-actions">
                    <button
                        className="btn-icon"
                        onClick={handleGenerate}
                        title="Generate new password"
                    >
                        <FaRedo />
                    </button>
                    {password && (
                        <button
                            className="btn-icon"
                            onClick={handleCopy}
                            title="Copy to clipboard"
                        >
                            {copied ? <FaCheck /> : <FaCopy />}
                        </button>
                    )}
                </div>
            </div>

            {strength && (
                <div className="password-strength">
                    <div className="strength-bar">
                        <div
                            className="strength-fill"
                            style={{
                                width: `${(strength.score + 1) * 20}%`,
                                background: strength.color
                            }}
                        ></div>
                    </div>
                    <div className="strength-info">
                        <span style={{ color: strength.color }}>{strength.strength}</span>
                        <span className="crack-time">Crack time: {strength.crackTime}</span>
                    </div>
                    {strength.feedback && (
                        <div className="strength-feedback">{strength.feedback}</div>
                    )}
                </div>
            )}

            {mode === 'password' && (
                <>
                    <div className="password-presets">
                        <button className="preset-btn" onClick={() => applyPreset('STRONG')}>
                            Strong
                        </button>
                        <button className="preset-btn" onClick={() => applyPreset('MEMORABLE')}>
                            Memorable
                        </button>
                        <button className="preset-btn" onClick={() => applyPreset('PIN')}>
                            PIN
                        </button>
                        <button className="preset-btn" onClick={() => applyPreset('MAXIMUM')}>
                            Maximum
                        </button>
                    </div>

                    {showAdvanced && (
                        <div className="password-options">
                            <div className="option-group">
                                <label>
                                    Length: {options.length}
                                    <input
                                        type="range"
                                        min="6"
                                        max="64"
                                        value={options.length}
                                        onChange={(e) => setOptions({ ...options, length: parseInt(e.target.value) })}
                                    />
                                </label>
                            </div>

                            <div className="option-group">
                                <label className="checkbox-label">
                                    <input
                                        type="checkbox"
                                        checked={options.uppercase}
                                        onChange={(e) => setOptions({ ...options, uppercase: e.target.checked })}
                                    />
                                    Uppercase (A-Z)
                                </label>
                            </div>

                            <div className="option-group">
                                <label className="checkbox-label">
                                    <input
                                        type="checkbox"
                                        checked={options.lowercase}
                                        onChange={(e) => setOptions({ ...options, lowercase: e.target.checked })}
                                    />
                                    Lowercase (a-z)
                                </label>
                            </div>

                            <div className="option-group">
                                <label className="checkbox-label">
                                    <input
                                        type="checkbox"
                                        checked={options.numbers}
                                        onChange={(e) => setOptions({ ...options, numbers: e.target.checked })}
                                    />
                                    Numbers (0-9)
                                </label>
                            </div>

                            <div className="option-group">
                                <label className="checkbox-label">
                                    <input
                                        type="checkbox"
                                        checked={options.symbols}
                                        onChange={(e) => setOptions({ ...options, symbols: e.target.checked })}
                                    />
                                    Symbols (!@#$...)
                                </label>
                            </div>

                            <div className="option-group">
                                <label className="checkbox-label">
                                    <input
                                        type="checkbox"
                                        checked={options.excludeSimilar}
                                        onChange={(e) => setOptions({ ...options, excludeSimilar: e.target.checked })}
                                    />
                                    Exclude similar (il1Lo0O)
                                </label>
                            </div>
                        </div>
                    )}
                </>
            )}

            {mode === 'passphrase' && showAdvanced && (
                <div className="password-options">
                    <div className="option-group">
                        <label>
                            Word Count: {passphraseOptions.wordCount}
                            <input
                                type="range"
                                min="3"
                                max="8"
                                value={passphraseOptions.wordCount}
                                onChange={(e) => setPassphraseOptions({ ...passphraseOptions, wordCount: parseInt(e.target.value) })}
                            />
                        </label>
                    </div>

                    <div className="option-group">
                        <label>
                            Separator:
                            <input
                                type="text"
                                className="input"
                                maxLength="1"
                                value={passphraseOptions.separator}
                                onChange={(e) => setPassphraseOptions({ ...passphraseOptions, separator: e.target.value })}
                            />
                        </label>
                    </div>

                    <div className="option-group">
                        <label className="checkbox-label">
                            <input
                                type="checkbox"
                                checked={passphraseOptions.capitalize}
                                onChange={(e) => setPassphraseOptions({ ...passphraseOptions, capitalize: e.target.checked })}
                            />
                            Capitalize words
                        </label>
                    </div>
                </div>
            )}

            <div className="password-generator-footer">
                <button className="btn btn-primary" onClick={handleGenerate}>
                    Generate Password
                </button>
                {onUsePassword && password && (
                    <button className="btn btn-secondary" onClick={handleUsePassword}>
                        Use This Password
                    </button>
                )}
            </div>
        </div>
    );
};

export default PasswordGenerator;
