export function SelectField({
  value,
  onChange,
  options,
}: {
  value: string;
  onChange: (event: React.ChangeEvent<HTMLSelectElement>) => void;
  options: Array<{ value: string; label: string }>;
}) {
  return (
    <div className="relative overflow-hidden rounded-2xl border border-zinc-700 bg-zinc-950/90 shadow-[inset_0_1px_0_rgba(255,255,255,0.03)]">
      <select
        value={value}
        onChange={onChange}
        className="w-full appearance-none bg-transparent px-4 py-3 pr-11 text-sm font-medium text-zinc-100 outline-none"
      >
        {options.map((option) => (
          <option key={option.value} value={option.value} className="bg-zinc-950 text-zinc-100">
            {option.label}
          </option>
        ))}
      </select>

      <div className="pointer-events-none absolute inset-y-0 right-0 flex w-11 items-center justify-center text-zinc-500">
        <svg
          width="16"
          height="16"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          aria-hidden="true"
        >
          <path d="m6 9 6 6 6-6" />
        </svg>
      </div>
    </div>
  );
}
