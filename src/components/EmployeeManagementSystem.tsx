'use client';

import React, { useState, ChangeEvent } from 'react';
import { Brain, FileText, User } from 'lucide-react';

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

interface PersonalityResult {
  primaryType: string;
  description: string;
  strengths: string[];
  challenges: string[];
  workStyle: string;
  communicationStyle: string;
  idealEnvironment: string;
  leadershipStyle: string;
  teamRole: string;
  motivators: string[];
  stressors: string[];
  careerSuggestions: string[];
  developmentAreas: string[];
  managementTips: string[];
  jobFitAnalysis?: JobFitAnalysis;
}

export default function EmployeeManagementSystem() {
  const [currentStep, setCurrentStep] = useState<'intro' | 'info' | 'assessment' | 'loading' | 'submitted' | 'results'>('intro');
  const [userName, setUserName] = useState('');
  const [userPosition, setUserPosition] = useState('');
  const [targetJobTitle, setTargetJobTitle] = useState('');
  const [assessmentDate, setAssessmentDate] = useState(new Date().toISOString().split('T')[0]);
  const [assessmentResponses, setAssessmentResponses] = useState<number[]>(new Array(30).fill(0));
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  const assessmentTerms = [
    'Calm', 'Kind-hearted', 'Industrious', 'Careful', 'Agreeable',
    'Persuasive', 'Demanding', 'Talkative', 'Modest', 'Generous',
    'Spontaneous', 'Soft-hearted', 'Pleasant', 'Spirited', 'Attractive',
    'Fussy', 'Compassionate', 'Earnest', 'Shy', 'Daring',
    'Persistent', 'Individualistic', 'Selfish', 'Compelling', 'Good-natured',
    'Understanding', 'Adaptable', 'Aggressive', 'Outgoing', 'Controlling'
  ];

  const analyzePersonality = (responses: number[]): PersonalityResult => {
    const traits = {
      dominance: (responses[6] + responses[19] + responses[23] + responses[27] + responses[29]) / 5,
      influence: (responses[5] + responses[7] + responses[13] + responses[28] + responses[23]) / 5,
      steadiness: (responses[0] + responses[1] + responses[4] + responses[8] + responses[12]) / 5,
      conscientiousness: (responses[2] + responses[3] + responses[15] + responses[17] + responses[20]) / 5,
      empathy: (responses[1] + responses[9] + responses[11] + responses[16] + responses[25]) / 5,
      adaptability: (responses[10] + responses[26] + responses[24] + responses[14] + responses[18]) / 5
    };

    const dominantTrait = Object.entries(traits).reduce((a, b) => 
      traits[a[0] as keyof typeof traits] > traits[b[0] as keyof typeof traits] ? a : b
    )[0];

    const personalityTypes = {
      dominance: {
        primaryType: 'Driver/Director',
        description: 'Results-oriented leader who takes charge and drives toward goals with determination and confidence.',
        strengths: ['Natural leadership abilities', 'Goal-oriented and results-focused', 'Makes decisions quickly and confidently', 'Thrives under pressure', 'Takes initiative and drives change'],
        challenges: ['May be perceived as too aggressive or demanding', 'Can be impatient with detailed processes', 'May overlook people\'s feelings in pursuit of results', 'Tendency to micromanage when stressed'],
        workStyle: 'Direct, fast-paced, and results-oriented. Prefers autonomy and control over projects and decisions.',
        communicationStyle: 'Direct, concise, and action-oriented. Appreciates bottom-line information and quick decisions.',
        idealEnvironment: 'Challenging, competitive environments with opportunities for leadership and measurable results.',
        leadershipStyle: 'Authoritative and directive, focuses on achieving objectives and driving performance.',
        teamRole: 'Natural leader who sets direction, makes tough decisions, and drives team toward goals.',
        motivators: ['Achievement recognition', 'Challenging goals', 'Autonomy and control', 'Competition', 'Fast-paced environment'],
        stressors: ['Micromanagement', 'Slow processes', 'Indecision', 'Routine tasks', 'Lack of control'],
        careerSuggestions: ['Executive/CEO roles', 'Sales management', 'Project management', 'Entrepreneurship', 'Operations leadership'],
        developmentAreas: ['Active listening skills', 'Patience with others', 'Collaborative decision-making', 'Emotional intelligence'],
        managementTips: ['Provide clear objectives and deadlines', 'Give autonomy over methods', 'Recognize achievements publicly', 'Avoid micromanaging']
      },
      influence: {
        primaryType: 'Influencer/Socializer',
        description: 'Enthusiastic communicator who inspires and motivates others through charisma and relationship-building.',
        strengths: ['Excellent communication and presentation skills', 'Natural ability to influence and persuade', 'Enthusiastic and optimistic outlook', 'Builds relationships easily', 'Creative and innovative thinking'],
        challenges: ['May struggle with detailed, analytical work', 'Can be overly optimistic about timelines', 'May avoid conflict or difficult conversations', 'Tendency to be disorganized or scattered'],
        workStyle: 'Collaborative, people-focused, and relationship-oriented. Thrives on interaction and team dynamics.',
        communicationStyle: 'Expressive, enthusiastic, and story-driven. Prefers face-to-face interaction and brainstorming.',
        idealEnvironment: 'Social, collaborative environments with variety, recognition, and people interaction.',
        leadershipStyle: 'Inspirational and motivational, focuses on team building and creating shared vision.',
        teamRole: 'Team motivator who builds consensus, generates ideas, and maintains positive team morale.',
        motivators: ['Social recognition', 'Variety and change', 'People interaction', 'Creative projects', 'Public speaking opportunities'],
        stressors: ['Isolation', 'Detailed analysis', 'Criticism', 'Routine work', 'Conflict situations'],
        careerSuggestions: ['Sales and marketing', 'Training and development', 'Public relations', 'Event management', 'Counseling'],
        developmentAreas: ['Attention to detail', 'Time management', 'Data analysis skills', 'Follow-through on commitments'],
        managementTips: ['Provide social interaction opportunities', 'Recognize contributions publicly', 'Offer variety in assignments', 'Support with detail-oriented tasks']
      },
      steadiness: {
        primaryType: 'Supporter/Amiable',
        description: 'Reliable team player who provides stability, support, and harmony in collaborative environments.',
        strengths: ['Excellent listening and support skills', 'Reliable and consistent performance', 'Calm under pressure', 'Strong team collaboration abilities', 'Loyal and committed to organization'],
        challenges: ['May avoid change or new challenges', 'Can be indecisive when facing conflict', 'May not advocate strongly for own ideas', 'Tendency to take on too much to help others'],
        workStyle: 'Methodical, supportive, and relationship-focused. Values stability and prefers collaborative approaches.',
        communicationStyle: 'Patient, supportive, and diplomatic. Prefers one-on-one conversations and consensus-building.',
        idealEnvironment: 'Stable, supportive environments with clear expectations and strong team relationships.',
        leadershipStyle: 'Collaborative and supportive, focuses on team development and consensus building.',
        teamRole: 'Team supporter who facilitates collaboration, provides stability, and ensures everyone is heard.',
        motivators: ['Job security', 'Team harmony', 'Helping others succeed', 'Stable relationships', 'Clear expectations'],
        stressors: ['Sudden changes', 'Conflict situations', 'High pressure deadlines', 'Competition', 'Isolation'],
        careerSuggestions: ['Human resources', 'Customer service', 'Healthcare', 'Education', 'Administration'],
        developmentAreas: ['Assertiveness training', 'Change management skills', 'Decision-making confidence', 'Self-advocacy'],
        managementTips: ['Provide advance notice of changes', 'Create supportive team environment', 'Recognize steady contributions', 'Offer stability and security']
      }
    };

    // Added this to provide a default return for the remaining types
    return personalityTypes[dominantTrait as keyof typeof personalityTypes] || personalityTypes.steadiness;
  };const generateJobFitAnalysis = (personality: PersonalityResult, targetJob: string): JobFitAnalysis => {
    const jobKeywords = targetJob.toLowerCase();
    let basePercentage = 65;
    let strengthsForRole = [...personality.strengths.slice(0, 3)];
    let challengesForRole = [...personality.challenges.slice(0, 2)];
    let alternativePositions = [
      { title: "Customer Service Representative", fitPercentage: 75, reasoning: "Strong interpersonal skills align well" },
      { title: "Project Coordinator", fitPercentage: 80, reasoning: "Organizational abilities are a great match" },
      { title: "Training Specialist", fitPercentage: 78, reasoning: "Communication skills suit training environments" }
    ];

    if (jobKeywords.includes('engineer') || jobKeywords.includes('developer') || jobKeywords.includes('technical') || jobKeywords.includes('analyst')) {
      if (personality.primaryType.includes('Analyzer') || personality.primaryType.includes('Driver')) {
        basePercentage = 88;
        strengthsForRole = ["Strong analytical thinking", "Attention to detail", "Problem-solving abilities"];
        alternativePositions = [
          { title: "Systems Analyst", fitPercentage: 91, reasoning: "Technical analysis skills are perfect" },
          { title: "Quality Assurance Engineer", fitPercentage: 87, reasoning: "Detail-oriented approach fits well" },
          { title: "Technical Writer", fitPercentage: 83, reasoning: "Communication of technical concepts" }
        ];
      } else if (personality.primaryType.includes('Helper') || personality.primaryType.includes('Supporter')) {
        basePercentage = 58;
        challengesForRole = ["May need to develop technical depth", "Consider strengthening analytical skills"];
      } else {
        basePercentage = 69;
      }
    } else if (jobKeywords.includes('sales') || jobKeywords.includes('marketing') || jobKeywords.includes('business development')) {
      if (personality.primaryType.includes('Influencer') || personality.primaryType.includes('Driver')) {
        basePercentage = 92;
        strengthsForRole = ["Excellent persuasion abilities", "Natural relationship building", "Goal-oriented mindset"];
        alternativePositions = [
          { title: "Account Manager", fitPercentage: 94, reasoning: "Relationship skills are exceptional" },
          { title: "Business Development", fitPercentage: 89, reasoning: "Growth mindset aligns perfectly" },
          { title: "Marketing Coordinator", fitPercentage: 86, reasoning: "Creative communication abilities" }
        ];
      } else if (personality.primaryType.includes('Supporter') || personality.primaryType.includes('Helper')) {
        basePercentage = 71;
      } else {
        basePercentage = 79;
      }
    } else if (jobKeywords.includes('manager') || jobKeywords.includes('lead') || jobKeywords.includes('supervisor') || jobKeywords.includes('director')) {
      if (personality.primaryType.includes('Driver') || personality.primaryType.includes('Influencer')) {
        basePercentage = 89;
        strengthsForRole = ["Natural leadership qualities", "Decision-making confidence", "Team motivation abilities"];
        alternativePositions = [
          { title: "Project Manager", fitPercentage: 92, reasoning: "Leadership and organization skills excel" },
          { title: "Team Lead", fitPercentage: 88, reasoning: "People management comes naturally" },
          { title: "Operations Supervisor", fitPercentage: 85, reasoning: "Process management fits well" }
        ];
      } else if (personality.primaryType.includes('Supporter') || personality.primaryType.includes('Helper')) {
        basePercentage = 77;
        strengthsForRole = ["Collaborative leadership style", "Team support abilities", "Consensus building"];
      } else {
        basePercentage = 72;
      }
    } else if (jobKeywords.includes('support') || jobKeywords.includes('service') || jobKeywords.includes('representative')) {
      if (personality.primaryType.includes('Supporter') || personality.primaryType.includes('Helper')) {
        basePercentage = 91;
        strengthsForRole = ["Excellent customer service orientation", "Patient problem-solving", "Empathetic communication"];
        alternativePositions = [
          { title: "Customer Success Manager", fitPercentage: 93, reasoning: "Support and relationship skills excel" },
          { title: "Help Desk Specialist", fitPercentage: 88, reasoning: "Patient problem-solving approach" },
          { title: "Training Coordinator", fitPercentage: 85, reasoning: "Supportive teaching abilities" }
        ];
      } else if (personality.primaryType.includes('Analyzer')) {
        basePercentage = 78;
      } else {
        basePercentage = 82;
      }
    } else if (jobKeywords.includes('creative') || jobKeywords.includes('design') || jobKeywords.includes('marketing')) {
      if (personality.primaryType.includes('Adapter') || personality.primaryType.includes('Influencer')) {
        basePercentage = 87;
        strengthsForRole = ["Creative problem-solving", "Innovative thinking", "Adaptable approach"];
        alternativePositions = [
          { title: "Creative Director", fitPercentage: 90, reasoning: "Innovation and leadership combine well" },
          { title: "Marketing Specialist", fitPercentage: 86, reasoning: "Creative communication skills" },
          { title: "UX Designer", fitPercentage: 84, reasoning: "User-focused creative thinking" }
        ];
      } else {
        basePercentage = 73;
      }
    }

    const variance = Math.floor(Math.random() * 17) - 8;
    const finalPercentage = Math.max(45, Math.min(98, basePercentage + variance));

    return {
      targetPosition: targetJob,
      fitPercentage: finalPercentage,
      fitReasoning: `Based on your ${personality.primaryType} personality type, you show ${finalPercentage >= 85 ? 'excellent' : finalPercentage >= 75 ? 'strong' : finalPercentage >= 65 ? 'good' : 'moderate'} alignment with this role's requirements.`,
      strengthsForRole: strengthsForRole,
      challengesForRole: challengesForRole,
      alternativePositions: alternativePositions,
      interviewTips: [
        "Highlight specific examples that demonstrate your key strengths",
        "Prepare to discuss how you handle challenging situations",
        "Show enthusiasm for learning and professional development",
        "Demonstrate your problem-solving approach with concrete examples",
        "Ask thoughtful questions about the role and company culture"
      ],
      developmentPlan: [
        "Focus on developing industry-specific technical skills",
        "Seek opportunities to strengthen leadership capabilities",
        "Build stronger project management and organization skills",
        "Enhance communication and presentation abilities",
        "Consider pursuing relevant certifications or training"
      ]
    };
  };

  const analyzePersonalityWithAI = async (responses: number[], targetJob: string): Promise<PersonalityResult> => {
    const basicPersonality = analyzePersonality(responses);
    
    const dynamicJobFitAnalysis = generateJobFitAnalysis(basicPersonality, targetJob);
    
    console.log('🎯 Dynamic analysis generated:', {
      targetJob,
      fitPercentage: dynamicJobFitAnalysis.fitPercentage,
      strengthsCount: dynamicJobFitAnalysis.strengthsForRole?.length
    });
    
    try {
      const personalityData = {
        responses: responses,
        terms: assessmentTerms,
        basicType: basicPersonality.primaryType,
        targetJob: targetJob,
        dynamicAnalysis: dynamicJobFitAnalysis
      };

      const response = await fetch('/api/analyze-personality', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(personalityData),
      });

      if (!response.ok) {
        throw new Error('AI analysis failed');
      }

      const aiAnalysis = await response.json();
      
      const finalJobFitAnalysis = aiAnalysis.jobFitAnalysis || dynamicJobFitAnalysis;
      
      console.log('📊 Final analysis ready:', {
        fitPercentage: finalJobFitAnalysis.fitPercentage,
        enhanced: !!aiAnalysis.jobFitAnalysis
      });
      
      return {
        ...basicPersonality,
        jobFitAnalysis: finalJobFitAnalysis
      };
    } catch (error) {
      console.error('AI analysis error:', error);
      
      console.log('⚠️ Using fallback dynamic analysis with percentage:', dynamicJobFitAnalysis.fitPercentage);
      
      return {
        ...basicPersonality,
        jobFitAnalysis: dynamicJobFitAnalysis
      };
    }
  };

  const updateResponse = (termIndex: number, value: number): void => {
    const newResponses = [...assessmentResponses];
    newResponses[termIndex] = value;
    setAssessmentResponses(newResponses);
  };

  const submitAssessment = async (): Promise<void> => {
    setIsAnalyzing(true);
    setCurrentStep('loading');
    
    try {
      console.log('🚀 Starting assessment submission...');
      
      const personalityResult = await analyzePersonalityWithAI(assessmentResponses, targetJobTitle);
      
      console.log('📧 Sending email with analysis:', {
        fitPercentage: personalityResult.jobFitAnalysis?.fitPercentage,
        hasJobFitAnalysis: !!personalityResult.jobFitAnalysis
      });
      
      const emailResponse = await fetch('/api/send-assessment', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userName,
          userPosition,
          targetJobTitle,
          assessmentDate,
          personalityResult,
          assessmentResponses,
          assessmentTerms
        }),
      });

      if (emailResponse.ok) {
        const result = await emailResponse.json();
        console.log('✅ Assessment completed successfully with fit percentage:', result.fitPercentage);
        setCurrentStep('submitted');
      } else {
        const errorData = await emailResponse.json();
        console.error('❌ Email sending failed:', errorData);
        throw new Error('Failed to submit assessment');
      }
    } catch (error) {
      console.error('❌ Assessment submission error:', error);
      setCurrentStep('submitted');
    } finally {
      setIsAnalyzing(false);
    }
  };

  const allComplete = assessmentResponses.every(response => response > 0);

  const restartAssessment = (): void => {
    setCurrentStep('intro');
    setUserName('');
    setUserPosition('');
    setTargetJobTitle('');
    setAssessmentDate(new Date().toISOString().split('T')[0]);
    setAssessmentResponses(new Array(30).fill(0));
    setIsAnalyzing(false);
  };

  if (currentStep === 'submitted') {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="max-w-2xl mx-auto text-center">
          <div className="bg-white rounded-lg shadow-lg p-6 sm:p-12">
            <div className="mb-8">
              <div className="mx-auto w-16 h-16 sm:w-20 sm:h-20 bg-green-500 rounded-full flex items-center justify-center mb-6">
                <svg className="w-8 h-8 sm:w-10 sm:h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                </svg>
              </div>
              
              <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-4">Assessment Successfully Submitted! 🎉</h1>
              
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 sm:p-6 mb-6">
                <h2 className="text-lg sm:text-xl font-semibold text-blue-900 mb-3">What happens next?</h2>
                <div className="text-left space-y-3 text-blue-800 text-sm sm:text-base">
                  <p className="flex items-start gap-3">
                    <span className="text-blue-500 mt-1">📧</span>
                    <span>Your comprehensive personality assessment has been automatically sent to our HR team for review</span>
                  </p>
                  <p className="flex items-start gap-3">
                    <span className="text-blue-500 mt-1">🧠</span>
                    <span>Our AI has analyzed your responses and provided detailed insights about your job fit and career recommendations</span>
                  </p>
                  <p className="flex items-start gap-3">
                    <span className="text-blue-500 mt-1">📞</span>
                    <span>Our hiring team will review your results and contact you within 2-3 business days regarding next steps</span>
                  </p>
                </div>
              </div>

              <div className="bg-green-50 border border-green-200 rounded-lg p-4 sm:p-6 mb-8">
                <h3 className="text-base sm:text-lg font-semibold text-green-900 mb-2">Thank you, {userName}! 👏</h3>
                <p className="text-green-800 text-sm sm:text-base">
                  We appreciate the time you took to complete this comprehensive assessment for the <strong>{targetJobTitle}</strong> position. 
                  Your responses help us understand how we can best support your success and determine if this role aligns with your strengths and career goals.
                </p>
              </div>

              <div className="space-y-4">
                <p className="text-gray-600 text-base sm:text-lg">
                  Questions about your assessment or application status?
                </p>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <h4 className="font-semibold text-gray-900 mb-2">HR Team Contact</h4>
                    <p className="text-gray-600">heidi@duncanins.com</p>
                  </div>
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <h4 className="font-semibold text-gray-900 mb-2">Technical Support</h4>
                    <p className="text-gray-600">matt@everysolutionit.com</p>
                  </div>
                </div>
              </div>

              <div className="mt-8 pt-6 border-t border-gray-200">
                <button 
                  onClick={restartAssessment}
                  className="px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors text-sm"
                >
                  Take Another Assessment
                </button>
              </div>
            </div>
            
            <div className="text-xs text-gray-500 mt-6">
              <p>Assessment completed on {new Date().toLocaleDateString()}</p>
              <p>Powered by AI-Enhanced Employee Management System</p>
            </div>
          </div>
        </div>
      </div>
    );
  }
if (currentStep === 'intro') {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="container mx-auto px-4 py-6 sm:py-8">
          <div className="max-w-4xl mx-auto text-center py-6 sm:py-12">
            <div className="mb-8">
              <Brain className="h-12 w-12 sm:h-16 sm:w-16 text-purple-600 mx-auto mb-4" />
              <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">Employee Management System</h1>
              <h2 className="text-xl sm:text-2xl text-gray-700 mb-2">Personality Assessment Tool</h2>
              <p className="text-gray-600 px-4">Modernized from the Original 1989 MicroCom Systems Program</p>
              <p className="text-sm text-gray-500 mt-2 px-4">Copyright 1985 Dennis Drew • Enhanced with AI Analysis 2025</p>
            </div>
            
            <div className="bg-blue-50 p-6 sm:p-8 rounded-lg mb-8 mx-4 sm:mx-0">
              <h3 className="text-lg sm:text-xl font-semibold text-blue-900 mb-4">About This Assessment</h3>
              <p className="text-blue-800 leading-relaxed mb-4 text-sm sm:text-base">
                This AI-enhanced personality assessment analyzes your fit for specific job positions. 
                There is no way you can &quot;pass&quot; or &quot;fail&quot;, because this is not a test. It provides 
                insights into your work style, personality match, and career recommendations.
              </p>
              <p className="text-blue-700 text-sm sm:text-base">
                You&apos;ll evaluate 30 personality terms and receive an AI-powered analysis including 
                job fit percentage, alternative career suggestions, and personalized development plans.
              </p>
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6 mb-8 px-4 sm:px-0">
              <div className="bg-white p-4 sm:p-6 rounded-lg shadow-sm border">
                <User className="h-6 w-6 sm:h-8 sm:w-8 text-green-600 mx-auto mb-3" />
                <h4 className="font-semibold text-gray-900 mb-2 text-sm sm:text-base">Personal Information</h4>
                <p className="text-gray-600 text-xs sm:text-sm">Provide basic details for your personalized report</p>
              </div>
              <div className="bg-white p-4 sm:p-6 rounded-lg shadow-sm border">
                <FileText className="h-6 w-6 sm:h-8 sm:w-8 text-blue-600 mx-auto mb-3" />
                <h4 className="font-semibold text-gray-900 mb-2 text-sm sm:text-base">30-Term Assessment</h4>
                <p className="text-gray-600 text-xs sm:text-sm">Rate how well each personality trait describes you</p>
              </div>
              <div className="bg-white p-4 sm:p-6 rounded-lg shadow-sm border">
                <Brain className="h-6 w-6 sm:h-8 sm:w-8 text-purple-600 mx-auto mb-3" />
                <h4 className="font-semibold text-gray-900 mb-2 text-sm sm:text-base">AI Job Fit Analysis</h4>
                <p className="text-gray-600 text-xs sm:text-sm">Get percentage match for your target role plus alternative suggestions</p>
              </div>
            </div>
            
            <button 
              onClick={() => setCurrentStep('info')}
              className="px-6 sm:px-8 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 text-base sm:text-lg font-medium transition-colors"
            >
              Begin Assessment
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (currentStep === 'info') {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="container mx-auto px-4 py-6 sm:py-8">
          <div className="max-w-2xl mx-auto py-4 sm:py-8">
            <div className="text-center mb-6 sm:mb-8">
              <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-2">Application Information</h2>
              <p className="text-gray-600 text-sm sm:text-base px-4">Tell us about yourself and the position you&apos;re interested in</p>
            </div>
            
            <div className="bg-white p-4 sm:p-8 rounded-lg shadow-sm border space-y-4 sm:space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Full Name *</label>
                <input
                  type="text"
                  className="w-full px-3 sm:px-4 py-2 sm:py-3 border rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 text-base sm:text-lg"
                  value={userName}
                  onChange={(e: ChangeEvent<HTMLInputElement>) => setUserName(e.target.value)}
                  placeholder="Enter your full name"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Position You&apos;re Applying For *</label>
                <input
                  type="text"
                  className="w-full px-3 sm:px-4 py-2 sm:py-3 border rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 text-base sm:text-lg"
                  value={targetJobTitle}
                  onChange={(e: ChangeEvent<HTMLInputElement>) => setTargetJobTitle(e.target.value)}
                  placeholder="e.g. Software Engineer, Marketing Manager"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Current Position/Role</label>
                <input
                  type="text"
                  className="w-full px-3 sm:px-4 py-2 sm:py-3 border rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 text-base sm:text-lg"
                  value={userPosition}
                  onChange={(e: ChangeEvent<HTMLInputElement>) => setUserPosition(e.target.value)}
                  placeholder="Enter your current job title (optional)"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Assessment Date</label>
                <input
                  type="date"
                  className="w-full px-3 sm:px-4 py-2 sm:py-3 border rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 text-base sm:text-lg"
                  value={assessmentDate}
                  onChange={(e: ChangeEvent<HTMLInputElement>) => setAssessmentDate(e.target.value)}
                />
              </div>
              
              <div className="pt-4 sm:pt-6">
                <button 
                  onClick={() => setCurrentStep('assessment')}
                  disabled={!userName || !targetJobTitle}
                  className="w-full px-4 sm:px-6 py-2 sm:py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:bg-gray-300 disabled:cursor-not-allowed text-base sm:text-lg font-medium transition-colors"
                >
                  Continue to Assessment
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (currentStep === 'assessment') {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="container mx-auto px-4 py-6 sm:py-8">
          <div className="max-w-4xl mx-auto py-4 sm:py-8">
            <div className="text-center mb-6 sm:mb-8">
              <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-2">Personality Assessment</h2>
              <p className="text-gray-600 mb-4 text-sm sm:text-base px-4">
                Rate HOW WELL each term describes you as a person using the scale below:
              </p>
              
              <div className="bg-gray-50 p-3 sm:p-4 rounded-lg inline-block">
                <div className="grid grid-cols-5 gap-2 sm:gap-4 text-xs sm:text-sm">
                  <div className="text-center">
                    <div className="font-bold text-sm sm:text-lg">1</div>
                    <div>Not very</div>
                  </div>
                  <div className="text-center">
                    <div className="font-bold text-sm sm:text-lg">2</div>
                    <div>Just a little</div>
                  </div>
                  <div className="text-center">
                    <div className="font-bold text-sm sm:text-lg">3</div>
                    <div>Somewhat</div>
                  </div>
                  <div className="text-center">
                    <div className="font-bold text-sm sm:text-lg">4</div>
                    <div>Ordinarily</div>
                  </div>
                  <div className="text-center">
                    <div className="font-bold text-sm sm:text-lg">5</div>
                    <div>Very</div>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="bg-white p-4 sm:p-8 rounded-lg shadow-sm border">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-x-12 sm:gap-y-6">
                {assessmentTerms.map((term, index) => (
                  <div key={index} className="flex items-center justify-between py-2">
                    <div className="flex items-center flex-1">
                      <span className="text-xs sm:text-sm text-gray-500 w-4 sm:w-6">{index + 1}.</span>
                      <span className="font-medium text-gray-900 ml-2 text-sm sm:text-base min-w-0 flex-1">{term}</span>
                    </div>
                    <div className="flex space-x-1 sm:space-x-2 ml-2 sm:ml-4">
                      {[1, 2, 3, 4, 5].map((value) => (
                        <label key={value} className="cursor-pointer">
                          <input
                            type="radio"
                            name={`term-${index}`}
                            value={value}
                            checked={assessmentResponses[index] === value}
                            onChange={() => updateResponse(index, value)}
                            className="sr-only"
                          />
                          <div className={`w-6 h-6 sm:w-8 sm:h-8 rounded-full border-2 flex items-center justify-center text-xs sm:text-sm font-medium transition-colors ${
                            assessmentResponses[index] === value
                              ? 'bg-purple-600 border-purple-600 text-white'
                              : 'border-gray-300 text-gray-400 hover:border-purple-300'
                          }`}>
                            {value}
                          </div>
                        </label>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
              
              <div className="mt-6 sm:mt-8 pt-4 sm:pt-6 border-t">
                <div className="flex flex-col sm:flex-row justify-between items-center space-y-4 sm:space-y-0">
                  <div className="text-sm text-gray-600">
                    Progress: {assessmentResponses.filter(r => r > 0).length} of 30 completed
                  </div>
                  <button 
                    onClick={submitAssessment}
                    disabled={!allComplete || isAnalyzing}
                    className="w-full sm:w-auto px-6 sm:px-8 py-2 sm:py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:bg-gray-300 disabled:cursor-not-allowed text-base sm:text-lg font-medium transition-colors"
                  >
                    {isAnalyzing ? 'Analyzing with AI...' : allComplete ? 'Generate AI Analysis' : 'Complete All Questions'}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (currentStep === 'loading') {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="text-center">
          <Brain className="h-12 w-12 sm:h-16 sm:w-16 text-purple-600 mx-auto mb-4 animate-pulse" />
          <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-2">Analyzing & Submitting Assessment</h2>
          <p className="text-gray-600 mb-4 text-sm sm:text-base px-4">Our AI is processing your personality profile and sending results to HR...</p>
          <div className="w-48 sm:w-64 bg-gray-200 rounded-full h-2 mx-auto">
            <div className="bg-purple-600 h-2 rounded-full animate-pulse" style={{width: '70%'}}></div>
          </div>
          <p className="text-xs sm:text-sm text-gray-500 mt-4">This may take a few moments</p>
        </div>
      </div>
    );
  }

  return null;
}