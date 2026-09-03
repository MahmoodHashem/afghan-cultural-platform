import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { test } from "node:test";

const webRoot = process.cwd();
const read = (path) => readFileSync(resolve(webRoot, path), "utf8");

test("the shared editor routes published revisions through revision APIs", () => {
  const editor = read("src/features/entries/components/create-entry-form.tsx");
  const images = read("src/features/entries/hooks/use-staged-entry-images.ts");
  assert.match(editor, /revisionMode\s*\? getEntryRevision/);
  assert.match(editor, /revisionMode\s*\? updateEntryRevision\s*: updateEntryDraft/);
  assert.match(editor, /submitEntryRevision/);
  assert.match(editor, /replaceEntryRevisionTags/);
  assert.match(images, /uploadEntryRevisionImage/);
  assert.match(images, /revisionMode/);
});

test("profile preserves one entry row and exposes revision continuation", () => {
  const profile = read("src/features/profile/components/owner-profile-page.tsx");
  assert.match(profile, /entry\.activeRevision/);
  assert.match(profile, /startEntryRevision/);
  assert.match(profile, /mode=revision/);
  assert.match(profile, /تغییرات در انتظار بررسی/);
});

test("moderation provides a dedicated revision queue and decisions", () => {
  const api = read("src/features/moderation/api/moderation-api.ts");
  const navigation = read("src/features/moderation/components/moderator-navigation.tsx");
  assert.match(api, /\/moderation\/revisions/);
  assert.match(api, /request-revision/);
  assert.match(navigation, /\/moderator\/revisions/);
});
