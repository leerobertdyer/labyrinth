export default function ActionButton({
  label,
  onClick,
  isSelected,
}: {
  label: string;
  onClick: () => void;
  isSelected?: boolean;
}) {
  return (
    <button
      className={`w-full border-2 cursor-pointer transition-all duration-300 ${
        isSelected
          ? "bg-gray-600 border-yellow-500 hover:bg-gray-600"
          : "bg-gray-400 border-black hover:bg-gray-500"
      }`}
      onClick={onClick}
    >
      {label}
    </button>
  );
}