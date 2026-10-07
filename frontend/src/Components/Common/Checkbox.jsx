import { Checkbox as AriaCheckbox } from "react-aria-components";

export default function Checkbox({ label = "", isSelected = false, onChange = () => {}, className = "" }) {
  return (
    <AriaCheckbox
      isSelected={isSelected}
      onChange={onChange}
      className={`inline-flex items-center gap-2 cursor-pointer select-none ${className}`}
    >
      {({ isSelected }) => (
        <>
          <span
            aria-hidden
            className={`w-4 h-4 inline-block rounded border transition-colors duration-150 ${
              isSelected ? "bg-green-600 border-green-600" : "bg-white border-gray-300"
            }`}
          />
          <span className="text-sm text-gray-700">{label}</span>
        </>
      )}
    </AriaCheckbox>
  );
}
