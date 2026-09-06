import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { test } from "node:test";

const webRoot = process.cwd();

function read(relativePath) {
  return readFileSync(resolve(webRoot, relativePath), "utf8");
}

const errorMessages = read("src/lib/api/api-error-messages.ts");
const fieldErrors = read("src/lib/api/api-field-errors.ts");

for (const [code, message] of [
  ["AUTH_INVALID_CREDENTIALS", "ایمیل یا رمز عبور نادرست است."],
  ["ENTRY_TAXONOMY_INVALID", "موضوع، نوع مطلب یا ولایت انتخاب‌شده معتبر نیست."],
  ["IMAGE_TOO_LARGE", "حجم تصویر بیشتر از حد مجاز است."],
  ["MODERATION_CONFLICT", "بررسی‌کننده دیگری زودتر تصمیم گرفته است."],
  ["PROFILE_NOT_FOUND", "پروفایل پیدا نشد."],
]) {
  test(`maps ${code} to Persian`, () => {
    assert.match(errorMessages, new RegExp(`${code}: \\"${message}\\"`));
  });
}

test("supports framework and generic fallbacks", () => {
  assert.match(errorMessages, /HTTP_401: "برای ادامه باید وارد حساب شوید\."/);
  assert.match(
    errorMessages,
    /const genericApiErrorMessage = "انجام این درخواست ممکن نشد\. دوباره تلاش کنید\."/,
  );
});

test("localizes dynamic validator messages without exposing raw English", () => {
  assert.match(fieldErrors, /must not be greater than/);
  assert.match(fieldErrors, /باید حداکثر/);
  assert.match(fieldErrors, /must not be less than/);
  assert.match(fieldErrors, /باید دست‌کم/);
});
