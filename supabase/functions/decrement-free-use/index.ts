import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

Deno.serve(async (req) => {
  // Handle CORS preflight
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Get authorization header
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      return new Response(
        JSON.stringify({ error: "Missing authorization header" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Create Supabase client with user's JWT
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseAnonKey = Deno.env.get("SUPABASE_ANON_KEY")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    
    // Client to verify user
    const supabaseUser = createClient(supabaseUrl, supabaseAnonKey, {
      global: { headers: { Authorization: authHeader } },
    });

    // Verify the user
    const { data: { user }, error: userError } = await supabaseUser.auth.getUser();
    if (userError || !user) {
      return new Response(
        JSON.stringify({ error: "Invalid user" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Use service role to update profile securely
    const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey);

    // Get current profile
    const { data: profile, error: profileError } = await supabaseAdmin
      .from("profiles")
      .select("free_uses_remaining, is_paid")
      .eq("id", user.id)
      .single();

    if (profileError || !profile) {
      return new Response(
        JSON.stringify({ error: "Profile not found" }),
        { status: 404, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // If user is paid, no need to decrement
    if (profile.is_paid) {
      return new Response(
        JSON.stringify({ 
          success: true, 
          is_paid: true, 
          free_uses_remaining: profile.free_uses_remaining,
          access_granted: true 
        }),
        { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Check if user has free uses remaining
    if (profile.free_uses_remaining <= 0) {
      return new Response(
        JSON.stringify({ 
          success: false, 
          is_paid: false, 
          free_uses_remaining: 0,
          access_granted: false,
          error: "No free uses remaining" 
        }),
        { status: 403, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Decrement free uses (server-side, secure)
    const newFreeUses = profile.free_uses_remaining - 1;
    const { error: updateError } = await supabaseAdmin
      .from("profiles")
      .update({ free_uses_remaining: newFreeUses })
      .eq("id", user.id);

    if (updateError) {
      return new Response(
        JSON.stringify({ error: "Failed to update profile" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    return new Response(
      JSON.stringify({ 
        success: true, 
        is_paid: false, 
        free_uses_remaining: newFreeUses,
        access_granted: true 
      }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );

  } catch (error) {
    console.error("Error in decrement-free-use:", error);
    return new Response(
      JSON.stringify({ error: "Internal server error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
