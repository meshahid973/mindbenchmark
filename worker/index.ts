export function handleApiRequest(request: Request): Response {
  const { pathname } = new URL(request.url);

  if (pathname === "/api/health") {
    if (request.method !== "GET") {
      return Response.json(
        { error: "Method not allowed" },
        { status: 405, headers: { Allow: "GET", "Cache-Control": "no-store" } },
      );
    }

    return Response.json(
      { status: "ok", service: "mindbenchmark" },
      { headers: { "Cache-Control": "no-store" } },
    );
  }

  return Response.json(
    { error: "Not found" },
    { status: 404, headers: { "Cache-Control": "no-store" } },
  );
}

export default {
  fetch(request: Request): Response {
    return handleApiRequest(request);
  },
};
