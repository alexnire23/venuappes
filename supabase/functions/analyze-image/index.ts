// CONFIGURACIÓN NECESARIA:
// En Supabase → Settings → Edge Functions → Secrets:
//   - ANTHROPIC_API_KEY (de console.anthropic.com → API Keys)

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { base64Data, mimeType } = await req.json();

    if (!base64Data || !mimeType) {
      return new Response(
        JSON.stringify({ error: "Missing base64Data or mimeType" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const response = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": Deno.env.get("ANTHROPIC_API_KEY") ?? "",
        "anthropic-version": "2023-06-01",
      },
      body: JSON.stringify({
        model: "claude-opus-4-5",
        max_tokens: 500,
        messages: [
          {
            role: "user",
            content: [
              {
                type: "image",
                source: {
                  type: "base64",
                  media_type: mimeType,
                  data: base64Data,
                },
              },
              {
                type: "text",
                text: `Analiza esta imagen de una lista de la compra y extrae todos los productos que puedas ver.

Devuelve SOLO un array JSON con los nombres de los productos en español, en minúsculas, uno por elemento.
Ejemplo: ["yogur", "leche", "patatas fritas", "tomate frito"]

Si no ves una lista de la compra clara, devuelve un array vacío: []

Solo devuelve el array JSON, nada más.`,
              },
            ],
          },
        ],
      }),
    });

    const data = await response.json();
    const text = data.content?.[0]?.text?.trim() ?? "[]";

    let items: string[] = [];
    try {
      items = JSON.parse(text);
    } catch {
      items = [];
    }

    return new Response(
      JSON.stringify({ items }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );

  } catch (error) {
    console.error("Error in analyze-image:", error);
    return new Response(
      JSON.stringify({ error: "Internal server error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
