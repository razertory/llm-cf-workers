addEventListener('fetch', event => {
    event.respondWith(handleRequest(event.request))
  });
  
  const CORS_HEADERS = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "*",
    "Access-Control-Allow-Headers": "*"
  };
  
  async function handleRequest(request) {
    if (request.method === "OPTIONS") {
      return new Response(null, { headers: CORS_HEADERS });
    }
  
    const url = new URL(request.url);
    const { pathname, searchParams } = url;
  
    if (pathname === "/") {
      return new Response(`
  <!DOCTYPE html>
  <html>
  <head>
    <meta charset="UTF-8">
    <title>Google PaLM API proxy on Cloudflare Worker</title>
  </head>
  <body>
    <h1 id="google-palm-api-proxy-on-cloudflare-worker">Google PaLM API proxy on Cloudflare Worker</h1>
    <p>Tips: This project uses a reverse proxy to solve problems such as location restrictions in Google APIs.</p>
    <p>If you have any of the following requirements, you may need the support of this project:</p>
    <ol>
    <li>When you see the error message "User location is not supported for the API use" when calling the Google PaLM API</li>
    <li>You want to customize the Google PaLM API</li>
    </ol>
  </body>
  </html>`, {
        headers: {
          ...CORS_HEADERS,
          "content-type": "text/html"
        },
      });
    }
  
    const apiURL = new URL(pathname, "https://generativelanguage.googleapis.com");
    searchParams.delete("_path");
  
    searchParams.forEach((value, key) => {
      apiURL.searchParams.append(key, value);
    });
  
    const headers = pickHeaders(request.headers, ["content-type", "x-goog-api-client", "x-goog-api-key"]);
  
    const apiResponse = await fetch(apiURL.toString(), {
      body: request.method === "GET" ? null : request.body,
      method: request.method,
      headers,
    });
  
    const responseHeaders = {
      ...CORS_HEADERS,
      ...Object.fromEntries(apiResponse.headers)
    };
  
    return new Response(apiResponse.body, {
      headers: responseHeaders,
      status: apiResponse.status
    });
  }
  
  function pickHeaders(headers, keys) {
    const picked = new Headers();
    keys.forEach(key => {
      const value = headers.get(key);
      if (value) picked.set(key, value);
    });
    return picked;
  }
  