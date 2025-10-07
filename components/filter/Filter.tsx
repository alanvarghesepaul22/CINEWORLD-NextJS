import React, { useId } from "react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface FilterProps {
  label: string;
  options: { value: string; label: string }[];
  value: string;
  onChange: (value: string) => void;
  /** Whether to include a reset/all option that clears the filter (defaults to true) */
  includeReset?: boolean;
  /** Label for the reset option (defaults to "All") */
  resetLabel?: string;
}

/**
 * Filter component with dropdown selection functionality.
 *
 * By default, includes a reset option (value="__reset__") that allows users to clear the current
 * filter selection and return to showing all items. The reset option can be disabled
 * via includeReset prop, and its label can be customized via resetLabel prop.
 *
 * @param label - Placeholder text shown when no option is selected
 * @param options - Array of selectable options with value/label pairs
 * @param value - Currently selected value
 * @param onChange - Callback fired when selection changes
 * @param includeReset - Whether to show reset/all option (default: true)
 * @param resetLabel - Label for reset option (default: "All")
 */
const Filter: React.FC<FilterProps> = ({
  label,
  options,
  value,
  onChange,
  includeReset = true,
  resetLabel = "All",
}) => {
  const selectId = useId();
  
  // Handle value changes and convert reset value to empty string
  const handleValueChange = (newValue: string) => {
    onChange(newValue === "__reset__" ? "" : newValue);
  };
  
  // Convert empty string value to reset value for display
  const displayValue = value === "" ? "__reset__" : value;

  return (
    <div className="w-full">
      <label htmlFor={selectId} className="sr-only">
        {label}
      </label>
      <Select value={displayValue} onValueChange={handleValueChange}>
        <SelectTrigger
          id={selectId}
          className="w-full bg-transparent text-primary border-2 border-primary rounded-full text-sm"
        >
          <SelectValue placeholder={label} />
        </SelectTrigger>
        <SelectContent>
          {includeReset && <SelectItem value="__reset__">{resetLabel}</SelectItem>}
          {options.map((option) => (
            <SelectItem key={option.value} value={option.value}>
              {option.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
};

export default Filter;
