const categories = {
  routine: {
    label: "Routine follow-up",
    action: "Add the summary to the normal callback queue.",
  },
  priority: {
    label: "Priority follow-up",
    action: "Move the summary to the priority callback queue for prompt review.",
  },
  urgent: {
    label: "Urgent review",
    action: "Notify the designated on-call person and preserve a concise callback summary.",
  },
};

function classify(url) {
  const context = url.searchParams.get("context") || "general";
  const timing = url.searchParams.get("timing") || "flexible";
  const concern = url.searchParams.get("concern") === "true";
  const score =
    (context === "appointment" ? 3 : context === "customer" ? 2 : 1) +
    (timing === "hour" ? 3 : timing === "today" ? 2 : 1) +
    (concern ? 4 : 0);
  const key = score >= 8 ? "urgent" : score >= 5 ? "priority" : "routine";
  return { ...categories[key], inputs: { context, timing, concern } };
}

function page(origin) {
  return `<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width,initial-scale=1">
  <title>Missed-call follow-up classifier</title>
  <meta name="description" content="A safe edge API example that classifies synthetic missed-call follow-up signals.">
  <link rel="canonical" href="${origin}/">
  <style>
    :root{font-family:Inter,ui-sans-serif,system-ui,sans-serif;color:#13243a;background:#f3f8f8}
    *{box-sizing:border-box}body{margin:0}main{width:min(780px,calc(100% - 32px));margin:52px auto}
    .tag{color:#087f78;font-size:.78rem;font-weight:800;letter-spacing:.09em;text-transform:uppercase}
    h1{font-size:clamp(2.1rem,6vw,3.7rem);line-height:1.02;letter-spacing:-.045em;margin:.4rem 0 1rem}
    .intro{max-width:680px;color:#506077;font-size:1.06rem;line-height:1.65}
    .card{margin-top:28px;background:#fff;border:1px solid #d5e4e5;border-radius:20px;padding:24px;box-shadow:0 18px 48px rgba(28,71,77,.1)}
    .grid{display:grid;grid-template-columns:repeat(3,1fr);gap:14px}label{display:grid;gap:7px;font-weight:750;font-size:.88rem}
    select{padding:12px;border:1px solid #adc7ca;border-radius:11px;background:#fff;font:inherit;color:#13243a}
    .output{margin-top:22px;padding:19px;border-radius:14px;background:#e8f7f5;border-left:5px solid #0b8f86}
    .output strong{font-size:1.3rem}.output p{margin:.45rem 0 0;color:#40556a;line-height:1.5}
    code{display:block;margin-top:18px;padding:14px;border-radius:12px;background:#172638;color:#d9f7f3;overflow:auto;white-space:pre-wrap}
    footer{margin-top:26px;color:#596b80;line-height:1.6}a{color:#08756f;font-weight:800}
    @media(max-width:650px){main{margin:30px auto}.grid{grid-template-columns:1fr}.card{padding:18px}}
  </style>
</head>
<body>
<main>
  <div class="tag">Cloudflare Worker example</div>
  <h1>Missed-call follow-up classifier</h1>
  <p class="intro">This small edge API turns synthetic call signals into a deterministic follow-up label. It contains no customer data, phone numbers, credentials, production endpoints, or external network requests.</p>
  <section class="card">
    <div class="grid">
      <label>Caller context<select id="context"><option value="general">General inquiry</option><option value="customer">Existing customer</option><option value="appointment">Active appointment</option></select></label>
      <label>Time sensitivity<select id="timing"><option value="flexible">Flexible</option><option value="today">Today</option><option value="hour">Within one hour</option></select></label>
      <label>Safety concern<select id="concern"><option value="false">None stated</option><option value="true">Potential concern</option></select></label>
    </div>
    <div class="output" aria-live="polite"><strong id="label">Routine follow-up</strong><p id="action">Add the summary to the normal callback queue.</p></div>
    <code id="request">GET /api/classify?context=general&amp;timing=flexible&amp;concern=false</code>
  </section>
  <footer>This is an educational example, not an emergency service or a substitute for a business's escalation policy. Learn about <a href="https://skipcalls.com">SkipCalls</a>, an AI phone receptionist for small businesses.</footer>
</main>
<script>
  const fields=[context,timing,concern];
  async function update(){
    const query=new URLSearchParams({context:context.value,timing:timing.value,concern:concern.value});
    request.textContent="GET /api/classify?"+query;
    const result=await fetch("/api/classify?"+query).then(response=>response.json());
    label.textContent=result.label;action.textContent=result.action;
  }
  fields.forEach(field=>field.addEventListener("change",update));
</script>
</body>
</html>`;
}

export default {
  async fetch(request) {
    const url = new URL(request.url);
    if (url.pathname === "/robots.txt") {
      return new Response("User-agent: *\nAllow: /\n", {
        headers: { "content-type": "text/plain; charset=utf-8" },
      });
    }
    if (url.pathname === "/api/classify") {
      return Response.json(classify(url), {
        headers: { "cache-control": "public, max-age=60" },
      });
    }
    if (url.pathname !== "/") {
      return new Response("Not found", { status: 404 });
    }
    return new Response(page(url.origin), {
      headers: {
        "content-type": "text/html; charset=utf-8",
        "content-security-policy":
          "default-src 'none'; style-src 'unsafe-inline'; script-src 'unsafe-inline'; connect-src 'self'; base-uri 'none'; frame-ancestors 'none'",
      },
    });
  },
};
