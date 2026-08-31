import { useEffect, useRef, useState } from "react";

export interface MultiSelectOption {
  id: string;
  label: string;
  color?: string;
  /** True when this option's exclusion is controlled by a different filter (e.g. its group/type), so it can't be toggled from here. */
  disabled?: boolean;
}

interface MultiSelectDropdownProps {
  label: string;
  options: MultiSelectOption[];
  excludedIds: Set<string>;
  onToggle: (id: string) => void;
  testIdPrefix: string;
}

export default function MultiSelectDropdown({
  label,
  options,
  excludedIds,
  onToggle,
  testIdPrefix,
}: MultiSelectDropdownProps) {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const toggleRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (!isOpen) return;

    const handlePointerDown = (event: MouseEvent) => {
      if (!containerRef.current?.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setIsOpen(false);
        toggleRef.current?.focus();
      }
    };

    document.addEventListener("mousedown", handlePointerDown);
    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("mousedown", handlePointerDown);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen]);

  const selectedCount = options.filter(
    (option) => !excludedIds.has(option.id)
  ).length;
  const summary =
    selectedCount === options.length
      ? "All"
      : `${selectedCount}/${options.length}`;

  const handleSelectAll = () => {
    options.forEach((option) => {
      if (option.disabled) return;
      if (excludedIds.has(option.id)) onToggle(option.id);
    });
  };

  const handleSelectNone = () => {
    options.forEach((option) => {
      if (option.disabled) return;
      if (!excludedIds.has(option.id)) onToggle(option.id);
    });
  };

  return (
    <div className="relative" ref={containerRef}>
      <button
        ref={toggleRef}
        type="button"
        className="border-mk flex items-center gap-2 rounded-md border-2 px-3 py-2"
        aria-haspopup="true"
        aria-expanded={isOpen}
        onClick={() => setIsOpen((prev) => !prev)}
        data-testid={`${testIdPrefix}-toggle`}
      >
        <span>{label}</span>
        <span className="text-sm text-gray-500">{summary}</span>
      </button>

      {isOpen && (
        <div
          className="border-mk absolute z-10 mt-1 flex max-h-64 min-w-full flex-col gap-2 overflow-y-auto rounded-md border-2 bg-white p-3 shadow-lg"
          role="group"
          aria-label={label}
        >
          <div className="mb-1 flex gap-3 border-b border-gray-200 pb-2 text-sm whitespace-nowrap">
            <button
              type="button"
              className="text-mk hover:underline"
              onClick={handleSelectAll}
              data-testid={`${testIdPrefix}-select-all`}
            >
              Select all
            </button>
            <button
              type="button"
              className="text-mk hover:underline"
              onClick={handleSelectNone}
              data-testid={`${testIdPrefix}-select-none`}
            >
              Unselect all
            </button>
          </div>
          {options.map((option) => (
            <label
              key={option.id}
              className={
                "flex flex-row items-center gap-2 whitespace-nowrap" +
                (option.disabled ? " opacity-50" : "")
              }
            >
              <input
                type="checkbox"
                checked={!excludedIds.has(option.id)}
                disabled={option.disabled}
                onChange={() => onToggle(option.id)}
                data-testid={`${testIdPrefix}-${option.id}`}
              />
              {option.color && (
                <span
                  style={{ backgroundColor: option.color }}
                  className="inline-block h-4 w-4 rounded"
                />
              )}
              <span>{option.label}</span>
            </label>
          ))}
        </div>
      )}
    </div>
  );
}
