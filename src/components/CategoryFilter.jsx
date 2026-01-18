import { getAllCategories } from '../utils/categories';
import './CategoryFilter.css';

const CategoryFilter = ({ selectedCategory, onSelectCategory, itemCounts }) => {
    const categories = getAllCategories();

    return (
        <div className="category-filter">
            <button
                className={`category-pill ${!selectedCategory ? 'active' : ''}`}
                onClick={() => onSelectCategory(null)}
            >
                <span className="category-pill-label">All</span>
                {itemCounts.total > 0 && (
                    <span className="category-pill-count">{itemCounts.total}</span>
                )}
            </button>

            {categories.map(category => {
                const Icon = category.icon;
                const count = itemCounts[category.id] || 0;

                return (
                    <button
                        key={category.id}
                        className={`category-pill ${selectedCategory === category.id ? 'active' : ''}`}
                        onClick={() => onSelectCategory(category.id)}
                        style={{ '--category-color': category.color }}
                    >
                        <Icon className="category-pill-icon" />
                        <span className="category-pill-label">{category.label}</span>
                        {count > 0 && (
                            <span className="category-pill-count">{count}</span>
                        )}
                    </button>
                );
            })}
        </div>
    );
};

export default CategoryFilter;
