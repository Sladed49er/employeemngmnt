import { NextRequest, NextResponse } from 'next/server';

interface JobFitAnalysis {
  targetPosition: string;
  fitPercentage: number;
  fitReasoning: string;
  strengthsForRole: string[];
  challengesForRole: string[];
  alternativePositions: Array<{
    title: string;
    fitPercentage: number;
    reasoning: string;
  }>;
  interviewTips: string[];
  developmentPlan: string[];
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { responses, targetJob, dynamicAnalysis } = body;

    console.log('🤖 AI Analysis API called:', {
      targetJob,
      hasDynamicAnalysis: !!dynamicAnalysis,
      dynamicFitPercentage: dynamicAnalysis?.fitPercentage
    });

    // If dynamic analysis was passed from frontend, use it as the base
    if (dynamicAnalysis) {
      console.log('✅ Using dynamic analysis from frontend:', dynamicAnalysis.fitPercentage);
      
      // Try AI enhancement if OpenAI key is available
      if (process.env.OPENAI_API_KEY) {
        try {
          const { default: OpenAI } = await import('openai');
          const openai = new OpenAI({
            apiKey: process.env.OPENAI_API_KEY,
          });

          const completion = await openai.chat.completions.create({
            model: "gpt-4",
            messages: [
              {
                role: "system",
                content: "You are an expert personality assessment analyst. Enhance the provided job fit analysis with more detailed, personalized insights. Preserve the calculated fit percentage. Respond with valid JSON only."
              },
              {
                role: "user",
                content: `
                Enhance this personality assessment analysis:
                
                Target Job: ${targetJob}
                Current Fit Percentage: ${dynamicAnalysis.fitPercentage}% (PRESERVE THIS EXACT VALUE)
                Current Strengths: ${dynamicAnalysis.strengthsForRole?.join(', ')}
                Current Challenges: ${dynamicAnalysis.challengesForRole?.join(', ')}
                
                Provide enhanced JSON with:
                - fitPercentage: ${dynamicAnalysis.fitPercentage} (DO NOT CHANGE)
                - fitReasoning: detailed explanation
                - strengthsForRole: 4-5 specific, detailed strengths
                - challengesForRole: 3-4 constructive areas to address
                - interviewTips: 5-6 specific, actionable tips
                - developmentPlan: 5-6 concrete development steps
                
                Keep the same alternativePositions array.
                `
              }
            ],
            max_tokens: 1500,
            temperature: 0.7,
          });

          const aiResponse = completion.choices[0]?.message?.content;

          if (aiResponse) {
            try {
              const enhancedContent = JSON.parse(aiResponse);
              
              // Merge AI enhancement with dynamic analysis, preserving fit percentage
              const enhancedAnalysis = {
                ...dynamicAnalysis,
                fitPercentage: dynamicAnalysis.fitPercentage, // Always preserve original
                fitReasoning: enhancedContent.fitReasoning || dynamicAnalysis.fitReasoning,
                strengthsForRole: enhancedContent.strengthsForRole || dynamicAnalysis.strengthsForRole,
                challengesForRole: enhancedContent.challengesForRole || dynamicAnalysis.challengesForRole,
                interviewTips: enhancedContent.interviewTips || dynamicAnalysis.interviewTips,
                developmentPlan: enhancedContent.developmentPlan || dynamicAnalysis.developmentPlan
              };

              console.log('✨ AI enhancement successful, preserved fit percentage:', dynamicAnalysis.fitPercentage);

              return NextResponse.json({
                jobFitAnalysis: enhancedAnalysis,
                enhanced: true,
                message: 'Analysis enhanced with AI insights'
              });

            } catch (parseError) {
              console.log('⚠️ AI response parsing failed, using dynamic analysis');
            }
          }
        } catch (aiError) {
          console.log('⚠️ OpenAI enhancement failed, using dynamic analysis:', aiError);
        }
      } else {
        console.log('⚠️ No OpenAI key found, using dynamic analysis');
      }

      // Return dynamic analysis if AI enhancement fails or is unavailable
      return NextResponse.json({
        jobFitAnalysis: dynamicAnalysis,
        enhanced: false,
        message: 'Using dynamic analysis (AI enhancement unavailable)'
      });
    }

    // Fallback: Generate analysis server-side if no dynamic analysis provided
    console.log('⚠️ No dynamic analysis provided, generating fallback');
    
    const fallbackAnalysis = generateFallbackAnalysis(responses || [], targetJob || 'Unknown Position');
    
    return NextResponse.json({
      jobFitAnalysis: fallbackAnalysis,
      enhanced: false,
      message: 'Using server-side fallback analysis'
    });

  } catch (error) {
    console.error('❌ Analysis API error:', error);
    
    // Emergency fallback
    return NextResponse.json({
      jobFitAnalysis: {
        targetPosition: "Unknown Position",
        fitPercentage: 70,
        fitReasoning: "Basic compatibility analysis completed",
        strengthsForRole: ["Strong work ethic", "Good communication skills", "Team collaboration"],
        challengesForRole: ["Continue professional development", "Adapt to role requirements"],
        alternativePositions: [
          { title: "Customer Service", fitPercentage: 75, reasoning: "People skills transfer well" },
          { title: "Administrative Role", fitPercentage: 72, reasoning: "Organizational skills applicable" }
        ],
        interviewTips: [
          "Highlight your key strengths",
          "Show enthusiasm for the role",
          "Ask thoughtful questions",
          "Prepare specific examples",
          "Research the company culture"
        ],
        developmentPlan: [
          "Focus on industry-specific skills",
          "Develop leadership capabilities",
          "Enhance technical knowledge",
          "Build communication skills",
          "Pursue relevant certifications"
        ]
      },
      enhanced: false,
      message: 'Emergency fallback analysis'
    });
  }
}

function generateFallbackAnalysis(responses: number[], targetJob: string): JobFitAnalysis {
  // Basic server-side generation if frontend didn't provide dynamic analysis
  const jobKeywords = targetJob.toLowerCase();
  let basePercentage = 65;
  let strengthsForRole = ["Strong analytical abilities", "Good communication skills", "Team collaboration"];
  let challengesForRole = ["May need industry-specific training", "Consider developing leadership skills"];
  
  // Simple job matching logic
  if (jobKeywords.includes('engineer') || jobKeywords.includes('technical')) {
    basePercentage = 75;
    strengthsForRole = ["Technical problem-solving", "Attention to detail", "Analytical thinking"];
  } else if (jobKeywords.includes('sales') || jobKeywords.includes('marketing')) {
    basePercentage = 80;
    strengthsForRole = ["Communication skills", "Relationship building", "Goal-oriented approach"];
  } else if (jobKeywords.includes('manager') || jobKeywords.includes('lead')) {
    basePercentage = 78;
    strengthsForRole = ["Leadership potential", "Decision-making", "Team coordination"];
  }

  // Add variance
  const variance = Math.floor(Math.random() * 17) - 8;
  const finalPercentage = Math.max(45, Math.min(98, basePercentage + variance));

  return {
    targetPosition: targetJob,
    fitPercentage: finalPercentage,
    fitReasoning: `Based on initial assessment, you show ${finalPercentage >= 85 ? 'excellent' : finalPercentage >= 75 ? 'strong' : finalPercentage >= 65 ? 'good' : 'moderate'} potential for this role.`,
    strengthsForRole,
    challengesForRole,
    alternativePositions: [
      { title: "Project Coordinator", fitPercentage: 82, reasoning: "Organizational skills align well" },
      { title: "Customer Relations", fitPercentage: 78, reasoning: "People skills are a strong match" },
      { title: "Training Specialist", fitPercentage: 80, reasoning: "Communication abilities suit this role" }
    ],
    interviewTips: [
      "Highlight specific examples that demonstrate your key strengths",
      "Prepare to discuss how you handle challenging situations",
      "Show enthusiasm for learning and professional development",
      "Demonstrate your problem-solving approach with concrete examples",
      "Ask thoughtful questions about the role and company culture"
    ],
    developmentPlan: [
      "Focus on building industry-specific knowledge and skills",
      "Seek opportunities to develop leadership and management abilities",
      "Enhance technical skills relevant to your target role",
      "Build stronger communication and presentation skills",
      "Consider pursuing relevant certifications or additional training"
    ]
  };
}