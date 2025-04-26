import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "npm:@supabase/supabase-js@2";
import { SMTPClient } from "npm:emailjs@4.0.3";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-application-name',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Content-Type': 'application/json'
};

// Initialize SMTP client
const smtp = new SMTPClient({
  user: Deno.env.get('SMTP_USER'),
  password: Deno.env.get('SMTP_PASSWORD'),
  host: Deno.env.get('SMTP_HOST'),
  port: parseInt(Deno.env.get('SMTP_PORT') || '587'),
  tls: true,
});

function generateSecurePassword(length = 12) {
  const charset = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*';
  let password = '';
  for (let i = 0; i < length; i++) {
    const randomIndex = Math.floor(Math.random() * charset.length);
    password += charset[randomIndex];
  }
  return password;
}

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
    const { requestId } = await req.json();

    if (!requestId) {
      return new Response(
        JSON.stringify({ success: false, message: 'Request ID is required' }),
        { headers: corsHeaders, status: 400 }
      );
    }

    // Get the engineer request
    const { data: request, error: requestError } = await supabase
      .from('engineer_requests')
      .select('*')
      .eq('id', requestId)
      .single();

    if (requestError) throw requestError;
    if (!request) {
      return new Response(
        JSON.stringify({ success: false, message: 'Engineer request not found' }),
        { headers: corsHeaders, status: 404 }
      );
    }

    if (request.status !== 'pending') {
      return new Response(
        JSON.stringify({ success: false, message: 'Request is not pending' }),
        { headers: corsHeaders, status: 400 }
      );
    }

    // Generate password for the new user
    const password = generateSecurePassword();

    // Declare authData in outer scope for cleanup
    let authData: any = null;

    try {
      // Create auth user
      const { data, error: authError } = await supabase.auth.admin.createUser({
        email: request.email,
        password: password,
        email_confirm: true
      });
      authData = data;

      if (authError) throw authError;
      if (!authData.user) throw new Error('Failed to create user');

      // Create profile
      const { error: profileError } = await supabase
        .from('profiles')
        .insert({
          id: authData.user.id,
          email: request.email,
          first_name: request.email.split('@')[0],
          email_verified: true
        });

      if (profileError) throw profileError;

      // Create engineer record
      const { error: engineerError } = await supabase
        .from('engineers')
        .insert({
          id: authData.user.id,
          user_id: authData.user.id,
          id_number: request.id_number,
          phone_number: request.phone_number,
          status: 'active'
        });

      if (engineerError) throw engineerError;

      // Update request status
      const { error: updateError } = await supabase
        .from('engineer_requests')
        .update({ status: 'approved' })
        .eq('id', requestId);

      if (updateError) throw updateError;

      // Send approval email with credentials
      await smtp.send({
        from: Deno.env.get('SMTP_FROM'),
        to: request.email,
        subject: 'تم قبول طلب التسجيل كمهندس',
        text: `مرحباً،

تم قبول طلبك للتسجيل كمهندس في منصة شيك.

معلومات الدخول:
البريد الإلكتروني: ${request.email}
كلمة المرور: ${password}

يرجى تغيير كلمة المرور بعد تسجيل الدخول لأول مرة.

مع تحيات،
فريق شيك`
      });

      return new Response(
        JSON.stringify({ 
          success: true,
          message: 'Engineer approved and credentials sent'
        }),
        { headers: corsHeaders }
      );

    } catch (error) {
      // If any step fails, attempt to clean up
      if (authData?.user) {
        await supabase.auth.admin.deleteUser(authData.user.id);
      }
      throw error;
    }

  } catch (error) {
    console.error('Error in engineer approval:', error);
    
    return new Response(
      JSON.stringify({
        success: false,
        message: error instanceof Error ? error.message : 'Unknown error occurred'
      }),
      { headers: corsHeaders, status: 500 }
    );
  }
});