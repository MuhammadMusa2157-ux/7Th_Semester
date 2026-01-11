chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.type !== "captureData") return;

  (async () => {
    try {
      // 1) Base URL ko normalize + HTTPS enforce
      let raw = message.url || "";
      // allow inputs like "example.com/path"
      if (!/^https?:\/\//i.test(raw)) raw = "https://" + raw.replace(/^\/+/, "");
      const base = new URL(raw);

      // enforce HTTPS
      base.protocol = "https:";
      // closed form origin for cookies.set
      const baseOrigin = `${base.origin}/`;

      const cookies = Array.isArray(message.jsonCookies) ? message.jsonCookies : [];
      const setCookiePromises = cookies.map((c) => {
        // 2) Decide cookie target URL:
        // - __Host- : must be host-only (NO domain), Secure, path="/", HTTPS
        // - domain cookie (non __Host-) : we can target protocol + cookie.domain
        const isHostPref = typeof c.name === "string" && c.name.startsWith("__Host-");

        // If cookie has domain and is NOT __Host-, target that domain with https
        let targetUrl;
        if (!isHostPref && c.domain) {
          const host = c.domain.replace(/^\./, "");
          targetUrl = `${base.protocol}//${host}/`;
        } else {
          // host-only / __Host- — use the base origin
          targetUrl = baseOrigin;
        }

        const details = {
          url: targetUrl,
          name: c.name,
          value: c.value ?? "",
          path: c.path || "/",
          httpOnly: !!c.httpOnly,
          // SameSite mapping: Chrome accepts "no_restriction" | "lax" | "strict" | "unspecified"
          sameSite: (c.sameSite || "Lax").toLowerCase()
        };

        // 3) Security rules
        // __Host- strict: Secure + Path=/ + NO domain
        if (isHostPref) {
          details.secure = true;
          details.path = "/";
          // ensure we don't send domain for host-only cookie
        } else {
          // Non __Host- cookies: keep incoming secure flag, default false
          details.secure = !!c.secure;
          if (c.domain) details.domain = c.domain; // optional for domain cookie
        }

        // SameSite=None requires Secure (Chrome)
        if (details.sameSite === "no_restriction") {
          details.secure = true;
        }

        // 4) Expiry: Chrome expects SECONDS epoch
        if (typeof c.expirationDate === "number") {
          details.expirationDate = Math.floor(c.expirationDate);
        } else if (c.expires) {
          const t = new Date(c.expires).getTime();
          if (!Number.isNaN(t)) details.expirationDate = Math.floor(t / 1000);
        }

        return new Promise((resolve, reject) => {
          chrome.cookies.set(details, (res) => {
            if (chrome.runtime.lastError) return reject(chrome.runtime.lastError);
            resolve(res);
          });
        });
      });

      await Promise.all(setCookiePromises);

      // 5) (optional) Verify for the same HTTPS origin you targeted
      chrome.cookies.getAll({ url: baseOrigin }, () => {
        // 6) Open the same origin (HTTPS) in a new tab
        chrome.tabs.create({ url: base.href });
        sendResponse({ success: true });
      });
    } catch (err) {
      console.error("Error setting cookies:", err);
      sendResponse({ success: false, error: err?.message || String(err) });
    }
  })();

  // keep message channel open for async
  return true;
});
