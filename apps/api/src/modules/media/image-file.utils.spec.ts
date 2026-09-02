import { isSupportedImageFile, normalizeImageMimeType } from "./image-file.utils";

describe("image file utilities", () => {
  it.each([
    ["image/jpg", "image/jpeg"],
    ["image/pjpeg", "image/jpeg"],
    ["image/x-png", "image/png"],
    ["IMAGE/WEBP", "image/webp"],
  ])("normalizes the declared MIME type %s", (input, expected) => {
    expect(normalizeImageMimeType(input)).toBe(expected);
  });

  it("accepts a JPEG signature reported with a common JPEG alias", () => {
    expect(
      isSupportedImageFile(createImageFile("image/jpg", Buffer.from([0xff, 0xd8, 0xff, 0xe0]))),
    ).toBe(true);
  });

  it("still rejects a declared type that does not match the file signature", () => {
    expect(
      isSupportedImageFile(
        createImageFile(
          "image/jpeg",
          Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]),
        ),
      ),
    ).toBe(false);
  });
});

function createImageFile(mimetype: string, buffer: Buffer): Express.Multer.File {
  return {
    fieldname: "image",
    originalname: "sample",
    encoding: "7bit",
    mimetype,
    size: buffer.length,
    destination: "",
    filename: "",
    path: "",
    buffer,
    stream: undefined as never,
  };
}
