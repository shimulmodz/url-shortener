function handleOptions(request) {
  return new Response(null, {
    headers: {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type",
    }
  });
}

export default {
  async fetch(request, env) {
    if (request.method === "OPTIONS") {
      return handleOptions(request);
    }

    const url = new URL(request.url);

    // === Shorten URL ===
    if (request.method === "POST" && url.pathname === "/shorten") {
      try {
        const data = await request.json();
        if (!data.url) {
          return new Response(JSON.stringify({ error: "❌ URL required" }), {
            headers: { "Content-Type": "application/json", "Access-Control-Allow-Origin": "*" },
            status: 400
          });
        }

        const code = data.code || Math.random().toString(36).substring(2, 8);
        await env.URLS.put(code, data.url);

        return new Response(JSON.stringify({
          success: true,
          short: `https://${url.hostname}/${code}`,
          long: data.url,
          code
        }), {
          headers: { "Content-Type": "application/json", "Access-Control-Allow-Origin": "*" }
        });
      } catch (err) {
        return new Response(JSON.stringify({ error: "❌ Invalid request" }), {
          headers: { "Content-Type": "application/json", "Access-Control-Allow-Origin": "*" },
          status: 400
        });
      }
    }

    // === Redirect ===
    const code = url.pathname.slice(1);
    if (code) {
      const target = await env.URLS.get(code);
      if (target) {
        return Response.redirect(target, 301);
      }
    }

    return new Response("❌ Link Not Found", {
      status: 404,
      headers: { "Access-Control-Allow-Origin": "*" }
    });
  }
}
