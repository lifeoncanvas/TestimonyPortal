// SearchBar.jsx — pill search input with lucide Search icon
import { Search } from "lucide-react";
import "./styles.css";

function SearchBar({ value, onChange, placeholder = "Search testimonies…" }) {
  return (
    <div className="browse-search">
      <Search size={15} />
      <input
        type="search"
        placeholder={placeholder}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        aria-label="Search testimonies"
      />
    </div>
  );
}

export default SearchBar;