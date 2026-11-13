export function handleHealth(request: Request): Response {
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

export function onRequest(context: { request: Request }): Response {
  return handleHealth(context.request);
}
