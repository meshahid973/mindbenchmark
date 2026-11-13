import { describe, expect, it } from "vitest";
import { handleApiRequest } from "./index";

describe("worker API", () => {
  it("returns a non-cacheable health response", async () => {
    const result = handleApiRequest(new Request("https://example.test/api/health"));

    expect(result.status).toBe(200);
    expect(result.headers.get("Cache-Control")).toBe("no-store");
    expect(await result.json()).toEqual({ status: "ok", service: "mindbenchmark" });
  });

  it("rejects unsupported methods", async () => {
    const result = handleApiRequest(
      new Request("https://example.test/api/health", { method: "POST" }),
    );

    expect(result.status).toBe(405);
    expect(result.headers.get("Allow")).toBe("GET");
  });

  it("returns JSON 404 for unknown API endpoints", async () => {
    const result = handleApiRequest(new Request("https://example.test/api/missing"));

    expect(result.status).toBe(404);
    expect(await result.json()).toEqual({ error: "Not found" });
  });
});
