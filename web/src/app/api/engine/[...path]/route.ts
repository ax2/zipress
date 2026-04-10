const ENGINE_URL = process.env.ENGINE_URL || "http://localhost:8000";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ path: string[] }> },
) {
  const { path } = await params;
  const url = new URL(`${ENGINE_URL}/${path.join("/")}`);
  const reqUrl = new URL(request.url);
  reqUrl.searchParams.forEach((v, k) => url.searchParams.set(k, v));

  const resp = await fetch(url.toString());
  return new Response(resp.body, {
    status: resp.status,
    headers: {
      "Content-Type":
        resp.headers.get("Content-Type") || "application/octet-stream",
    },
  });
}

export async function POST(
  request: Request,
  { params }: { params: Promise<{ path: string[] }> },
) {
  const { path } = await params;
  const url = new URL(`${ENGINE_URL}/${path.join("/")}`);
  const reqUrl = new URL(request.url);
  reqUrl.searchParams.forEach((v, k) => url.searchParams.set(k, v));

  const resp = await fetch(url.toString(), {
    method: "POST",
    headers: { "Content-Type": request.headers.get("Content-Type") || "" },
    body: request.body,
    // @ts-expect-error duplex needed for streaming request body
    duplex: "half",
  });
  return new Response(resp.body, {
    status: resp.status,
    headers: {
      "Content-Type":
        resp.headers.get("Content-Type") || "application/json",
    },
  });
}
