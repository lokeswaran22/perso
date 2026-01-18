import { useState } from 'react';
import { FaPlus, FaTrash, FaSave, FaIcons, FaHeading, FaLock, FaCalendar, FaAlignLeft } from 'react-icons/fa';
import { toast } from 'react-toastify';
import { addCustomCategory } from '../utils/categories';
import './CategoryBuilder.css';

// Initial icons user can pick from
const ICON_OPTIONS = [
    { id: 'FaStickyNote', label: 'Note' },
    { id: 'FaBox', label: 'Box' },
    { id: 'FaBriefcase', label: 'Briefcase' },
    { id: 'FaGamepad', label: 'Game' },
    { id: 'FaDumbbell', label: 'Gym' },
    { id: 'FaPlane', label: 'Travel' },
    { id: 'FaUtensils', label: 'Food' },
    { id: 'FaPaw', label: 'Pet' }
];

const CategoryBuilder = ({ onCancel, onSaveSuccess }) => {
    const [name, setName] = useState('');
    const [color, setColor] = useState('#3b82f6');
    const [fields, setFields] = useState([
        { name: 'title', label: 'Title', type: 'text', required: true, fixed: true },
        { name: 'notes', label: 'Notes', type: 'textarea', fixed: true }
    ]);
    const [newField, setNewField] = useState({ label: '', type: 'text', sensitive: false });

    const handleAddField = () => {
        if (!newField.label) return toast.error('Field label is required');

        // Generate a valid key name from label (e.g., "Phone Number" -> "phoneNumber")
        const fieldName = newField.label
            .toLowerCase()
            .replace(/[^a-zA-Z0-9]+(.)/g, (m, chr) => chr.toUpperCase())
            .replace(/[^a-zA-Z0-9]/g, '');

        if (fields.find(f => f.name === fieldName)) {
            return toast.error('Field with this name already exists');
        }

        setFields(prev => [...prev, {
            name: fieldName,
            label: newField.label,
            type: newField.type,
            sensitive: newField.sensitive
        }]);
        setNewField({ label: '', type: 'text', sensitive: false });
    };

    const removeField = (index) => {
        if (fields[index].fixed) return;
        setFields(prev => prev.filter((_, i) => i !== index));
    };

    const handleSave = () => {
        if (!name) return toast.error('Category name is required');

        try {
            const categoryId = name.toLowerCase().replace(/[^a-z0-9]/g, '_');

            const newCategory = {
                id: categoryId,
                label: name,
                // We'll store the icon name string, and logic elsewhere needs to map it 
                // Or for simplicity in this demo, we'll default to a generic icon in the main map since we can't dynamically import easily here without a map.
                // We will use a "custom" flag.
                icon: 'FaBox', // Default for now
                isCustom: true,
                color: color,
                gradient: `linear-gradient(135deg, ${color} 0%, ${color}aa 100%)`,
                fields: fields
            };

            addCustomCategory(newCategory);
            toast.success('Category created successfully!');
            onSaveSuccess();
        } catch (error) {
            toast.error(error.message);
        }
    };

    return (
        <div className="category-builder">
            <div className="builder-header">
                <h3>Create Custom Category</h3>
            </div>

            <div className="builder-form">
                <div className="form-group">
                    <label>Category Name</label>
                    <input
                        className="input"
                        value={name}
                        onChange={e => setName(e.target.value)}
                        placeholder="e.g. Gym Log, Project X"
                    />
                </div>

                <div className="form-group">
                    <label>Highlight Color</label>
                    <div className="color-picker-row">
                        {['#ef4444', '#f59e0b', '#10b981', '#3b82f6', '#8b5cf6', '#ec4899'].map(c => (
                            <button
                                key={c}
                                className={`color-swatch ${color === c ? 'active' : ''}`}
                                style={{ background: c }}
                                onClick={() => setColor(c)}
                            />
                        ))}
                    </div>
                </div>

                <div className="section-title">Fields</div>
                <div className="fields-list">
                    {fields.map((field, idx) => (
                        <div key={idx} className="field-item-preview">
                            <span className="field-type-icon">
                                {field.type === 'text' && <FaHeading />}
                                {field.type === 'password' && <FaLock />}
                                {field.type === 'date' && <FaCalendar />}
                                {field.type === 'textarea' && <FaAlignLeft />}
                            </span>
                            <span className="field-name-text">{field.label}</span>
                            {field.sensitive && <span className="badge-sensitive">Sensitive</span>}
                            {!field.fixed && (
                                <button className="btn-icon danger" onClick={() => removeField(idx)}>
                                    <FaTrash />
                                </button>
                            )}
                        </div>
                    ))}
                </div>

                <div className="add-field-box">
                    <input
                        className="input"
                        placeholder="New Field Label"
                        value={newField.label}
                        onChange={e => setNewField(prev => ({ ...prev, label: e.target.value }))}
                    />
                    <select
                        className="select"
                        value={newField.type}
                        onChange={e => setNewField(prev => ({ ...prev, type: e.target.value }))}
                    >
                        <option value="text">Text</option>
                        <option value="password">Password/Sensitive</option>
                        <option value="date">Date</option>
                        <option value="textarea">Long Text</option>
                    </select>
                    <label className="checkbox-label">
                        <input
                            type="checkbox"
                            checked={newField.sensitive}
                            onChange={e => setNewField(prev => ({ ...prev, sensitive: e.target.checked }))}
                        />
                        Sensitive?
                    </label>
                    <button className="btn btn-sm btn-secondary" onClick={handleAddField}>
                        <FaPlus /> Add
                    </button>
                </div>
            </div>

            <div className="builder-actions">
                <button className="btn btn-outline" onClick={onCancel}>Cancel</button>
                <button className="btn btn-primary" onClick={handleSave}>
                    <FaSave /> Save Category
                </button>
            </div>
        </div>
    );
};

export default CategoryBuilder;
