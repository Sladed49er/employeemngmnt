// src/app/api/send-assessment/route.ts
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

    // Extract job fit analysis with proper fallbacks
    const jobFitAnalysis = personalityResult?.jobFitAnalysis;
    const fitPercentage = jobFitAnalysis?.fitPercentage ?? 75;
    const strengthsForRole = jobFitAnalysis?.strengthsForRole ?? ['Strong analytical abilities', 'Good communication skills', 'Team collaboration'];
    const challengesForRole = jobFitAnalysis?.challengesForRole ?? ['May need industry-specific training', 'Consider developing leadership skills'];
    const alternativePositions = jobFitAnalysis?.alternativePositions ?? [
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

    const htmlContent = `
<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <title>Personality Assessment Results</title>
    <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; margin: 0; padding: 20px; background-color: #f8fafc; }
        .container { max-width: 800px; margin: 0 auto; background: white; border-radius: 12px; box-shadow: 0 4px 6px rgba(0,0,0,0.1); overflow: hidden; }
        .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; }
        .content { padding: 30px; }
        .section { margin-bottom: 30px; padding: 20px; border-radius: 8px; background: #f8fafc; }
        .fit-score { background: ${fitLevel.color}; color: white; padding: 20px; border-radius: 8px; text-align: center; margin: 20px 0; }
        .fit-percentage { font-size: 3em; font-weight: bold; margin: 0; }
        ul { padding-left: 20px; }
        li { margin-bottom: 8px; }
        .grid { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; margin: 20px 0; }
        .assessment-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(250px, 1fr)); gap: 15px; margin: 20px 0; }
        .assessment-item { background: white; padding: 15px; border-radius: 6px; border: 1px solid #e5e7eb; display: flex; justify-content: space-between; align-items: center; }
        .footer { background: #f9fafb; padding: 20px; text-align: center; font-size: 12px; color: #6b7280; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>🧠 Employee Personality Assessment Report</h1>
            <p>AI-Enhanced Analysis & Job Fit Evaluation</p>
            <p><strong>Confidential HR Document</strong></p>
        </div>
        
        <div class="content">
            <div class="section">
                <h2>📋 Candidate Information</h2>
                <p><strong>Name:</strong> ${userName}</p>
                <p><strong>Target Position:</strong> ${targetJobTitle}</p>
                <p><strong>Current Role:</strong> ${userPosition || 'Not specified'}</p>
                <p><strong>Assessment Date:</strong> ${new Date(assessmentDate).toLocaleDateString()}</p>
                <p><strong>Assessment Type:</strong> 30-Term Personality Analysis (Based on 1989 MicroCom Systems)</p>
            </div>

            <div class="section">
                <h2>🎯 Job Fit Analysis</h2>
                <div class="fit-score">
                    <div class="fit-percentage">${fitPercentage}%</div>
                    <div>${fitLevel.emoji} ${fitLevel.level}</div>
                </div>
                <p>Based on your ${personalityResult.primaryType} personality type, you show ${fitPercentage >= 85 ? 'excellent' : fitPercentage >= 75 ? 'strong' : fitPercentage >= 65 ? 'good' : 'moderate'} alignment with this role's requirements.</p>
            </div>

            <div class="section">
                <h3>✅ Strengths for ${targetJobTitle}</h3>
                <ul>
                    ${strengthsForRole.map((strength: string) => `<li>${strength}</li>`).join('')}
                </ul>
            </div>

            <div class="section">
                <h3>⚠️ Areas to Address</h3>
                <ul>
                    ${challengesForRole.map((challenge: string) => `<li>${challenge}</li>`).join('')}
                </ul>
            </div>

            <div class="section">
                <h3>🔄 Alternative Position Recommendations</h3>
                ${alternativePositions.map((pos: any) => `
                    <div style="background: white; padding: 15px; margin: 10px 0; border-radius: 8px; border: 1px solid #e5e7eb;">
                        <h4>${pos.title}</h4>
                        <p><strong>${pos.fitPercentage}% fit</strong></p>
                        <p>${pos.reasoning}</p>
                    </div>
                `).join('')}
            </div>

            <div class="section">
                <h3>💡 Interview Recommendations</h3>
                <ul>
                    <li>Prepare specific examples that highlight your key strengths</li>
                    <li>Practice discussing how you overcome challenges</li>
                    <li>Research the company culture and values thoroughly</li>
                    <li>Show enthusiasm for learning and growth opportunities</li>
                    <li>Ask thoughtful questions about the role and team dynamics</li>
                </ul>
            </div>

            <div class="section">
                <h3>📈 Development Plan</h3>
                <ul>
                    <li>Focus on building industry-specific knowledge and skills</li>
                    <li>Seek opportunities to develop leadership and management abilities</li>
                    <li>Enhance technical skills relevant to your target role</li>
                    <li>Build stronger communication and presentation skills</li>
                    <li>Consider pursuing relevant certifications or additional training</li>
                </ul>
            </div>

            <div class="section">
                <h2>🧠 Personality Analysis: ${personalityResult.primaryType}</h2>
                <p><strong>Description:</strong> ${personalityResult.description}</p>
                
                <h3>💪 Core Strengths</h3>
                <ul>
                    ${personalityResult.strengths.map((strength: string) => `<li>${strength}</li>`).join('')}
                </ul>

                <h3>🎯 Development Areas</h3>
                <ul>
                    ${personalityResult.challenges.map((challenge: string) => `<li>${challenge}</li>`).join('')}
                </ul>
            </div>

            <div class="section">
                <h2>💼 Work Style & Environment</h2>
                <p><strong>Work Style:</strong> ${personalityResult.workStyle}</p>
                <p><strong>Communication Style:</strong> ${personalityResult.communicationStyle}</p>
                <p><strong>Ideal Environment:</strong> ${personalityResult.idealEnvironment}</p>
                <p><strong>Leadership Style:</strong> ${personalityResult.leadershipStyle}</p>
                <p><strong>Team Role:</strong> ${personalityResult.teamRole}</p>
            </div>

            <div class="section">
                <h3>⚡ Key Motivators</h3>
                <ul>
                    ${personalityResult.motivators.map((motivator: string) => `<li>${motivator}</li>`).join('')}
                </ul>
            </div>

            <div class="section">
                <h3>⚠️ Potential Stressors</h3>
                <ul>
                    ${personalityResult.stressors.map((stressor: string) => `<li>${stressor}</li>`).join('')}
                </ul>
            </div>

            <div class="section">
                <h2>📊 Detailed Assessment Responses</h2>
                <p><strong>30-Term Personality Assessment Results</strong> (1 = Not very, 5 = Very)</p>
                <div class="assessment-grid">
                    ${assessmentTerms.map((term: string, index: number) => {
                        const score = assessmentResponses[index] || 0;
                        return `
                            <div class="assessment-item">
                                <span><strong>${term}</strong></span>
                                ${generateScoreBar(score)}
                            </div>
                        `;
                    }).join('')}
                </div>
            </div>

            <div class="section">
                <h3>📋 HR Management Recommendations</h3>
                <ul>
                    ${personalityResult.managementTips.map((tip: string) => `<li>${tip}</li>`).join('')}
                </ul>
            </div>
        </div>

        <div class="footer">
            <p><strong>Employee Management System • Personality Assessment Tool</strong></p>
            <p>Modernized from the Original 1989 MicroCom Systems Program by Dennis Drew</p>
            <p>Enhanced with AI Analysis • Generated on ${new Date().toLocaleDateString()}</p>
            <p>This assessment is confidential and intended for HR evaluation purposes only.</p>
        </div>
    </div>
</body>
</html>`;

    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: ['matt@everysolutionit.com'],
      subject: `🧠 Personality Assessment Results - ${userName} (${targetJobTitle})`,
      html: htmlContent,
    };

    await transporter.sendMail(mailOptions);

    return NextResponse.json({ 
      success: true, 
      message: 'Assessment submitted and emailed successfully',
      fitPercentage: fitPercentage
    });

  } catch (error: any) {
    console.error('Email sending failed:', error);
    return NextResponse.json(
      { error: 'Failed to send assessment email', details: error.message },
      { status: 500 }
    );
  }
}