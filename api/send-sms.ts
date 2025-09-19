export const config = { runtime: "edge" };

export default async function handler(req: Request) {
  const cors = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Headers": "content-type",
    "Access-Control-Allow-Methods": "POST,OPTIONS",
  };
  if (req.method === "OPTIONS") return new Response("", { headers: cors });
  if (req.method !== "POST")
    return new Response("Method Not Allowed", { status: 405, headers: cors });

  const { to, body, token } = await req.json();
  const SHARED_TOKEN = process.env.SHARED_TOKEN || "";
  const HUBTEL_CLIENT_ID = process.env.HUBTEL_CLIENT_ID || "";
  const HUBTEL_CLIENT_SECRET = process.env.HUBTEL_CLIENT_SECRET || "";
  const HUBTEL_SENDER_ID = process.env.HUBTEL_SENDER_ID || "";

  if (SHARED_TOKEN && token !== SHARED_TOKEN)
    return new Response(JSON.stringify({ error: "unauthorized" }), {
      status: 401,
      headers: cors,
    });
  if (!to || !body)
    return new Response(JSON.stringify({ error: "to and body required" }), {
      status: 400,
      headers: cors,
    });
  if (!/^\+\d{8,15}$/.test(String(to)))
    return new Response(
      JSON.stringify({ error: "invalid phone (use E.164)" }),
      { status: 400, headers: cors }
    );

  const auth = btoa(`${HUBTEL_CLIENT_ID}:${HUBTEL_CLIENT_SECRET}`);
  const form = new URLSearchParams({
    From: HUBTEL_SENDER_ID,
    To: String(to),
    Content: String(body),
  });

  const r = await fetch("https://smsc.hubtel.com/v1/messages/send", {
    method: "POST",
    headers: {
      Authorization: `Basic ${auth}`,
      "Content-Type": "application/x-www-form-urlencoded",
      Accept: "application/json",
    },
    body: form.toString(),
  });

  const j = await r.json().catch(() => ({}));
  if (!r.ok)
    return new Response(JSON.stringify(j), { status: r.status, headers: cors });
  return new Response(JSON.stringify({ ok: true, result: j }), {
    headers: cors,
  });
}
