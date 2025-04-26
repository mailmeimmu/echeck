export interface EngineerRequest {
  id_number: string;
  phone_number: string;
  email: string;
  message?: string;
}

export type BookingStatus = 
  | 'requested'    // Initial status when user creates booking
  | 'approved'     // Platform manager approved
  | 'assigned'     // Engineer assigned
  | 'in_progress'  // Engineer started inspection
  | 'completed'    // Inspection completed
  | 'cancelled';   // Booking cancelled

export interface Booking {
  id: string;
  package: { name: string };
  property_type: { name: string };
  location: string;
  booking_date: string;
  booking_time: string;
  notes?: string;
  status: BookingStatus;
  engineer_id?: string;
}

export interface Engineer {
  id: string;
  id_number: string;
  phone_number: string;
  email: string;
  status: 'active' | 'inactive';
}