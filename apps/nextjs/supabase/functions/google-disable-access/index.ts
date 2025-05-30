// Enable Supabase Edge Runtime types
import "jsr:@supabase/functions-js/edge-runtime.d.ts";

Deno.serve(async (req) => {
  // Handle CORS Preflight Request
  if (req.method === "OPTIONS") {
    return new Response(null, {
      status: 204,
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "GET, POST, PATCH, OPTIONS",
        "Access-Control-Allow-Headers": "Content-Type, Authorization",
        "Access-Control-Max-Age": "86400",
      },
    });
  }
  try {
    // Lấy Bearer Token từ Header
    const authHeader = req.headers.get("Authorization");
    if (!authHeader?.startsWith("Bearer ")) {
      return new Response(
        JSON.stringify({
          error: "Missing or invalid token",
        }),
        {
          status: 401,
          headers: {
            "Content-Type": "application/json",
            "Access-Control-Allow-Origin": "*",
          },
        },
      );
    }
    const token = authHeader.split(" ")[1];
    // Xác thực token với Supabase
    const supabaseUrl = Deno.env.get("SUPABASE_URL");
    const supabaseAnonKey = Deno.env.get("SUPABASE_ANON_KEY");
    const resAuth = await fetch(`${supabaseUrl}/auth/v1/user`, {
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
        apikey: supabaseAnonKey,
      },
    });
    if (!resAuth.ok) {
      return new Response(
        JSON.stringify({
          error: "Unauthorized",
        }),
        {
          status: 401,
          headers: {
            "Content-Type": "application/json",
            "Access-Control-Allow-Origin": "*",
          },
        },
      );
    }
    const { email, suspend } = await req.json(); // suspend = true or false
    if (!email || suspend === undefined) {
      return new Response(
        JSON.stringify({
          error: "Missing email or suspend",
        }),
        {
          status: 400,
          headers: {
            "Content-Type": "application/json",
            "Access-Control-Allow-Origin": "*",
          },
        },
      );
    }
    const accessToken = await getGoogleAccessToken();
    const res = await fetch(
      `https://admin.googleapis.com/admin/directory/v1/users/${email}`,
      {
        method: "PATCH",
        headers: {
          Authorization: `Bearer ${accessToken}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          suspended: suspend,
        }),
      },
    );
    if (!res.ok) {
      const errorText = await res.text();
      console.error("Failed Google API:", errorText);
      return new Response(
        JSON.stringify({
          error: "Failed to suspend user",
          details: errorText,
        }),
        {
          status: 500,
          headers: {
            "Content-Type": "application/json",
            "Access-Control-Allow-Origin": "*",
          },
        },
      );
    }
    return new Response(
      JSON.stringify({
        message: "User suspend status updated successfully",
      }),
      {
        status: 200,
        headers: {
          "Content-Type": "application/json",
          "Access-Control-Allow-Origin": "*",
        },
      },
    );
  } catch (error) {
    console.error("Error in Edge Function:", error);
    return new Response(
      JSON.stringify({
        error: error.message,
      }),
      {
        headers: {
          "Content-Type": "application/json",
          "Access-Control-Allow-Origin": "*",
        },
        status: 500,
      },
    );
  }
});
// Function to get Google OAuth Access Token
async function getGoogleAccessToken() {
  const privateKey = Deno.env.get("GOOGLE_ADMIN_PRIVATE_KEY");
  const clientEmail = Deno.env.get("GOOGLE_ADMIN_CLIENT_EMAIL");
  const impersonateUser = Deno.env.get("GOOGLE_ADMIN_IMPERSONATE_USER");
  const iat = Math.floor(Date.now() / 1000);
  const exp = iat + 3600;
  const header = {
    alg: "RS256",
    typ: "JWT",
  };
  const payload = {
    iss: clientEmail,
    sub: impersonateUser,
    scope: "https://www.googleapis.com/auth/admin.directory.user",
    aud: "https://oauth2.googleapis.com/token",
    iat,
    exp,
  };
  const unsignedToken = [
    base64UrlEncode(header),
    base64UrlEncode(payload),
  ].join(".");

  const key = await crypto.subtle.importKey(
    "pkcs8",
    pemToArrayBuffer(privateKey),
    {
      name: "RSASSA-PKCS1-v1_5",
      hash: "SHA-256",
    },
    false,
    ["sign"],
  );
  const signature = await crypto.subtle.sign(
    "RSASSA-PKCS1-v1_5",
    key,
    new TextEncoder().encode(unsignedToken),
  );
  const signedJwt = `${unsignedToken}.${arrayBufferToBase64Url(signature)}`;
  const tokenRes = await fetch("https://oauth2.googleapis.com/token", {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: new URLSearchParams({
      grant_type: "urn:ietf:params:oauth:grant-type:jwt-bearer",
      assertion: signedJwt,
    }),
  });
  const tokenJson = await tokenRes.json();
  if (!tokenJson.access_token) {
    throw new Error("Failed to get Google Access Token");
  }
  return tokenJson.access_token;
}
// Helper: PEM to ArrayBuffer
function pemToArrayBuffer(pem) {
  const cleaned = pem
    .trim()
    .replace(/^"+|"+$/g, "") // loại dấu ngoặc kép nếu có
    .replace(/-----(BEGIN|END) PRIVATE KEY-----/g, "")
    .replace(/[\r\n]/g, "")
    .replace(/\s+/g, "");
  const binaryStr = atob(cleaned);
  const binary = new Uint8Array(binaryStr.length);
  for (let i = 0; i < binaryStr.length; i++) {
    binary[i] = binaryStr.charCodeAt(i);
  }
  return binary.buffer;
}
// Helper: Base64url encode object
function base64UrlEncode(obj) {
  return btoa(JSON.stringify(obj))
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/, "");
}
// Helper: ArrayBuffer to Base64url
function arrayBufferToBase64Url(buffer) {
  const bytes = new Uint8Array(buffer);
  let binary = "";
  for (const b of bytes) {
    binary += String.fromCharCode(b);
  }
  return btoa(binary)
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/, "");
}
