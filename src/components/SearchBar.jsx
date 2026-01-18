import { useState } from 'react';
import { FaSearch, FaTimes, FaFilter, FaStar, FaRegStar, FaTag } from 'react-icons/fa';
import './SearchBar.css';

const SearchBar = ({
    value,
    onChange,
    allTags = [],
    selectedTag,
    onTagSelect,
    showFavoritesOnly,
    onToggleFavorites
}) => {
    const [isExpanded, setIsExpanded] = useState(false);

    return (
        <div className={`search-container ${isExpanded ? 'expanded' : ''}`}>
            <div className="search-bar">
                <FaSearch className="search-icon" />
                <input
                    type="text"
                    className="search-input"
                    placeholder="Search your wallet..."
                    value={value}
                    onChange={(e) => onChange(e.target.value)}
                    onFocus={() => setIsExpanded(true)}
                />
                <div className="search-actions">
                    {value && (
                        <button
                            className="search-action-btn"
                            onClick={() => onChange('')}
                            title="Clear search"
                        >
                            <FaTimes />
                        </button>
                    )}
                    <button
                        className={`search-action-btn ${isExpanded ? 'active' : ''}`}
                        onClick={() => setIsExpanded(!isExpanded)}
                        title="Advanced Filters"
                    >
                        <FaFilter />
                    </button>
                </div>
            </div>

            {isExpanded && (
                <div className="search-filters">
                    <div className="filter-group">
                        <button
                            className={`filter-chip favorite-filter ${showFavoritesOnly ? 'active' : ''}`}
                            onClick={() => onToggleFavorites(!showFavoritesOnly)}
                        >
                            {showFavoritesOnly ? <FaStar /> : <FaRegStar />}
                            <span>Favorites Only</span>
                        </button>
                    </div>

                    {allTags.length > 0 && (
                        <div className="filter-group">
                            <div className="filter-label"><FaTag className="text-secondary" /> Tags</div>
                            <div className="tags-scroller">
                                <button
                                    className={`filter-chip tag-chip ${!selectedTag ? 'active' : ''}`}
                                    onClick={() => onTagSelect(null)}
                                >
                                    All
                                </button>
                                {allTags.map(tag => (
                                    <button
                                        key={tag}
                                        className={`filter-chip tag-chip ${selectedTag === tag ? 'active' : ''}`}
                                        onClick={() => onTagSelect(selectedTag === tag ? null : tag)}
                                    >
                                        {tag}
                                    </button>
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};

export default SearchBar;
