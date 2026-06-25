import React, { useState, useEffect } from "react";

type Option = {
  label: string;
  value: string;
};

type Props = {
  options: Option[];
  isOpen?: boolean;
  selectedOption?: Option;
  handleOptionClick?: (option: Option) => void;
};

const CustomSelect = ({ options, selectedOption, handleOptionClick } : Props) => {
  const [isOpen, setIsOpen] = useState(false);
  const [internalSelectedOption, setInternalSelectedOption] = useState(options[0]);

  const currentOption = selectedOption || internalSelectedOption;

  const toggleDropdown = () => {
    setIsOpen(!isOpen);
  };

  const onOptionClick = (option: Option) => {
    if (handleOptionClick) {
      handleOptionClick(option);
    } else {
      setInternalSelectedOption(option);
    }
    toggleDropdown();
  };

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      const target = event.target as HTMLElement;
      if (!target.closest(".dropdown-content")) {
        setIsOpen(false);
      }
    }

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isOpen]);

  return (
    <div className="dropdown-content custom-select relative" style={{ width: "200px" }}>
      <div
        className={`select-selected whitespace-nowrap ${
          isOpen ? "select-arrow-active" : ""
        }`}
        onClick={toggleDropdown}
      >
        {currentOption.label}
      </div>
      <div className={`select-items ${isOpen ? "" : "select-hide"}`}>
        {options.slice(1).map((option, index) => (
          <div
            key={index}
            onClick={() => onOptionClick(option)}
            className={`select-item ${
              currentOption === option ? "same-as-selected" : ""
            }`}
          >
            {option.label}
          </div>
        ))}
      </div>
    </div>
  );
};

export default CustomSelect;
