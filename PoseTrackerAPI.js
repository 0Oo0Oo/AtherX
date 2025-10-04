/**
 * PoseTracker AI API Integration Service
 * Handles pose analysis, form checking, and movement tracking
 */

class PoseTrackerAPI {
  constructor() {
    this.baseURL = process.env.REACT_APP_POSE_TRACKER_API_URL || 'https://api.posetracker.ai/v1';
    this.apiKey = process.env.REACT_APP_POSE_TRACKER_API_KEY;
    this.timeout = 30000; // 30 seconds for video analysis
  }

  /**
   * Analyze exercise form from video
   * @param {Object} params - Analysis parameters
   * @param {string} params.videoUrl - URL of the video to analyze
   * @param {string} params.exerciseType - Type of exercise (squat, deadlift, etc.)
   * @param {Object} params.options - Additional analysis options
   * @returns {Promise<Object>} Analysis results
   */
  async analyzeForm(params) {
    const { videoUrl, exerciseType, options = {} } = params;

    try {
      const response = await this.makeRequest('/analyze/form', {
        method: 'POST',
        body: JSON.stringify({
          video_url: videoUrl,
          exercise_type: exerciseType,
          analysis_options: {
            include_keypoints: true,
            include_angles: true,
            include_recommendations: true,
            frame_rate: options.frameRate || 'auto',
            quality_threshold: options.qualityThreshold || 0.7,
            ...options
          }
        })
      });

      return this.processFormAnalysis(response);
    } catch (error) {
      console.error('PoseTracker form analysis error:', error);
      throw new Error(`Form analysis failed: ${error.message}`);
    }
  }

  /**
   * Get real-time pose estimation for live feedback
   * @param {string} videoStreamUrl - URL of live video stream
   * @param {string} exerciseType - Type of exercise being performed
   * @returns {Promise<Object>} Real-time pose data
   */
  async getRealTimePose(videoStreamUrl, exerciseType) {
    try {
      const response = await this.makeRequest('/analyze/realtime', {
        method: 'POST',
        body: JSON.stringify({
          stream_url: videoStreamUrl,
          exercise_type: exerciseType,
          mode: 'live_feedback'
        })
      });

      return response;
    } catch (error) {
      console.error('Real-time pose tracking error:', error);
      throw error;
    }
  }

  /**
   * Get exercise-specific analysis criteria
   * @param {string} exerciseType - Type of exercise
   * @returns {Promise<Object>} Analysis criteria and key points
   */
  async getExerciseCriteria(exerciseType) {
    try {
      const response = await this.makeRequest(`/exercises/${exerciseType}/criteria`);
      return response;
    } catch (error) {
      console.error('Exercise criteria fetch error:', error);
      throw error;
    }
  }

  /**
   * Upload video for analysis
   * @param {File} videoFile - Video file to upload
   * @returns {Promise<string>} Uploaded video URL
   */
  async uploadVideo(videoFile) {
    const formData = new FormData();
    formData.append('video', videoFile);
    formData.append('analysis_type', 'form_check');

    try {
      const response = await fetch(`${this.baseURL}/upload/video`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
        },
        body: formData
      });

      if (!response.ok) {
        throw new Error(`Upload failed: ${response.statusText}`);
      }

      const result = await response.json();
      return result.video_url;
    } catch (error) {
      console.error('Video upload error:', error);
      throw error;
    }
  }

  /**
   * Process form analysis results into standardized format
   * @private
   */
  processFormAnalysis(rawResponse) {
    const {
      form_score,
      keypoints,
      joint_angles,
      movement_phases,
      recommendations,
      errors,
      timestamp_analysis
    } = rawResponse;

    // Calculate detailed metrics
    const detailedMetrics = this.calculateDetailedMetrics(keypoints, joint_angles);
    
    // Generate improvement tips based on errors
    const improvementTips = this.generateImprovementTips(errors, recommendations);
    
    // Analyze movement consistency
    const consistencyAnalysis = this.analyzeMovementConsistency(movement_phases);

    return {
      form_score: Math.round(form_score * 100) / 100,
      overall_grade: this.getGradeFromScore(form_score),
      detailed_metrics: detailedMetrics,
      movement_phases: movement_phases,
      key_errors: errors,
      improvement_tips: improvementTips,
      consistency_score: consistencyAnalysis.score,
      rep_analysis: consistencyAnalysis.reps,
      timeline_feedback: timestamp_analysis,
      keypoints_data: keypoints,
      joint_angles: joint_angles,
      recommendations: recommendations
    };
  }

  /**
   * Calculate detailed biomechanical metrics
   * @private
   */
  calculateDetailedMetrics(keypoints, jointAngles) {
    return {
      posture_score: this.calculatePostureScore(keypoints),
      range_of_motion: this.calculateROM(jointAngles),
      stability_index: this.calculateStability(keypoints),
      symmetry_score: this.calculateSymmetry(keypoints),
      tempo_analysis: this.analyzeMovementTempo(keypoints)
    };
  }

  /**
   * Generate contextual improvement tips
   * @private
   */
  generateImprovementTips(errors, recommendations) {
    const tips = [];
    
    errors.forEach(error => {
      const tip = this.getErrorSpecificTip(error);
      if (tip) tips.push(tip);
    });

    recommendations.forEach(rec => {
      tips.push({
        category: rec.category,
        priority: rec.priority,
        description: rec.description,
        demonstration_url: rec.demo_url
      });
    });

    return tips.slice(0, 5); // Limit to top 5 tips
  }

  /**
   * Analyze movement consistency across reps
   * @private
   */
  analyzeMovementConsistency(movementPhases) {
    if (!movementPhases || movementPhases.length < 2) {
      return { score: 100, reps: [] };
    }

    let totalVariation = 0;
    const repAnalysis = [];

    for (let i = 1; i < movementPhases.length; i++) {
      const currentRep = movementPhases[i];
      const previousRep = movementPhases[i - 1];
      
      const variation = this.calculateRepVariation(currentRep, previousRep);
      totalVariation += variation;
      
      repAnalysis.push({
        rep_number: i + 1,
        consistency_score: Math.max(0, 100 - variation),
        key_differences: this.identifyKeyDifferences(currentRep, previousRep)
      });
    }

    const avgVariation = totalVariation / (movementPhases.length - 1);
    const consistencyScore = Math.max(0, 100 - avgVariation);

    return {
      score: Math.round(consistencyScore),
      reps: repAnalysis
    };
  }

  /**
   * Make authenticated API request
   * @private
   */
  async makeRequest(endpoint, options = {}) {
    const url = `${this.baseURL}${endpoint}`;
    const config = {
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${this.apiKey}`,
        ...options.headers
      },
      timeout: this.timeout,
      ...options
    };

    const response = await fetch(url, config);
    
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || `API request failed: ${response.statusText}`);
    }

    return response.json();
  }

  /**
   * Helper methods for calculations
   * @private
   */
  calculatePostureScore(keypoints) {
    // Implementation for posture scoring algorithm
    return Math.random() * 20 + 80; // Placeholder
  }

  calculateROM(jointAngles) {
    // Implementation for range of motion calculation
    return {
      hip: { min: 45, max: 135, optimal_range: [60, 120] },
      knee: { min: 30, max: 160, optimal_range: [45, 150] },
      ankle: { min: -20, max: 40, optimal_range: [-10, 30] }
    };
  }

  calculateStability(keypoints) {
    // Implementation for stability index calculation
    return Math.random() * 15 + 85; // Placeholder
  }

  calculateSymmetry(keypoints) {
    // Implementation for body symmetry calculation
    return Math.random() * 10 + 90; // Placeholder
  }

  analyzeMovementTempo(keypoints) {
    // Implementation for movement tempo analysis
    return {
      eccentric_phase: 2.5,
      concentric_phase: 1.8,
      recommended_tempo: "3-1-2-1"
    };
  }

  getGradeFromScore(score) {
    if (score >= 90) return 'A+';
    if (score >= 85) return 'A';
    if (score >= 80) return 'B+';
    if (score >= 75) return 'B';
    if (score >= 70) return 'C+';
    if (score >= 65) return 'C';
    if (score >= 60) return 'D+';
    if (score >= 55) return 'D';
    return 'F';
  }

  getErrorSpecificTip(error) {
    const errorTips = {
      'knee_valgus': {
        category: 'knee_alignment',
        priority: 'high',
        description: 'Focus on pushing knees out in line with toes. Strengthen glutes and hip abductors.',
        demonstration_url: '/tips/knee-alignment'
      },
      'forward_lean': {
        category: 'posture',
        priority: 'medium',
        description: 'Keep chest up and maintain neutral spine. Focus on hip hinge movement.',
        demonstration_url: '/tips/spine-neutral'
      },
      'insufficient_depth': {
        category: 'range_of_motion',
        priority: 'medium',
        description: 'Work on ankle and hip mobility. Gradually increase squat depth.',
        demonstration_url: '/tips/squat-depth'
      }
    };

    return errorTips[error.type] || null;
  }

  calculateRepVariation(rep1, rep2) {
    // Simplified variation calculation
    return Math.random() * 15; // Placeholder
  }

  identifyKeyDifferences(rep1, rep2) {
    // Simplified difference identification
    return ['Slight tempo variation', 'Minor depth difference'];
  }
}

// Singleton instance
const poseTrackerAPI = new PoseTrackerAPI();

export default poseTrackerAPI;

// Export specific methods for convenience
export const {
  analyzeForm,
  getRealTimePose,
  getExerciseCriteria,
  uploadVideo
} = poseTrackerAPI;
