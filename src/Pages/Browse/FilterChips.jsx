// FilterChips.jsx — filter pill strip, reusable across Browse and other pages

function FilterChips({ categories, selectedCategory, onSelect }) {
  return (
    <div className="browse-filters">
      <button
        className={selectedCategory === null ? "active" : ""}
        onClick={() => onSelect(null)}
      >
        All
      </button>

      {categories.map((category) => (
        <button
          key={category.id}
          className={selectedCategory === category.id ? "active" : ""}
          onClick={() => onSelect(category.id)}
        >
          {category.name}
        </button>
      ))}
    </div>
  );
}

export default FilterChips;