import { ClockIcon, MapPinIcon, Squares2X2Icon } from "@heroicons/react/24/outline";
import Link from "next/link";

const discoveryItems = [
  { label: "تازه‌ها", href: "/explore", icon: ClockIcon },
  { label: "ولایت‌ها", href: "/provinces", icon: MapPinIcon },
  { label: "موضوع‌ها", href: "/categories", icon: Squares2X2Icon },
] as const;

function MobileHomeDiscovery() {
  return (
    <nav aria-label="راه‌های دسترسی به مطالب" className="relative z-20 -mt-7 px-4 md:hidden">
      <div className="grid grid-cols-3 gap-2 rounded-bubble border border-line-soft bg-surface p-2 shadow-lift">
        {discoveryItems.map((item) => {
          const Icon = item.icon;

          return (
            <Link
              key={item.href}
              href={item.href}
              className="flex min-h-16 flex-col items-center justify-center gap-1.5 rounded-[14px_14px_14px_4px] text-[12px] font-semibold text-ink outline-none transition-colors hover:bg-brand-soft hover:text-brand-ink focus-visible:outline-2 focus-visible:outline-ring"
            >
              <Icon className="size-5 text-brand" aria-hidden="true" />
              {item.label}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}

export { MobileHomeDiscovery };
