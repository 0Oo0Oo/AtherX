class PoseTrackerService {
  constructor(apiKey) {
    this.apiKey = apiKey;
    this.baseURL = 'https://api.posetracker.com/v1';
  }

  async analyzeForm(exerciseName, videoFile) {
    if (!this.apiKey) {
      throw new Error('Pose Tracker API key is required');
    }

    if (!exerciseName) {
      throw new Error('Exercise name is required');
    }

    if (!videoFile) {
      throw new Error('Video file is required for form analysis');
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
