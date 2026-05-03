import Image from "next/image";
import { getInitials } from "./schedule-utils";

export function Avatar({
  photoUrl,
  name,
  size,
}: {
  photoUrl: string | null;
  name: string;
  size: 'sm' | 'lg';
}) {
  const sizeClass = size === 'lg' ? 'h-12 w-12 text-sm' : 'h-8 w-8 text-[11px]';

  if (photoUrl) {
    return (
      <Image
        src={photoUrl}
        alt={name}
        title={name}
        className={`${sizeClass} rounded-full border border-zinc-700 object-cover`}
      />
    );
  }

  return (
    <div
      title={name}
      className={`${sizeClass} flex items-center justify-center rounded-full border border-zinc-700 bg-zinc-800 font-semibold text-zinc-200`}
    >
      {getInitials(name)}
    </div>
  );
}
