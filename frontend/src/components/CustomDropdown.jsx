import { useState, useRef, useEffect } from 'react';


export const CustomDropdown = ({
  options = [],
  value = '',
  onChange = () => {},
  placeholder = '',
  disabled = false,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const selectedOption = options.find(opt => opt.value === value);

  const handleSelectClick = () => {
    if (!disabled) {
      setIsOpen(!isOpen);
    }
  };

  const handleOptionClick = (optionValue) => {
    onChange(optionValue);
    setIsOpen(false);
  };

  return (
    <div className={`custom-dropdown ${disabled ? 'disabled' : ''}`} ref={dropdownRef}>
      <div
        className="dropdown-selected"
        tabIndex={disabled ? -1 : 0}
        onClick={handleSelectClick}
        onKeyDown={(e) => e.key === 'Enter' && handleSelectClick()}
      >
        <span className="selected-text">
          {selectedOption ? selectedOption.label : placeholder}
        </span>
        <span className={`dropdown-arrow ${isOpen ? 'rotate' : ''}`}>▼</span>
      </div>
      <div className={`dropdown-options ${isOpen ? 'show' : ''}`}>
        {options.map(option => (
          <div
            key={option.value}
            className={`dropdown-option ${option.value === value ? 'selected' : ''}`}
            onClick={() => handleOptionClick(option.value)}
          >
            {option.label}
          </div>
        ))}
      </div>
    </div>
  );
};
