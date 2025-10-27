import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { eventId } = await req.json();
    
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    // Fetch event data
    const { data: event, error: eventError } = await supabaseClient
      .from('outreach_events')
      .select('*')
      .eq('id', eventId)
      .single();

    if (eventError) throw eventError;

    // Fetch existing tasks
    const { data: existingTasks } = await supabaseClient
      .from('event_tasks')
      .select('title, status, category, priority')
      .eq('event_id', eventId);

    // Fetch event statistics
    const { data: guests } = await supabaseClient
      .from('event_guests')
      .select('invitation_status')
      .eq('event_id', eventId);

    const { data: volunteers } = await supabaseClient
      .from('event_volunteers')
      .select('role, status')
      .eq('event_id', eventId);

    const { data: schedule } = await supabaseClient
      .from('event_schedules')
      .select('session_title, session_type, start_time')
      .eq('event_id', eventId);

    const { data: foodSessions } = await supabaseClient
      .from('event_food_sessions')
      .select('meal_type, estimated_attendees')
      .eq('event_id', eventId);

    const { data: sponsors } = await supabaseClient
      .from('event_sponsors')
      .select('status')
      .eq('event_id', eventId);

    const { data: vendors } = await supabaseClient
      .from('event_vendors')
      .select('status')
      .eq('event_id', eventId);

    // Build context for AI
    const context = {
      event: {
        name: event.name,
        date: event.event_date,
        location: event.location,
        types: event.event_types,
      },
      guests: {
        total: guests?.length || 0,
        confirmed: guests?.filter(g => g.invitation_status === 'confirmed').length || 0,
        pending: guests?.filter(g => g.invitation_status === 'pending').length || 0,
      },
      volunteers: {
        total: volunteers?.length || 0,
        confirmed: volunteers?.filter(v => v.status === 'confirmed').length || 0,
      },
      schedule: {
        total_sessions: schedule?.length || 0,
        sessions: schedule?.slice(0, 5).map(s => s.session_title) || [],
      },
      food: {
        sessions: foodSessions?.length || 0,
        total_estimated_attendees: foodSessions?.reduce((sum, f) => sum + (f.estimated_attendees || 0), 0) || 0,
      },
      sponsors: {
        total: sponsors?.length || 0,
        confirmed: sponsors?.filter(s => s.status === 'confirmed').length || 0,
      },
      vendors: {
        total: vendors?.length || 0,
        confirmed: vendors?.filter(v => v.status === 'confirmed').length || 0,
      },
      existing_tasks: existingTasks || [],
    };

    // Call Lovable AI
    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
    if (!LOVABLE_API_KEY) throw new Error('LOVABLE_API_KEY not configured');

    const systemPrompt = `You are an expert event planning assistant. Analyze the provided event data and suggest 3-5 actionable tasks that should be created to ensure successful event execution.

Consider:
- Tasks that haven't been created yet based on existing tasks
- Time-sensitive preparations relative to the event date
- Dependencies between different aspects of the event
- Common event planning best practices
- Resource coordination needs

Provide practical, specific task suggestions with appropriate priorities.`;

    const prompt = `Event Data: ${JSON.stringify(context, null, 2)}

Based on this event information, suggest 3-5 important tasks that should be created. Focus on tasks that:
1. Are not already covered by existing tasks
2. Are critical for event success
3. Have appropriate timing relative to the event date
4. Address potential gaps or coordination needs

For each task suggestion, provide a clear title, description, recommended priority (low/medium/high/urgent), and suggested category.`;

    const aiResponse = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${LOVABLE_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'google/gemini-2.5-flash',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: prompt }
        ],
        tools: [{
          type: "function",
          function: {
            name: "suggest_tasks",
            description: "Return 3-5 actionable task suggestions for event planning",
            parameters: {
              type: "object",
              properties: {
                suggestions: {
                  type: "array",
                  items: {
                    type: "object",
                    properties: {
                      title: { type: "string", description: "Clear, specific task title" },
                      description: { type: "string", description: "Why this task is needed and what should be done" },
                      priority: { type: "string", enum: ["low", "medium", "high", "urgent"] },
                      category: { type: "string", description: "Task category like Setup, Logistics, Coordination, etc." },
                      reasoning: { type: "string", description: "Why you're suggesting this task" }
                    },
                    required: ["title", "description", "priority", "category", "reasoning"],
                    additionalProperties: false
                  }
                }
              },
              required: ["suggestions"],
              additionalProperties: false
            }
          }
        }],
        tool_choice: { type: "function", function: { name: "suggest_tasks" } }
      }),
    });

    if (!aiResponse.ok) {
      if (aiResponse.status === 429) {
        return new Response(
          JSON.stringify({ error: 'Rate limit exceeded. Please try again later.' }),
          { status: 429, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      if (aiResponse.status === 402) {
        return new Response(
          JSON.stringify({ error: 'AI credits exhausted. Please add credits to your workspace.' }),
          { status: 402, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      const errorText = await aiResponse.text();
      console.error('AI Gateway error:', aiResponse.status, errorText);
      throw new Error(`AI Gateway error: ${aiResponse.status}`);
    }

    const aiData = await aiResponse.json();
    console.log('AI Response:', JSON.stringify(aiData, null, 2));

    // Extract suggestions from tool call
    const toolCall = aiData.choices?.[0]?.message?.tool_calls?.[0];
    let suggestions = [];

    if (toolCall?.function?.arguments) {
      const args = JSON.parse(toolCall.function.arguments);
      suggestions = args.suggestions || [];
    }

    return new Response(
      JSON.stringify({ suggestions }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Error in analyze-event-tasks:', error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : 'Unknown error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
