export default {
  async fetch(request, env) {
    const url = new URL(request.url);

    // ✅ Shorten URL
    if (request.method === "POST" && url.pathname === "/shorten") {
      const data = await request.json();
      const code = data.code || Math.random().toString(36).substring(2, 8);
      await env.URLS.put(code, data.url);
      return new Response(JSON.stringify({
        short: `https://${url.hostname}/${code}`
      }), {
        headers: { "Content-Type": "application/json" }
      });
    }

    // ✅ Redirect
    const code = url.pathname.slice(1);
    if (code) {
      const target = await env.URLS.get(code);
      if (target) {
        return Response.redirect(target, 301);
      }
    }

    return new Response("❌ Link Not Found", { status: 404 });
  }
}
