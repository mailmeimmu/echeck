import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'npm:@supabase/supabase-js@2';
import { SMTPClient } from "npm:emailjs@4.0.3";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const client = new SMTPClient({
  user: Deno.env.get('SMTP_USER'),
  password: Deno.env.get('SMTP_PASSWORD'),
  host: Deno.env.get('SMTP_HOST'),
  port: parseInt(Deno.env.get('SMTP_PORT') || '587'),
  tls: true,
});

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const { type, data } = await req.json();

    let subject = '';
    let text = '';

    switch (type) {
      case 'ENGINEER_APPROVED':
        subject = 'تم قبول طلب التسجيل كمهندس';
        text = `مرحباً،

تم قبول طلبك للتسجيل كمهندس في منصة شيك.

معلومات الدخول:
البريد الإلكتروني: ${data.email}
كلمة المرور: ${data.password}

يرجى تغيير كلمة المرور بعد تسجيل الدخول لأول مرة.

مع تحيات،
فريق شيك`;
        break;

      case 'ENGINEER_REJECTED':
        subject = 'تم رفض طلب التسجيل كمهندس';
        text = `مرحباً،

نأسف لإبلاغك بأنه تم رفض طلبك للتسجيل كمهندس في منصة شيك.

سبب الرفض: ${data.reason || 'لم يتم تحديد سبب'}

يمكنك التقدم بطلب جديد في وقت لاحق.

مع تحيات،
فريق شيك`;
        break;

      default:
        throw new Error('Invalid email type');
    }

    await client.send({
      from: Deno.env.get('SMTP_FROM'),
      to: data.email,
      subject,
      text
    });

    return new Response(
      JSON.stringify({ success: true }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error sending email:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400 
      }
    );
  }
});