import { supabase } from '../lib/supabase';
import { emailService } from './emailService';
import type { EngineerRequest, Booking } from '../types/engineer';

export const engineerService = {
  async requestAccess(request: EngineerRequest) {
    try {
      // First check if a request with this ID or email already exists
      const { data: existingRequest, error: checkError } = await supabase
        .from('engineer_requests')
        .select('id, status')
        .or(`id_number.eq."${request.id_number}",email.eq."${request.email}"`)
        .maybeSingle();

      if (checkError) {
        console.error('Error checking existing request:', checkError);
        throw new Error('حدث خطأ أثناء التحقق من الطلب');
      }

      if (existingRequest) {
        throw new Error('تم تقديم طلب بهذا الرقم أو البريد الإلكتروني مسبقاً');
      }

      // If no existing request, proceed with insertion
      const { error: insertError } = await supabase
        .from('engineer_requests')
        .insert(request);

      if (insertError) {
        console.error('Error inserting request:', insertError);
        if (insertError.code === '23505') { // Unique constraint violation
          throw new Error('تم تقديم طلب بهذا الرقم أو البريد الإلكتروني مسبقاً');
        }
        throw new Error('حدث خطأ أثناء تسجيل الطلب');
      }

      // Send email notification
      try {
        await emailService.sendEngineerRequestEmail(request);
      } catch (emailError) {
        console.error('Error sending email:', emailError);
      }
    } catch (error) {
      console.error('Error in requestAccess:', error);
      throw error instanceof Error ? error : new Error('حدث خطأ غير متوقع');
    }
  },

  async fetchBookings() {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      const { data, error } = await supabase
        .from('bookings')
        .select(`
          id,
          user:profiles!bookings_user_id_fkey(
            id,
            first_name,
            email
          ),
          package:packages(
            id,
            name,
            price
          ),
          property_type:property_types(
            id,
            name
          ),
          location,
          booking_date,
          booking_time,
          notes,
          status,
          engineer_id
        `)
        .or(`status.eq.approved,engineer_id.eq.${user.id}`)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Supabase error:', error);
        throw error;
      }

      return data as Booking[];
    } catch (error) {
      console.error('Error in fetchBookings:', error);
      throw error;
    }
  },

  async confirmBooking(bookingId: string) {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      const { error } = await supabase
        .from('bookings')
        .update({ 
          status: 'confirmed',
          engineer_id: user.id
        })
        .eq('id', bookingId)
        .eq('status', 'approved');

      if (error) {
        console.error('Supabase error:', error);
        throw error;
      }
    } catch (error) {
      console.error('Error in confirmBooking:', error);
      throw error;
    }
  },

  async approveEngineer(requestId: string) {
    try {
      // Get the engineer request
      const { data: request, error: requestError } = await supabase
        .from('engineer_requests')
        .select('*')
        .eq('id', requestId)
        .single();

      if (requestError) throw requestError;
      if (!request) throw new Error('Engineer request not found');

      // Create auth user
      const password = generateSecurePassword();
      const { data: authData, error: authError } = await supabase.auth.admin.createUser({
        email: request.email,
        password: password,
        email_confirm: true
      });

      if (authError) throw authError;
      if (!authData.user) throw new Error('Failed to create user');

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
      await emailService.sendEngineerApprovedEmail({
        email: request.email,
        password: password
      });

      return { success: true };
    } catch (error) {
      console.error('Error approving engineer:', error);
      throw error;
    }
  },

  async rejectEngineer(requestId: string, reason: string) {
    try {
      const { error } = await supabase
        .from('engineer_requests')
        .update({ 
          status: 'rejected',
          notes: reason
        })
        .eq('id', requestId);

      if (error) throw error;
      return { success: true };
    } catch (error) {
      console.error('Error rejecting engineer:', error);
      throw error;
    }
  },

  async listEngineerRequests(status?: string) {
    try {
      let query = supabase
        .from('engineer_requests')
        .select('*')
        .order('created_at', { ascending: false });

      if (status) {
        query = query.eq('status', status);
      }

      const { data, error } = await query;
      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error listing engineer requests:', error);
      throw error;
    }
  }
};

// Utility function to generate a secure password
function generateSecurePassword(length = 12) {
  const charset = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*';
  let password = '';
  for (let i = 0; i < length; i++) {
    const randomIndex = Math.floor(Math.random() * charset.length);
    password += charset[randomIndex];
  }
  return password;
}