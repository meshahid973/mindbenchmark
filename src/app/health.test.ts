import { describe, expect, it } from "vitest";
import { handleHealth, onRequest } from "../../functions/api/health";

describe("Pages health function", () => {
  it("returns a non-cacheable health response", async () => {
    const result = onRequest({ request: new Request("https://example.test/api/health") });

    expect(result.status).toBe(200);
    expect(result.headers.get("Cache-Control")).toBe("no-store");
    expect(await result.json()).toEqual({ status: "ok", service: "mindbenchmark" });
  });

  it("rejects unsupported methods", async () => {
    const result = handleHealth(
      new Request("https://example.test/api/health", { method: "POST" }),
    );

    expect(result.status).toBe(405);
    expect(result.headers.get("Allow")).toBe("GET");
  });
});
