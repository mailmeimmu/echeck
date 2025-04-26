import { supabase } from '../lib/supabase';

export interface InspectionData {
  propertyAge: number;
  totalArea: number;
  floorCount: number;
  foundationType: string;
  foundationCondition: string;
  wallCondition: string;
  roofCondition: string;
  electricalSystem: {
    condition: string;
    mainPanelCapacity: string;
    wiringType: string;
    hasGrounding: boolean;
    notes: string;
  };
  plumbingSystem: {
    condition: string;
    pipeType: string;
    waterHeaterCondition: string;
    notes: string;
  };
  hvacSystem: {
    condition: string;
    type: string;
    age: string;
    notes: string;
  };
  fireProtection: {
    hasFireAlarms: boolean;
    hasSprinklers: boolean;
    hasFireExtinguishers: boolean;
    emergencyExits: boolean;
    notes: string;
  };
  generalNotes: string;
  recommendations: string;
  urgentIssues: string;
}

export const inspectionService = {
  async createInspection(bookingId: string, data: InspectionData) {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Not authenticated');

    // Start a transaction using supabase's rpc call
    const { data: inspection, error: inspectionError } = await supabase
      .from('inspections')
      .insert([{
        booking_id: bookingId,
        engineer_id: user.id,
        property_age: data.propertyAge,
        total_area: data.totalArea,
        floor_count: data.floorCount,
        foundation_type: data.foundationType,
        foundation_condition: data.foundationCondition,
        wall_condition: data.wallCondition,
        roof_condition: data.roofCondition
      }])
      .select()
      .single();

    if (inspectionError) throw inspectionError;

    // Insert building systems
    const systemsPromises = [
      // Electrical system
      supabase.from('inspection_systems').insert({
        inspection_id: inspection.id,
        system_type: 'electrical',
        condition: data.electricalSystem.condition,
        details: {
          mainPanelCapacity: data.electricalSystem.mainPanelCapacity,
          wiringType: data.electricalSystem.wiringType,
          hasGrounding: data.electricalSystem.hasGrounding
        },
        notes: data.electricalSystem.notes
      }),
      // Plumbing system
      supabase.from('inspection_systems').insert({
        inspection_id: inspection.id,
        system_type: 'plumbing',
        condition: data.plumbingSystem.condition,
        details: {
          pipeType: data.plumbingSystem.pipeType,
          waterHeaterCondition: data.plumbingSystem.waterHeaterCondition
        },
        notes: data.plumbingSystem.notes
      }),
      // HVAC system
      supabase.from('inspection_systems').insert({
        inspection_id: inspection.id,
        system_type: 'hvac',
        condition: data.hvacSystem.condition,
        details: {
          type: data.hvacSystem.type,
          age: data.hvacSystem.age
        },
        notes: data.hvacSystem.notes
      })
    ];

    // Insert safety features
    const safetyPromise = supabase.from('inspection_safety').insert({
      inspection_id: inspection.id,
      has_fire_alarms: data.fireProtection.hasFireAlarms,
      has_sprinklers: data.fireProtection.hasSprinklers,
      has_fire_extinguishers: data.fireProtection.hasFireExtinguishers,
      has_emergency_exits: data.fireProtection.emergencyExits,
      notes: data.fireProtection.notes
    });

    // Insert notes
    const notesPromise = supabase.from('inspection_notes').insert({
      inspection_id: inspection.id,
      general_notes: data.generalNotes,
      recommendations: data.recommendations,
      urgent_issues: data.urgentIssues
    });

    // Wait for all promises to resolve
    await Promise.all([...systemsPromises, safetyPromise, notesPromise]);

    return inspection;
  },

  async getInspection(inspectionId: string) {
    const { data: inspection, error: inspectionError } = await supabase
      .from('inspections')
      .select(`
        *,
        systems:inspection_systems(*),
        safety:inspection_safety(*),
        notes:inspection_notes(*)
      `)
      .eq('id', inspectionId)
      .single();

    if (inspectionError) throw inspectionError;
    return inspection;
  },

  async getInspectionsByBooking(bookingId: string) {
    const { data: inspections, error } = await supabase
      .from('inspections')
      .select(`
        *,
        systems:inspection_systems(*),
        safety:inspection_safety(*),
        notes:inspection_notes(*)
      `)
      .eq('booking_id', bookingId);

    if (error) throw error;
    return inspections;
  }
};