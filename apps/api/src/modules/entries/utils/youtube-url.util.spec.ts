import { createCanonicalYouTubeUrl, extractYouTubeVideoId } from "./youtube-url.util";

describe("youtube-url.util", () => {
  it.each([
    ["https://www.youtube.com/watch?v=abcdefghijk"],
    ["https://youtube.com/watch?v=abcdefghijk"],
    ["https://youtu.be/abcdefghijk"],
    ["https://www.youtube.com/shorts/abcdefghijk"],
  ])("extracts a video ID from %s", (url) => {
    expect(extractYouTubeVideoId(url)).toBe("abcdefghijk");
  });

  it("rejects unsupported YouTube URLs and iframe HTML", () => {
    expect(extractYouTubeVideoId("https://vimeo.com/abcdefghijk")).toBeNull();
    expect(extractYouTubeVideoId("https://www.youtube.com/embed/abcdefghijk")).toBeNull();
    expect(
      extractYouTubeVideoId('<iframe src="https://www.youtube.com/embed/abcdefghijk"></iframe>'),
    ).toBeNull();
  });

  it("creates a canonical watch URL", () => {
    expect(createCanonicalYouTubeUrl("abcdefghijk")).toBe(
      "https://www.youtube.com/watch?v=abcdefghijk",
    );
  });
});
