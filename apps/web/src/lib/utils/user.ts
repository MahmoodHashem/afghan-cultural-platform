function createUserInitials(displayName: string) {
  return displayName
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part[0])
    .join("");
}

const userAvatarColorClasses = [
  "bg-teal-100 text-teal-800",
  "bg-sky-100 text-sky-800",
  "bg-violet-100 text-violet-800",
  "bg-rose-100 text-rose-800",
  "bg-amber-100 text-amber-800",
  "bg-emerald-100 text-emerald-800",
  "bg-orange-100 text-orange-800",
  "bg-fuchsia-100 text-fuchsia-800",
] as const;

function getUserAvatarColorClass(seed: string) {
  let hash = 0;

  for (let index = 0; index < seed.length; index += 1) {
    hash = (hash * 31 + seed.charCodeAt(index)) >>> 0;
  }

  return (
    userAvatarColorClasses[hash % userAvatarColorClasses.length] ?? userAvatarColorClasses[0]
  );
}

export { createUserInitials, getUserAvatarColorClass };
