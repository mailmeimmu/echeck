import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "npm:@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-application-name',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Content-Type': 'application/json'
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL');
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');

    if (!supabaseUrl || !supabaseKey) {
      throw new Error('Missing environment variables');
    }

    const supabase = createClient(supabaseUrl, supabaseKey);

    // Parse request body
    const {
      external_booking_id,
      property_type_id,
      booking_date,
      booking_time,
      location,
      notes,
      admin_notes,
      phone_number,
      package_id
    } = await req.json();

    // Validate required fields
    if (!property_type_id || !booking_date || !booking_time || !location || !phone_number || !package_id) {
      return new Response(
        JSON.stringify({ success: false, message: 'Missing required booking fields' }),
        { headers: corsHeaders, status: 400 }
      );
    }

    // Insert booking into the bookings table
    const { data, error } = await supabase
      .from('bookings')
      .insert([{
        external_booking_id,
        property_type_id,
        booking_date,
        booking_time,
        location,
        notes,
        admin_notes,
        phone_number,
        package_id
      }])
      .select()
      .single();

    if (error) {
      return new Response(
        JSON.stringify({ success: false, message: error.message }),
        { headers: corsHeaders, status: 400 }
      );
    }

    return new Response(
      JSON.stringify({ success: true, booking: data }),
      { headers: corsHeaders, status: 200 }
    );

  } catch (error) {
    console.error('Error in create_admin_booking:', error);

    return new Response(
      JSON.stringify({
        success: false,
        message: error instanceof Error ? error.message : 'Unknown error occurred'
      }),
      { headers: corsHeaders, status: 500 }
    );
  }
});