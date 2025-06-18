import React from "react";

interface SelectProps {
  name: string;
  label: string;
  data: Array<any>;
  onSelectChange: (e: React.ChangeEvent<HTMLSelectElement>) => void;
}

function Select({ name, label, data, onSelectChange }: SelectProps) {
  return (
    <select
      className="p-2 ring-1 bg-transparent text-sm text-gray-900 dark:text-white rounded-md"
      name={name}
      defaultValue="none"
      onChange={onSelectChange}
    >
      <option
        value="none"
        disabled
        className="text-gray-400 dark:text-gray-500"
      >
        {label}
      </option>
      {data.map((item, index) => {
        return (
          <option key={index} value={item}>
            {item}
          </option>
        );
      })}
    </select>
  );
}

export default Select;
