import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    console.log("Checking for pending task reminders...");

    // Get all reminders that are due and haven't been sent
    const now = new Date();
    const { data: dueReminders, error: remindersError } = await supabase
      .from("event_task_reminders")
      .select(`
        *,
        event_tasks (
          id,
          title,
          description,
          event_id,
          status
        )
      `)
      .lte("remind_at", now.toISOString())
      .is("sent_at", null);

    if (remindersError) {
      console.error("Error fetching reminders:", remindersError);
      throw remindersError;
    }

    console.log(`Found ${dueReminders?.length || 0} pending reminders`);

    if (!dueReminders || dueReminders.length === 0) {
      return new Response(
        JSON.stringify({ message: "No pending reminders", count: 0 }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    let sentCount = 0;
    let errorCount = 0;

    // Process each reminder
    for (const reminder of dueReminders) {
      try {
        const task = reminder.event_tasks;
        
        // Skip if task is already completed or cancelled
        if (task.status === "completed" || task.status === "cancelled") {
          console.log(`Skipping reminder for completed/cancelled task: ${task.title}`);
          continue;
        }

        // Get assigned volunteers for this task
        const { data: assignments } = await supabase
          .from("event_task_assignments")
          .select(`
            user_id,
            event_volunteers (
              name,
              email
            )
          `)
          .eq("task_id", task.id);

        if (assignments && assignments.length > 0) {
          for (const assignment of assignments) {
            const volunteer = assignment.event_volunteers as any;
            if (volunteer && typeof volunteer === 'object' && 'email' in volunteer && volunteer.email) {
              console.log(`Would send reminder to: ${volunteer.email} for task: ${task.title}`);
              // TODO: Integrate with email service (e.g., Resend)
              // For now, just log that we would send
            }
          }
        }

        // Mark reminder as sent
        const { error: updateError } = await supabase
          .from("event_task_reminders")
          .update({ sent_at: now.toISOString() })
          .eq("id", reminder.id);

        if (updateError) {
          console.error(`Error updating reminder ${reminder.id}:`, updateError);
          errorCount++;
        } else {
          sentCount++;
        }
      } catch (error) {
        console.error(`Error processing reminder ${reminder.id}:`, error);
        errorCount++;
      }
    }

    console.log(`Processed ${sentCount} reminders successfully, ${errorCount} errors`);

    return new Response(
      JSON.stringify({
        message: "Reminder processing complete",
        sent: sentCount,
        errors: errorCount,
        total: dueReminders.length,
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Error in send-task-reminders function:", error);
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    return new Response(
      JSON.stringify({ error: errorMessage }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});
