import React from 'react';

const Dropdown = ({ label, options, selected, onChange, disabledOptions = [] }) => {
  return (
    <div className="dropdown-container">
      <label className="styled-label">{label}：</label>
      <select
        className="styled-select"
        value={selected}
        onChange={e => onChange(e.target.value)}
      >
        {options.map(option => (
          <option key={option.value} value={option.value} disabled={disabledOptions.includes(option.value)}>
            {option.label}
          </option>
        ))}
      </select>
    </div>
  );
};

export default Dropdown;
