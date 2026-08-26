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
      <div className="grid grid-cols-3 gap-2 rounded-2xl border border-border/80 bg-card p-2 shadow-[0_12px_30px_rgba(31,41,55,0.1)]">
        {discoveryItems.map((item) => {
          const Icon = item.icon;

          return (
            <Link
              key={item.href}
              href={item.href}
              className="flex min-h-16 flex-col items-center justify-center gap-1.5 rounded-xl text-[12px] font-semibold text-foreground outline-none transition-colors hover:bg-primary-light/45 hover:text-primary focus-visible:ring-3 focus-visible:ring-ring/40"
            >
              <Icon className="size-5 text-primary" aria-hidden="true" />
              {item.label}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}

export { MobileHomeDiscovery };
