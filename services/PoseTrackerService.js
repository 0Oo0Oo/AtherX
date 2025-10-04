import config from '../config/apiConfig.js';

class PoseTrackerService {
  constructor(apiKey = null) {
    this.apiKey = apiKey || config.POSE_TRACKER_API_KEY;
    this.baseURL = config.POSE_TRACKER_BASE_URL;
    this.useDemoMode = config.USE_DEMO_MODE;
  }

  async analyzeForm(exerciseName, videoFile) {
    if (!exerciseName) {
      throw new Error('Exercise name is required');
    }

    if (!videoFile) {
      throw new Error('Video file is required for form analysis');
    }

    // Use demo mode only if explicitly configured
    if (this.useDemoMode || this.apiKey === 'demo-api-key-123') {
      console.log('Using demo mode for form analysis');
      return this.getDemoAnalysisResult(exerciseName);
    }

    if (!this.apiKey) {
      throw new Error('Pose Tracker API key is required. Please check your configuration.');
    }

    try {
      // Create form data for the API request
      const formData = new FormData();
      formData.append('exercise', exerciseName);
      formData.append('video', videoFile);
      formData.append('api_key', this.apiKey);

      const response = await fetch(`${this.baseURL}/analyze`, {
        method: 'POST',
        body: formData,
        headers: {
          'Accept': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`Pose Tracker API error: ${response.status}`);
      }

      const result = await response.json();
      return this.formatAnalysisResult(result);
    } catch (error) {
      console.error('Error analyzing form:', error);
      throw new Error('Failed to analyze form. Please check your video and try again.');
    }
  }

  // Demo analysis for testing purposes
  getDemoAnalysisResult(exerciseName) {
    // Simulate API processing delay
    return new Promise((resolve) => {
      setTimeout(() => {
        const baseScore = Math.floor(Math.random() * 30) + 60; // 60-90 score range
        const demoResult = {
          overall_score: baseScore,
          feedback: this.getDemoFeedback(exerciseName, baseScore),
          corrections: [],
          strengths: []
        };
        
        resolve(this.formatAnalysisResult(demoResult));
      }, 2000); // 2 second delay to simulate processing
    });
  }

  getDemoFeedback(exerciseName, score) {
    const exerciseFeedback = {
      'Barbell Squat': [
        { joint: 'Knees', issue: 'Slight knee valgus detected during descent', severity: 'medium', timestamp: 3.2 },
        { joint: 'Back', issue: 'Good spinal alignment maintained throughout', severity: 'low', timestamp: 2.1 },
        { joint: 'Hips', issue: 'Excellent hip hinge movement pattern', severity: 'low', timestamp: 1.8 }
      ],
      'Bench Press': [
        { joint: 'Elbows', issue: 'Elbows slightly too wide, aim for 45-degree angle', severity: 'medium', timestamp: 2.5 },
        { joint: 'Back', issue: 'Good arch maintenance and shoulder blade retraction', severity: 'low', timestamp: 1.2 }
      ],
      'Deadlift': [
        { joint: 'Back', issue: 'Minor rounding detected in lower back at bottom', severity: 'high', timestamp: 4.1 },
        { joint: 'Hips', issue: 'Excellent hip hinge initiation', severity: 'low', timestamp: 0.8 }
      ]
    };

    const feedback = exerciseFeedback[exerciseName] || [
      { joint: 'General', issue: 'Form analysis completed successfully', severity: 'low', timestamp: 2.0 }
    ];

    // Adjust feedback based on score
    if (score < 70) {
      feedback.push({ joint: 'General', issue: 'Focus on controlled movement tempo', severity: 'medium', timestamp: 5.0 });
    }

    return feedback;
  }

  formatAnalysisResult(apiResponse) {
    // Format the API response into a user-friendly analysis
    const analysis = {
      score: apiResponse.overall_score || 0,
      feedback: [],
      corrections: [],
      strengths: [],
    };

    // Process feedback from API
    if (apiResponse.feedback) {
      analysis.feedback = apiResponse.feedback.map(item => ({
        joint: item.joint || 'General',
        issue: item.issue || item.description || 'Form needs improvement',
        severity: item.severity || 'medium',
        timestamp: item.timestamp || 0,
      }));
    }

    // Generate corrections based on feedback
    if (apiResponse.corrections) {
      analysis.corrections = apiResponse.corrections;
    } else {
      // Generate basic corrections based on common issues
      analysis.corrections = this.generateBasicCorrections(analysis.feedback);
    }

    // Generate strengths
    if (apiResponse.strengths) {
      analysis.strengths = apiResponse.strengths;
    } else {
      analysis.strengths = this.generateBasicStrengths(analysis.score);
    }

    return analysis;
  }

  generateBasicCorrections(feedback) {
    const corrections = [];

    feedback.forEach(item => {
      switch(item.joint?.toLowerCase()) {
        case 'knee':
        case 'knees':
          corrections.push('🎯 Keep your knees aligned with your toes during the movement');
          corrections.push('📏 Maintain a 90-degree angle at the bottom of the squat');
          break;
        case 'back':
        case 'spine':
          corrections.push('🔄 Keep your back straight and core engaged');
          corrections.push('📱 Avoid rounding your shoulders');
          break;
        case 'elbow':
        case 'elbows':
          corrections.push('💪 Keep elbows at a 45-degree angle from your body');
          corrections.push('🎯 Lower the weight slowly with control');
          break;
        case 'hip':
        case 'hips':
          corrections.push('🔄 Initiate movement from your hips, not your knees');
          corrections.push('📏 Maintain hip-width stance');
          break;
        default:
          corrections.push('🎯 Focus on controlled, deliberate movements');
          corrections.push('💨 Breathe out during the effort phase');
      }
    });

    return corrections.length > 0 ? corrections : [
      '🎯 Focus on controlled, deliberate movements',
      '💨 Breathe out during the effort phase',
      '📏 Maintain proper form throughout the exercise'
    ];
  }

  generateBasicStrengths(score) {
    if (score >= 80) {
      return [
        '🌟 Excellent form and technique!',
        '💪 Great stability and control',
        '🎯 Perfect exercise execution'
      ];
    } else if (score >= 60) {
      return [
        '👍 Good overall form',
        '💪 Nice stability during movement',
        '🎯 Keep practicing for perfection'
      ];
    } else {
      return [
        '🔥 Great effort and determination!',
        '💪 You\'re building good habits',
        '🎯 Focus on the corrections above'
      ];
    }
  }

  async getExerciseLibrary() {
    try {
      const response = await fetch(`${this.baseURL}/exercises?api_key=${this.apiKey}`);

      if (!response.ok) {
        throw new Error('Failed to fetch exercise library');
      }

      const data = await response.json();
      return data.exercises || [];
    } catch (error) {
      console.error('Error fetching exercise library:', error);
      return this.getDefaultExercises();
    }
  }

  getDefaultExercises() {
    return [
      'Barbell Squat',
      'Bench Press',
      'Deadlift',
      'Overhead Press',
      'Barbell Row',
      'Pull-ups',
      'Dips',
      'Lunges',
      'Romanian Deadlift',
      'Bicep Curls',
      'Tricep Extensions',
      'Lateral Raises',
      'Front Raises',
      'Rear Delt Flyes',
      'Calf Raises',
      'Planks',
      'Push-ups',
      'Burpees'
    ];
  }

  getScoreColor(score) {
    if (score >= 80) return '#4CAF50'; // Green
    if (score >= 60) return '#FF9800'; // Orange
    return '#F44336'; // Red
  }

  getScoreEmoji(score) {
    if (score >= 80) return '🌟';
    if (score >= 60) return '👍';
    return '💪';
  }
}

export default PoseTrackerService;
