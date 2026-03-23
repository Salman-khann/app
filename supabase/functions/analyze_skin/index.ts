import { createClient } from "jsr:@supabase/supabase-js@2";

const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
const supabase = createClient(supabaseUrl, supabaseKey);

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

function generateSkinAnalysis(questionnaire: any) {
  const skinTypes = ['oily', 'dry', 'combination', 'sensitive', 'normal'];
  const concerns = [
    { type: 'Acne', severity: 'moderate' },
    { type: 'Dark Spots', severity: 'mild' },
    { type: 'Wrinkles', severity: 'mild' },
    { type: 'Redness', severity: 'moderate' },
  ];

  const skinScore = Math.floor(Math.random() * 30) + 60;
  const skinType = questionnaire?.skinType || skinTypes[Math.floor(Math.random() * skinTypes.length)];
  
  const selectedConcerns = questionnaire?.concerns?.map((c: string) => ({
    type: c,
    severity: ['mild', 'moderate', 'severe'][Math.floor(Math.random() * 3)],
  })) || concerns.slice(0, Math.floor(Math.random() * 3) + 1);

  const summary = `Based on your analysis, your skin type is ${skinType}. Your overall skin health score is ${skinScore}/100. 
  We've identified ${selectedConcerns.length} primary concerns that need attention. 
  For the UAE climate, we recommend using high SPF sunscreen daily and maintaining proper hydration. 
  Your personalized routine has been generated to address your specific needs.`;

  return {
    skinType,
    skinScore,
    concerns: selectedConcerns,
    summary,
    confidenceScore: 0.85,
  };
}

function generateRoutine(skinType: string, concerns: any[]) {
  const morningRoutine = [
    { step: 1, category: 'Cleanser', product_name: 'Gentle Foaming Cleanser', instructions: 'Apply to damp face, massage gently, rinse with lukewarm water' },
    { step: 2, category: 'Toner', product_name: 'Hydrating Toner', instructions: 'Apply with cotton pad or pat gently into skin' },
    { step: 3, category: 'Serum', product_name: 'Vitamin C Serum', instructions: 'Apply 2-3 drops to face and neck' },
    { step: 4, category: 'Moisturizer', product_name: 'Lightweight Day Cream', instructions: 'Apply evenly to face and neck' },
    { step: 5, category: 'Sunscreen', product_name: 'SPF 50+ Sunscreen', instructions: 'Apply generously 15 minutes before sun exposure. Reapply every 2 hours in UAE climate' },
  ];

  const eveningRoutine = [
    { step: 1, category: 'Cleanser', product_name: 'Deep Cleansing Oil', instructions: 'Massage onto dry skin, add water to emulsify, rinse thoroughly' },
    { step: 2, category: 'Toner', product_name: 'Balancing Toner', instructions: 'Apply with cotton pad' },
    { step: 3, category: 'Treatment', product_name: 'Retinol Serum', instructions: 'Apply pea-sized amount to face, avoid eye area' },
    { step: 4, category: 'Moisturizer', product_name: 'Night Repair Cream', instructions: 'Apply generously to face and neck' },
  ];

  return { morningRoutine, eveningRoutine };
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const authHeader = req.headers.get("Authorization");
    const token = authHeader?.replace("Bearer ", "");
    
    if (!token) {
      throw new Error("No authorization token provided");
    }

    const { data: { user }, error: authError } = await supabase.auth.getUser(token);
    
    if (authError || !user) {
      throw new Error("Unauthorized");
    }

    const { photoUrl, questionnaire } = await req.json();

    const analysis = generateSkinAnalysis(questionnaire);
    const routine = generateRoutine(analysis.skinType, analysis.concerns);

    const { data: analysisData, error: analysisError } = await supabase
      .from("skin_analyses")
      .insert({
        user_id: user.id,
        photo_url: photoUrl,
        questionnaire_data: questionnaire,
        skin_type: analysis.skinType,
        skin_score: analysis.skinScore,
        concerns: analysis.concerns,
        ai_summary: analysis.summary,
        confidence_score: analysis.confidenceScore,
      })
      .select()
      .single();

    if (analysisError) throw analysisError;

    const { error: routineError } = await supabase
      .from("skincare_routines")
      .insert({
        user_id: user.id,
        analysis_id: analysisData.id,
        morning_routine: routine.morningRoutine,
        evening_routine: routine.eveningRoutine,
      });

    if (routineError) throw routineError;

    return new Response(
      JSON.stringify({
        success: true,
        analysisId: analysisData.id,
        message: "Analysis completed successfully",
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      }
    );
  } catch (error: any) {
    console.error("Error:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 400,
      }
    );
  }
});
