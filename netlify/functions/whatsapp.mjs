// Sends each website enquiry to the owner's WhatsApp through CallMeBot.
// The secret key is NOT in the website code: set it on Netlify under
// Site configuration > Environment variables:
//   CALLMEBOT_KEY  = the API key CallMeBot sent you on WhatsApp
//   WHATSAPP_PHONE = 917676519189   (optional, this is the default)
export default async (req) => {
  if (req.method !== "POST") return new Response("Method not allowed", { status: 405 });
  const key = process.env.CALLMEBOT_KEY;
  const phone = (process.env.WHATSAPP_PHONE || "917676519189").replace(/\D/g, "");
  if (!key) return new Response("WhatsApp alert is not set up (CALLMEBOT_KEY missing)", { status: 500 });

  let text = "";
  try { ({ text } = await req.json()); } catch { /* bad body */ }
  text = String(text || "").trim().slice(0, 1500);
  if (!text) return new Response("Empty message", { status: 400 });

  const url = "https://api.callmebot.com/whatsapp.php?phone=" + phone +
    "&text=" + encodeURIComponent(text) + "&apikey=" + encodeURIComponent(key);
  try {
    const r = await fetch(url);
    const body = await r.text();
    const ok = r.ok && !/error|invalid|not valid/i.test(body);
    return new Response(ok ? "OK" : "CallMeBot did not accept the message", { status: ok ? 200 : 502 });
  } catch (err) {
    return new Response("Could not reach CallMeBot", { status: 502 });
  }
};
