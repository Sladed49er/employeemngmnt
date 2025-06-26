import { NextRequest, NextResponse } from 'next/server';
import nodemailer from 'nodemailer';

export async function POST(request: NextRequest) {
  try {
    const data = await request.json();
    const {
      userName,
      userPosition,
      targetJobTitle,
      assessmentDate,
      personalityResult,
      assessmentResponses,
      assessmentTerms
    } = data;

    console.log('📧 Email API received data:', {
      userName,
      targetJobTitle,
      hasPersonalityResult: !!personalityResult,
      hasJobFitAnalysis: !!personalityResult?.jobFitAnalysis,
      receivedFitPercentage: personalityResult?.jobFitAnalysis?.fitPercentage
    });

    // Extract job fit analysis - should now contain dynamic data
    const jobFitAnalysis = personalityResult?.jobFitAnalysis;
    
    if (!jobFitAnalysis) {
      console.error('❌ No job fit analysis received!');
      return NextResponse.json({ 
        error: 'No job fit analysis data received' 
      }, { status: 400 });
    }

    // Use the CALCULATED fit percentage (not fallback!)
    const fitPercentage = jobFitAnalysis.fitPercentage;
    
    if (fitPercentage === undefined || fitPercentage === null) {
      console.error('❌ Fit percentage is missing!', { jobFitAnalysis });
      return NextResponse.json({ 
        error: 'Fit percentage not calculated properly' 
      }, { status: 400 });
    }

    console.log('✅ Using dynamic fit percentage:', fitPercentage);

    // Extract with proper fallbacks for other fields
    const strengthsForRole = jobFitAnalysis.strengthsForRole || ['Strong analytical abilities', 'Good communication skills', 'Team collaboration'];
    const challengesForRole = jobFitAnalysis.challengesForRole || ['May need industry-specific training', 'Consider developing leadership skills'];
    const alternativePositions = jobFitAnalysis.alternativePositions || [
      { title: "Project Coordinator", fitPercentage: 82, reasoning: "Organizational skills align well" },
      { title: "Customer Relations", fitPercentage: 78, reasoning: "People skills are a strong match" }
    ];

    // Create transporter
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASSWORD,
      },
    });

    const getFitLevel = (percentage: number) => {
      if (percentage >= 85) return { level: 'Excellent Match', color: '#10b981', emoji: '🎯' };
      if (percentage >= 75) return { level: 'Strong Match', color: '#3b82f6', emoji: '🔵' };
      if (percentage >= 65) return { level: 'Good Match', color: '#8b5cf6', emoji: '🟣' };
      return { level: 'Moderate Match', color: '#f59e0b', emoji: '🟡' };
    };

    const fitLevel = getFitLevel(fitPercentage);

    const generateScoreBar = (score: number) => {
      const percentage = (score / 5) * 100;
      return `
        <div style="display: flex; align-items: center; gap: 10px;">
          <span>${score}/5</span>
          <div style="width: 100px; height: 6px; background: #e5e7eb; border-radius: 3px; overflow: hidden;">
            <div style="height: 100%; width: ${percentage}%; background: linear-gradient(90deg, #ef4444, #f59e0b, #eab308, #22c55e, #10b981);"></div>
          </div>
        </div>
      `;
    };

    // Mobile-Responsive Email Template
    const htmlContent = `
<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Personality Assessment Results</title>
    <style>
        /* Mobile-first responsive email styles */
        @media only screen and (max-width: 600px) {
            .container { width: 100% !important; }
            .content { padding: 15px !important; }
            .section { padding: 15px !important; margin-bottom: 20px !important; }
            .fit-percentage { font-size: 2.5em !important; }
            .assessment-grid { display: block !important; }
            .assessment-item { margin-bottom: 10px !important; display: block !important; }
            .grid { display: block !important; }
            .grid > div { margin-bottom: 15px !important; }
            h1 { font-size: 24px !important; }
            h2 { font-size: 20px !important; }
            h3 { font-size: 18px !important; }
        }
    </style>
</head>
<body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; margin: 0; padding: 0; background-color: #f8fafc;">
    
    <!-- Main Container -->
    <table class="container" style="max-width: 800px; margin: 0 auto; background: white; border-radius: 12px; box-shadow: 0 4px 6px rgba(0,0,0,0.1); width: 100%;" cellpadding="0" cellspacing="0">
        
        <!-- Header -->
        <tr>
            <td style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 12px 12px 0 0;">
                <h1 style="margin: 0 0 10px 0; font-size: 28px;">🧠 Employee Personality Assessment Report</h1>
                <p style="margin: 5px 0; font-size: 16px;">AI-Enhanced Analysis & Job Fit Evaluation</p>
                <p style="margin: 5px 0; font-weight: bold;">Confidential HR Document</p>
            </td>
        </tr>
        
        <!-- Content Area -->
        <tr>
            <td class="content" style="padding: 30px;">
                
                <!-- Candidate Information -->
                <table style="width: 100%; margin-bottom: 30px; padding: 20px; border-radius: 8px; background: #f8fafc;" cellpadding="0" cellspacing="0">
                    <tr>
                        <td>
                            <h2 style="margin: 0 0 15px 0; color: #333;">📋 Candidate Information</h2>
                            <p style="margin: 5px 0;"><strong>Name:</strong> ${userName}</p>
                            <p style="margin: 5px 0;"><strong>Target Position:</strong> ${targetJobTitle}</p>
                            <p style="margin: 5px 0;"><strong>Current Role:</strong> ${userPosition || 'Not specified'}</p>
                            <p style="margin: 5px 0;"><strong>Assessment Date:</strong> ${new Date(assessmentDate).toLocaleDateString()}</p>
                            <p style="margin: 5px 0;"><strong>Assessment Type:</strong> 30-Term Personality Analysis</p>
                        </td>
                    </tr>
                </table>

                <!-- Job Fit Analysis -->
                <table style="width: 100%; margin-bottom: 30px;" cellpadding="0" cellspacing="0">
                    <tr>
                        <td>
                            <h2 style="margin: 0 0 15px 0; color: #333;">🎯 Job Fit Analysis</h2>
                            <table style="background: ${fitLevel.color}; color: white; padding: 20px; border-radius: 8px; text-align: center; width: 100%; margin: 20px 0;" cellpadding="20" cellspacing="0">
                                <tr>
                                    <td>
                                        <div class="fit-percentage" style="font-size: 3em; font-weight: bold; margin: 0;">${fitPercentage}%</div>
                                        <div style="font-size: 18px; margin-top: 10px;">${fitLevel.emoji} ${fitLevel.level}</div>
                                    </td>
                                </tr>
                            </table>
                            <p style="margin: 15px 0;"><strong>Fit Reasoning:</strong> ${jobFitAnalysis.fitReasoning || `Based on your ${personalityResult.primaryType} personality type, you show ${fitPercentage >= 85 ? 'excellent' : fitPercentage >= 75 ? 'strong' : fitPercentage >= 65 ? 'good' : 'moderate'} alignment with this role's requirements.`}</p>
                        </td>
                    </tr>
                </table>

                <!-- Strengths -->
                <table style="width: 100%; margin-bottom: 30px; padding: 20px; border-radius: 8px; background: #f8fafc;" cellpadding="0" cellspacing="0">
                    <tr>
                        <td>
                            <h3 style="margin: 0 0 15px 0; color: #333;">✅ Strengths for ${targetJobTitle}</h3>
                            <ul style="padding-left: 20px; margin: 0;">
                                ${strengthsForRole.map((strength: string) => `<li style="margin-bottom: 8px;">${strength}</li>`).join('')}
                            </ul>
                        </td>
                    </tr>
                </table>

                <!-- Challenges -->
                <table style="width: 100%; margin-bottom: 30px; padding: 20px; border-radius: 8px; background: #f8fafc;" cellpadding="0" cellspacing="0">
                    <tr>
                        <td>
                            <h3 style="margin: 0 0 15px 0; color: #333;">⚠️ Areas to Address</h3>
                            <ul style="padding-left: 20px; margin: 0;">
                                ${challengesForRole.map((challenge: string) => `<li style="margin-bottom: 8px;">${challenge}</li>`).join('')}
                            </ul>
                        </td>
                    </tr>
                </table>

                <!-- Alternative Positions -->
                <table style="width: 100%; margin-bottom: 30px; padding: 20px; border-radius: 8px; background: #f8fafc;" cellpadding="0" cellspacing="0">
                    <tr>
                        <td>
                            <h3 style="margin: 0 0 15px 0; color: #333;">🔄 Alternative Position Recommendations</h3>
                            ${alternativePositions.map((pos: any) => `
                                <table style="background: white; padding: 15px; margin: 10px 0; border-radius: 8px; border: 1px solid #e5e7eb; width: 100%;" cellpadding="15" cellspacing="0">
                                    <tr>
                                        <td>
                                            <h4 style="margin: 0 0 5px 0;">${pos.title}</h4>
                                            <p style="margin: 5px 0; font-weight: bold;">${pos.fitPercentage}% fit</p>
                                            <p style="margin: 5px 0;">${pos.reasoning}</p>
                                        </td>
                                    </tr>
                                </table>
                            `).join('')}
                        </td>
                    </tr>
                </table>

                <!-- Interview Tips -->
                <table style="width: 100%; margin-bottom: 30px; padding: 20px; border-radius: 8px; background: #f8fafc;" cellpadding="0" cellspacing="0">
                    <tr>
                        <td>
                            <h3 style="margin: 0 0 15px 0; color: #333;">💡 Interview Recommendations</h3>
                            <ul style="padding-left: 20px; margin: 0;">
                                ${jobFitAnalysis.interviewTips?.map((tip: string) => `<li style="margin-bottom: 8px;">${tip}</li>`).join('') || '<li style="margin-bottom: 8px;">Prepare specific examples that highlight your key strengths</li><li style="margin-bottom: 8px;">Practice discussing how you overcome challenges</li><li style="margin-bottom: 8px;">Research the company culture and values thoroughly</li><li style="margin-bottom: 8px;">Show enthusiasm for learning and growth opportunities</li><li style="margin-bottom: 8px;">Ask thoughtful questions about the role and team dynamics</li>'}
                            </ul>
                        </td>
                    </tr>
                </table>

                <!-- Development Plan -->
                <table style="width: 100%; margin-bottom: 30px; padding: 20px; border-radius: 8px; background: #f8fafc;" cellpadding="0" cellspacing="0">
                    <tr>
                        <td>
                            <h3 style="margin: 0 0 15px 0; color: #333;">📈 Development Plan</h3>
                            <ul style="padding-left: 20px; margin: 0;">
                                ${jobFitAnalysis.developmentPlan?.map((item: string) => `<li style="margin-bottom: 8px;">${item}</li>`).join('') || '<li style="margin-bottom: 8px;">Focus on building industry-specific knowledge and skills</li><li style="margin-bottom: 8px;">Seek opportunities to develop leadership and management abilities</li><li style="margin-bottom: 8px;">Enhance technical skills relevant to your target role</li><li style="margin-bottom: 8px;">Build stronger communication and presentation skills</li><li style="margin-bottom: 8px;">Consider pursuing relevant certifications or additional training</li>'}
                            </ul>
                        </td>
                    </tr>
                </table>

                <!-- Personality Analysis -->
                <table style="width: 100%; margin-bottom: 30px; padding: 20px; border-radius: 8px; background: #f8fafc;" cellpadding="0" cellspacing="0">
                    <tr>
                        <td>
                            <h2 style="margin: 0 0 15px 0; color: #333;">🧠 Personality Analysis: ${personalityResult.primaryType}</h2>
                            <p style="margin: 10px 0;"><strong>Description:</strong> ${personalityResult.description}</p>
                            
                            <h3 style="margin: 20px 0 10px 0; color: #333;">💪 Core Strengths</h3>
                            <ul style="padding-left: 20px; margin: 0 0 20px 0;">
                                ${personalityResult.strengths.map((strength: string) => `<li style="margin-bottom: 8px;">${strength}</li>`).join('')}
                            </ul>

                            <h3 style="margin: 20px 0 10px 0; color: #333;">🎯 Development Areas</h3>
                            <ul style="padding-left: 20px; margin: 0;">
                                ${personalityResult.challenges.map((challenge: string) => `<li style="margin-bottom: 8px;">${challenge}</li>`).join('')}
                            </ul>
                        </td>
                    </tr>
                </table>

                <!-- Work Style -->
                <table style="width: 100%; margin-bottom: 30px; padding: 20px; border-radius: 8px; background: #f8fafc;" cellpadding="0" cellspacing="0">
                    <tr>
                        <td>
                            <h2 style="margin: 0 0 15px 0; color: #333;">💼 Work Style & Environment</h2>
                            <p style="margin: 10px 0;"><strong>Work Style:</strong> ${personalityResult.workStyle}</p>
                            <p style="margin: 10px 0;"><strong>Communication Style:</strong> ${personalityResult.communicationStyle}</p>
                            <p style="margin: 10px 0;"><strong>Ideal Environment:</strong> ${personalityResult.idealEnvironment}</p>
                            <p style="margin: 10px 0;"><strong>Leadership Style:</strong> ${personalityResult.leadershipStyle}</p>
                            <p style="margin: 10px 0;"><strong>Team Role:</strong> ${personalityResult.teamRole}</p>
                        </td>
                    </tr>
                </table>

                <!-- Key Motivators -->
                <table style="width: 100%; margin-bottom: 30px; padding: 20px; border-radius: 8px; background: #f8fafc;" cellpadding="0" cellspacing="0">
                    <tr>
                        <td>
                            <h3 style="margin: 0 0 15px 0; color: #333;">⚡ Key Motivators</h3>
                            <ul style="padding-left: 20px; margin: 0;">
                                ${personalityResult.motivators.map((motivator: string) => `<li style="margin-bottom: 8px;">${motivator}</li>`).join('')}
                            </ul>
                        </td>
                    </tr>
                </table>

                <!-- Potential Stressors -->
                <table style="width: 100%; margin-bottom: 30px; padding: 20px; border-radius: 8px; background: #f8fafc;" cellpadding="0" cellspacing="0">
                    <tr>
                        <td>
                            <h3 style="margin: 0 0 15px 0; color: #333;">⚠️ Potential Stressors</h3>
                            <ul style="padding-left: 20px; margin: 0;">
                                ${personalityResult.stressors.map((stressor: string) => `<li style="margin-bottom: 8px;">${stressor}</li>`).join('')}
                            </ul>
                        </td>
                    </tr>
                </table>

                <!-- Detailed Assessment Responses -->
                <table style="width: 100%; margin-bottom: 30px; padding: 20px; border-radius: 8px; background: #f8fafc;" cellpadding="0" cellspacing="0">
                    <tr>
                        <td>
                            <h2 style="margin: 0 0 15px 0; color: #333;">📊 Detailed Assessment Responses</h2>
                            <p style="margin: 10px 0;"><strong>30-Term Personality Assessment Results</strong> (1 = Not very, 5 = Very)</p>
                            <table style="width: 100%; margin: 20px 0;" cellpadding="8" cellspacing="0">
                                ${assessmentTerms.map((term: string, index: number) => {
                                    const score = assessmentResponses[index] || 0;
                                    const percentage = (score / 5) * 100;
                                    return `
                                        <tr style="border-bottom: 1px solid #e5e7eb;">
                                            <td style="padding: 8px; font-weight: bold; width: 40%;">${term}</td>
                                            <td style="padding: 8px; width: 30%;">${score}/5</td>
                                            <td style="padding: 8px; width: 30%;">
                                                <div style="width: 100%; height: 6px; background: #e5e7eb; border-radius: 3px; overflow: hidden;">
                                                    <div style="height: 100%; width: ${percentage}%; background: linear-gradient(90deg, #ef4444, #f59e0b, #eab308, #22c55e, #10b981);"></div>
                                                </div>
                                            </td>
                                        </tr>
                                    `;
                                }).join('')}
                            </table>
                        </td>
                    </tr>
                </table>

                <!-- HR Management Recommendations -->
                <table style="width: 100%; margin-bottom: 30px; padding: 20px; border-radius: 8px; background: #f8fafc;" cellpadding="0" cellspacing="0">
                    <tr>
                        <td>
                            <h3 style="margin: 0 0 15px 0; color: #333;">📋 HR Management Recommendations</h3>
                            <ul style="padding-left: 20px; margin: 0;">
                                ${personalityResult.managementTips.map((tip: string) => `<li style="margin-bottom: 8px;">${tip}</li>`).join('')}
                            </ul>
                        </td>
                    </tr>
                </table>

                <!-- Assessment Summary -->
                <table style="width: 100%; margin-bottom: 30px; padding: 20px; border-radius: 8px; background: #e8f4fd; border: 2px solid #3b82f6;" cellpadding="0" cellspacing="0">
                    <tr>
                        <td style="text-align: center;">
                            <h3 style="margin: 0 0 10px 0; color: #1e40af;">📊 Assessment Summary</h3>
                            <p style="margin: 5px 0; font-size: 18px; font-weight: bold;">Candidate: ${userName}</p>
                            <p style="margin: 5px 0; font-size: 18px; font-weight: bold;">Position: ${targetJobTitle}</p>
                            <p style="margin: 5px 0; font-size: 24px; font-weight: bold; color: ${fitLevel.color};">Job Fit: ${fitPercentage}%</p>
                            <p style="margin: 5px 0;">Personality Type: ${personalityResult.primaryType}</p>
                        </td>
                    </tr>
                </table>

            </td>
        </tr>

        <!-- Footer -->
        <tr>
            <td style="background: #f9fafb; padding: 20px; text-align: center; font-size: 12px; color: #6b7280; border-radius: 0 0 12px 12px;">
                <p style="margin: 5px 0;"><strong>Employee Management System • Personality Assessment Tool</strong></p>
                <p style="margin: 5px 0;">Modernized from the Original 1989 MicroCom Systems Program by Dennis Drew</p>
                <p style="margin: 5px 0;">Enhanced with AI Analysis • Generated on ${new Date().toLocaleDateString()}</p>
                <p style="margin: 5px 0;">This assessment is confidential and intended for HR evaluation purposes only.</p>
                <p style="margin: 5px 0; font-weight: bold;">Dynamic Fit Percentage: ${fitPercentage}% calculated for ${targetJobTitle}</p>
            </td>
        </tr>
        
    </table>
    
    <!-- Mobile spacing -->
    <div style="height: 20px;"></div>
    
</body>
</html>`;

    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: ['heidi@duncanins.com', 'matt@everysolutionit.com'],
      subject: `🧠 Personality Assessment Results - ${userName} (${fitPercentage}% fit for ${targetJobTitle})`,
      html: htmlContent,
    };

    await transporter.sendMail(mailOptions);

    console.log('✅ Email sent successfully with dynamic fit percentage:', fitPercentage);

    return NextResponse.json({ 
      success: true, 
      message: 'Assessment submitted and emailed successfully',
      fitPercentage: fitPercentage
    });

  } catch (error: any) {
    console.error('❌ Email sending failed:', error);
    return NextResponse.json(
      { error: 'Failed to send assessment email', details: error.message },
      { status: 500 }
    );
  }
}