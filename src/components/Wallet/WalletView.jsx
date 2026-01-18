import { useState } from 'react';
import WalletCard from '../WalletCard';
import SearchBar from '../SearchBar';
import CategoryFilter from '../CategoryFilter';
import { FaThLarge, FaList, FaPlus } from 'react-icons/fa';
import './WalletView.css';

const WalletView = ({
    items,
    filter,
    setFilter,
    onEdit,
    onDelete,
    onAddNew,
    loading
}) => {
    const [viewMode, setViewMode] = useState('grid');

    // Category counts for filter
    const itemCounts = items.reduce((acc, item) => {
        acc['total'] = (acc['total'] || 0) + 1;
        acc[item.category] = (acc[item.category] || 0) + 1;
        return acc;
    }, { total: 0 });

    return (
        <div className="wallet-view-container">
            {/* Toolbar */}
            <div className="wallet-toolbar glass-card">
                <div className="search-wrapper">
                    <SearchBar
                        value={filter.search}
                        onChange={(val) => setFilter(prev => ({ ...prev, search: val }))}
                        showFavoritesOnly={filter.onlyFavorites}
                        onToggleFavorites={(val) => setFilter(prev => ({ ...prev, onlyFavorites: val }))}
                    // Add tags logic here if needed
                    />
                </div>

                <div className="view-toggles">
                    <button
                        className={`btn-icon ${viewMode === 'grid' ? 'active' : ''}`}
                        onClick={() => setViewMode('grid')}
                    >
                        <FaThLarge />
                    </button>
                    <button
                        className={`btn-icon ${viewMode === 'list' ? 'active' : ''}`}
                        onClick={() => setViewMode('list')}
                    >
                        <FaList />
                    </button>
                    <button className="btn btn-primary" onClick={onAddNew}>
                        <FaPlus /> <span className="desktop-only">Add New</span>
                    </button>
                </div>
            </div>

            {/* Category Pills */}
            <CategoryFilter
                selectedCategory={filter.category}
                onSelectCategory={(cat) => setFilter(prev => ({ ...prev, category: cat }))}
                itemCounts={itemCounts}
            />

            {/* Content Grid */}
            {loading ? (
                <div className="loading-state">Loading wallet items...</div>
            ) : items.length === 0 ? (
                <div className="empty-state">
                    <h3>No items found</h3>
                    <p>Try adjusting your search or add a new item.</p>
                    <button className="btn btn-primary" onClick={onAddNew}>Add Item</button>
                </div>
            ) : (
                <div className={`wallet-grid ${viewMode === 'list' ? 'list-view' : ''}`}>
                    {items.map(item => (
                        <WalletCard
                            key={item.id}
                            item={item}
                            onEdit={onEdit}
                            onDelete={onDelete}
                        />
                    ))}
                </div>
            )}
        </div>
    );
};

export default WalletView;
