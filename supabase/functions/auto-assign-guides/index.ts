
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.38.4'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

Deno.serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    // Create a Supabase client with the Auth context of the logged in user
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      {
        global: {
          headers: { Authorization: req.headers.get('Authorization')! },
        },
      }
    )

    // Check if this is an automatic scheduled execution or manual trigger
    let isManualTrigger = false
    let adminId: string | null = null
    
    if (req.method === 'POST') {
      const { isManual, adminUserId } = await req.json()
      isManualTrigger = isManual === true
      adminId = adminUserId || null
    }

    // Check authentication for manual triggers (only admins can trigger manually)
    if (isManualTrigger && adminId) {
      const { data: userProfile, error: profileError } = await supabaseClient
        .from('profiles')
        .select('role')
        .eq('id', adminId)
        .single()
      
      if (profileError || !userProfile || userProfile.role !== 'admin') {
        return new Response(
          JSON.stringify({ error: 'Not authorized to trigger auto-assignment' }),
          { 
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            status: 403
          }
        )
      }
    }

    console.log('Starting auto-assignment process')
    
    // Find hikes that are within 2 days and don't have an assigned guide
    const { data: unassignedHikes, error: hikesError } = await supabaseClient
      .from('hikes')
      .select('*')
      .is('assigned_guide_id', null)
      .gte('date', new Date().toISOString().split('T')[0]) // Today or future
      .lte('date', new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]) // Within 2 days
    
    if (hikesError) {
      throw hikesError
    }
    
    console.log(`Found ${unassignedHikes?.length || 0} unassigned hikes`)
    
    const assignmentResults = []
    
    // For each unassigned hike, find a guide
    for (const hike of unassignedHikes || []) {
      const hikeDate = new Date(hike.date + 'T00:00:00')
      const dayOfWeek = hikeDate.getDay() // 0-6, where 0 is Sunday
      
      // Find an available guide for this time slot
      const { data: availableGuides, error: guidesError } = await supabaseClient
        .from('guide_availability')
        .select('guide_id')
        .eq('day_of_week', dayOfWeek)
        .lte('start_time', hike.time)
        .gte('end_time', hike.time)
      
      if (guidesError) {
        console.error('Error finding available guides:', guidesError)
        continue
      }
      
      if (!availableGuides || availableGuides.length === 0) {
        console.log(`No available guides found for hike ${hike.id} at ${hike.time}`)
        assignmentResults.push({
          hikeId: hike.id,
          hikeName: hike.name,
          assigned: false,
          reason: 'No available guides'
        })
        continue
      }
      
      // Get guide IDs
      const guideIds = availableGuides.map(g => g.guide_id)
      
      // Verify they are actually guides (role = guide)
      const { data: verifiedGuides, error: verifyError } = await supabaseClient
        .from('profiles')
        .select('id')
        .eq('role', 'guide')
        .in('id', guideIds)
      
      if (verifyError) {
        console.error('Error verifying guides:', verifyError)
        continue
      }
      
      if (!verifiedGuides || verifiedGuides.length === 0) {
        console.log(`No verified guides found for hike ${hike.id}`)
        assignmentResults.push({
          hikeId: hike.id,
          hikeName: hike.name,
          assigned: false,
          reason: 'No verified guides'
        })
        continue
      }
      
      // Check if guides aren't already assigned to other hikes at this time
      const availableGuideIds = []
      
      for (const guide of verifiedGuides) {
        const { data: existingAssignments, error: assignmentError } = await supabaseClient
          .from('hikes')
          .select('id')
          .eq('assigned_guide_id', guide.id)
          .eq('date', hike.date)
          .eq('time', hike.time)
        
        if (assignmentError) {
          console.error('Error checking existing assignments:', assignmentError)
          continue
        }
        
        if (!existingAssignments || existingAssignments.length === 0) {
          availableGuideIds.push(guide.id)
        }
      }
      
      if (availableGuideIds.length === 0) {
        console.log(`No available guides found for hike ${hike.id} - all are already assigned`)
        assignmentResults.push({
          hikeId: hike.id,
          hikeName: hike.name,
          assigned: false,
          reason: 'All guides already assigned'
        })
        continue
      }
      
      // Pick the first available guide
      const selectedGuideId = availableGuideIds[0]
      
      // Assign the guide to the hike
      const { data: updateResult, error: updateError } = await supabaseClient
        .from('hikes')
        .update({ assigned_guide_id: selectedGuideId })
        .eq('id', hike.id)
        .select()
      
      if (updateError) {
        console.error('Error assigning guide:', updateError)
        assignmentResults.push({
          hikeId: hike.id,
          hikeName: hike.name,
          assigned: false,
          reason: 'Database error'
        })
        continue
      }
      
      console.log(`Successfully assigned guide ${selectedGuideId} to hike ${hike.id}`)
      assignmentResults.push({
        hikeId: hike.id,
        hikeName: hike.name,
        assigned: true,
        guideId: selectedGuideId
      })
    }
    
    return new Response(
      JSON.stringify({
        success: true,
        message: `Auto-assignment completed. Processed ${unassignedHikes?.length || 0} hikes.`,
        results: assignmentResults
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200
      }
    )
  } catch (error) {
    console.error('Error in auto-assign function:', error)
    
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500
      }
    )
  }
})
