function createUserInitials(displayName: string) {
  const initials = displayName
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part[0]);

  return initials.length > 1 ? initials.join("\u200C") : (initials[0] ?? "");
}

const userAvatarColorClasses = [
  "bg-brand-soft text-brand-ink",
  "bg-tint-navy text-lapis dark:text-copy",
  "bg-tint-sand text-saffron-deep dark:text-gold",
  "bg-ok-soft text-ok",
  "bg-tint-rose text-anar dark:text-brand-ink",
  "bg-line-soft text-ink",
] as const;

function getUserAvatarColorClass(seed: string) {
  let hash = 0;

  for (let index = 0; index < seed.length; index += 1) {
    hash = (hash * 31 + seed.charCodeAt(index)) >>> 0;
  }

  return userAvatarColorClasses[hash % userAvatarColorClasses.length] ?? userAvatarColorClasses[0];
}

export { createUserInitials, getUserAvatarColorClass };
