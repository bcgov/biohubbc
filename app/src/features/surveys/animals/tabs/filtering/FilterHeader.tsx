import FilterListIcon from '@mui/icons-material/FilterList';
import IconButton from '@mui/material/IconButton';
import React, { useState } from 'react';

interface FilterHeaderProps {
  label: string;
  filterValue: string;
  setFilterValue: (val: string) => void;
  options: string[];
}

export const FilterHeader: React.FC<FilterHeaderProps> = ({ label, filterValue, setFilterValue, options }) => {
  const [showDropdown, setShowDropdown] = useState(false);
  return (
    <span style={{ fontWeight: 700, textTransform: 'uppercase', position: 'relative' }}>
      {label}
      <IconButton
        size="small"
        aria-label={`Show ${label} filter`}
        onClick={(e) => {
          e.stopPropagation();
          setShowDropdown((prev) => !prev);
        }}
        style={{ marginLeft: 4, verticalAlign: 'middle' }}>
        <FilterListIcon fontSize="small" />
      </IconButton>
      {showDropdown && (
        <select
          style={{
            position: 'absolute',
            left: 0,
            top: '100%',
            minWidth: 80,
            zIndex: 10,
            fontWeight: 400,
            textTransform: 'none',
            background: 'white',
            border: '1px solid #ccc',
            borderRadius: 4,
            marginTop: 2
          }}
          value={filterValue}
          onChange={(e) => {
            setFilterValue(e.target.value);
            setShowDropdown(false);
          }}
          onClick={(e) => e.stopPropagation()}>
          <option value="">All</option>
          {options.map((opt) => (
            <option key={opt} value={opt}>
              {opt}
            </option>
          ))}
        </select>
      )}
    </span>
  );
};
