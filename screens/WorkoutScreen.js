import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { LinearGradient } from 'expo-linear-gradient';
import PoseTrackerService from '../services/PoseTrackerService';
import GeminiService from '../services/GeminiService';

const WorkoutScreen = () => {
  const [poseApiKey] = useState('af48c0d0-dca9-4cc3-93e7-f67174bbedb');
  const [exerciseName, setExerciseName] = useState('');
  const [selectedVideo, setSelectedVideo] = useState(null);
  const [analysis, setAnalysis] = useState(null);
  const [loading, setLoading] = useState(false);
  const [showAnalysis, setShowAnalysis] = useState(false);

  const poseTrackerService = new PoseTrackerService(poseApiKey);
  const geminiService = new GeminiService(); // Uses default API key

  useEffect(() => {
    loadApiKey();
  }, []);

  useEffect(() => {
    let interval;
    if (timerRunning && workoutStartTime) {
      interval = setInterval(() => {
        const elapsed = Math.floor((Date.now() - workoutStartTime) / 1000);
        setElapsedTime(elapsed);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [timerRunning, workoutStartTime]);

  const loadApiKey = async () => {
    try {
      const savedKey = await AsyncStorage.getItem('geminiApiKey');
      if (savedKey) {
        setApiKey(savedKey);
      }
    } catch (error) {
      console.error('Error loading API key:', error);
    }
  };

  const saveApiKey = async () => {
    try {
      await AsyncStorage.setItem('geminiApiKey', apiKey);
      Alert.alert('✅ Success', 'API key saved successfully!');
    } catch (error) {
      Alert.alert('❌ Error', 'Failed to save API key');
    }
  };

  const generateWorkout = async () => {
    if (!apiKey) {
      Alert.alert('⚠️ API Key Required', 'Please enter your Gemini API key first');
      return;
    }

    if (!userGoals) {
      Alert.alert('⚠️ Missing Info', 'Please enter your fitness goals');
      return;
    }

    setLoading(true);
    setWorkout('');
    
    try {
      const generatedWorkout = await geminiService.generateWorkout(
        userGoals,
        equipment || 'None',
        fitnessLevel,
        duration
      );
      setWorkout(generatedWorkout);
    } catch (error) {
      Alert.alert('❌ Error', error.message);
    } finally {
      setLoading(false);
    }
  };

  const startTimer = () => {
    setWorkoutStartTime(Date.now());
    setElapsedTime(0);
    setTimerRunning(true);
  };

  const stopTimer = () => {
    setTimerRunning(false);
  };

  const resetTimer = () => {
    setWorkoutStartTime(null);
    setElapsedTime(0);
    setTimerRunning(false);
  };

  const saveWorkout = async () => {
    if (!workout) {
      Alert.alert('⚠️ No Workout', 'Generate a workout first!');
      return;
    }

    try {
      const workoutData = {
        id: Date.now().toString(),
        date: new Date().toISOString(),
        goals: userGoals,
        equipment,
        fitnessLevel,
        duration: parseInt(duration),
        workout,
        completedTime: elapsedTime,
      };

      const existingWorkouts = await AsyncStorage.getItem('workoutHistory');
      const workouts = existingWorkouts ? JSON.parse(existingWorkouts) : [];
      workouts.unshift(workoutData);

      await AsyncStorage.setItem('workoutHistory', JSON.stringify(workouts));
      
      Alert.alert('🎉 Saved!', 'Workout saved to your history');
      resetTimer();
    } catch (error) {
      Alert.alert('❌ Error', 'Failed to save workout');
    }
  };

  const analyzeForm = async () => {
    if (!exerciseName) {
      Alert.alert('⚠️ Missing Exercise', 'Please enter the exercise name first');
      return;
    }

    if (!selectedVideo) {
      Alert.alert('⚠️ No Video', 'Please select a video file first');
      return;
    }

    setLoading(true);
    setAnalysis(null);

    try {
      // For demo purposes, simulate analysis since we can't actually upload files in React Native
      // In a real implementation, you'd use react-native-image-picker or similar
      await new Promise(resolve => setTimeout(resolve, 2000)); // Simulate API call

      // Mock analysis result for demonstration
      const mockAnalysis = {
        score: Math.floor(Math.random() * 40) + 60, // Random score 60-100
        feedback: [
          { joint: 'Knees', issue: 'Knees caving inward during squat', severity: 'medium' },
          { joint: 'Back', issue: 'Slight rounding in lower back', severity: 'low' }
        ],
        corrections: [
          '🎯 Keep your knees aligned with your toes during the movement',
          '🔄 Keep your back straight and core engaged',
          '📏 Maintain a 90-degree angle at the bottom of the squat'
        ],
        strengths: [
          '💪 Great stability and control',
          '🎯 Good exercise execution',
          '🔥 Excellent effort and determination!'
        ]
      };

      setAnalysis(mockAnalysis);
      setShowAnalysis(true);
    } catch (error) {
      Alert.alert('❌ Error', 'Failed to analyze form. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <View style={styles.container}>
      <LinearGradient colors={['#1a1a1a', '#2d2d2d']} style={styles.background}>
        <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent}>
          <View style={styles.header}>
            <View style={styles.logoContainer}>
              <View style={styles.logo}>
                <Text style={styles.logoText}>⚡</Text>
              </View>
              <View style={styles.titleContainer}>
                <Text style={styles.title}>FORM CHECK</Text>
                <Text style={styles.subtitle}>AI-powered technique analysis</Text>
              </View>
            </View>
          </View>

          {/* Exercise Name Input */}
          <View style={styles.inputSection}>
            <Text style={styles.inputLabel}>EXERCISE NAME</Text>
            <TextInput
              style={styles.mainInput}
              placeholder="e.g., Barbell Squat, Bench Press..."
              placeholderTextColor="#666"
              value={userGoals}
              onChangeText={setUserGoals}
            />
          </View>

          {/* Video Upload Section */}
          <View style={styles.uploadSection}>
            <Text style={styles.sectionTitle}>WORKOUT VIDEO</Text>
            <View style={styles.uploadArea}>
              <View style={styles.uploadIcon}>
                <Text style={styles.uploadIconText}>⬆️</Text>
              </View>
              <Text style={styles.uploadTitle}>UPLOAD VIDEO</Text>
              <Text style={styles.uploadSubtitle}>Tap to select from your gallery</Text>
              <Text style={styles.uploadFormat}>MP4, MOV, or AVI • MAX 100MB</Text>
            </View>
          </View>

          {/* Generate Button */}
          <TouchableOpacity
            style={styles.generateButton}
            onPress={analyzeForm}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <>
                <Text style={styles.generateButtonIcon}>✓</Text>
                <Text style={styles.generateButtonText}>ANALYZE MY FORM</Text>
              </>
            )}
          </TouchableOpacity>

          {/* Analysis Results */}
          {showAnalysis && analysis && (
            <View style={styles.analysisSection}>
              <Text style={styles.analysisTitle}>📊 Form Analysis Results</Text>

              {/* Score Display */}
              <View style={styles.scoreContainer}>
                <View style={[styles.scoreCircle, { borderColor: poseTrackerService.getScoreColor(analysis.score) }]}>
                  <Text style={[styles.scoreEmoji, { color: poseTrackerService.getScoreColor(analysis.score) }]}>
                    {poseTrackerService.getScoreEmoji(analysis.score)}
                  </Text>
                  <Text style={[styles.scoreText, { color: poseTrackerService.getScoreColor(analysis.score) }]}>
                    {analysis.score}%
                  </Text>
                  <Text style={styles.scoreLabel}>FORM SCORE</Text>
                </View>
              </View>

              {/* Strengths */}
              <View style={styles.feedbackSection}>
                <Text style={styles.feedbackTitle}>🌟 Strengths</Text>
                {analysis.strengths.map((strength, index) => (
                  <View key={index} style={styles.feedbackItem}>
                    <Text style={styles.feedbackText}>{strength}</Text>
                  </View>
                ))}
              </View>

              {/* Areas for Improvement */}
              <View style={styles.feedbackSection}>
                <Text style={styles.feedbackTitle}>🎯 Areas for Improvement</Text>
                {analysis.corrections.map((correction, index) => (
                  <View key={index} style={styles.feedbackItem}>
                    <Text style={styles.feedbackText}>{correction}</Text>
                  </View>
                ))}
              </View>

              {/* Detailed Feedback */}
              {analysis.feedback.length > 0 && (
                <View style={styles.feedbackSection}>
                  <Text style={styles.feedbackTitle}>🔍 Detailed Feedback</Text>
                  {analysis.feedback.map((item, index) => (
                    <View key={index} style={styles.feedbackItem}>
                      <Text style={styles.jointText}>{item.joint}:</Text>
                      <Text style={styles.issueText}>{item.issue}</Text>
                    </View>
                  ))}
                </View>
              )}
            </View>
          )}
        </ScrollView>
      </LinearGradient>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1a1a1a',
  },
  background: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 100,
    paddingHorizontal: 20,
    paddingTop: 60,
  },
  header: {
    alignItems: 'center',
    marginBottom: 40,
  },
  logoContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 15,
  },
  logo: {
    width: 60,
    height: 60,
    backgroundColor: '#ff4757',
    borderRadius: 15,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#ff4757',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  logoText: {
    fontSize: 24,
    color: '#fff',
    fontWeight: 'bold',
  },
  titleContainer: {
    flex: 1,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 5,
  },
  subtitle: {
    fontSize: 16,
    color: '#888',
    fontWeight: '500',
  },
  inputSection: {
    marginBottom: 25,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#888',
    marginBottom: 12,
    letterSpacing: 1,
  },
  mainInput: {
    backgroundColor: '#2a2a2a',
    borderRadius: 16,
    padding: 18,
    fontSize: 16,
    color: '#fff',
    borderWidth: 1,
    borderColor: '#333',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  uploadSection: {
    marginBottom: 30,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#888',
    marginBottom: 15,
    letterSpacing: 1,
  },
  uploadArea: {
    backgroundColor: '#2a2a2a',
    borderRadius: 20,
    borderWidth: 2,
    borderColor: '#333',
    borderStyle: 'dashed',
    padding: 40,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 200,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  uploadIcon: {
    width: 60,
    height: 60,
    backgroundColor: '#ff4757',
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
    shadowColor: '#ff4757',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 4,
  },
  uploadIconText: {
    fontSize: 24,
    color: '#fff',
  },
  uploadTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#fff',
    marginBottom: 8,
  },
  uploadSubtitle: {
    fontSize: 14,
    color: '#888',
    marginBottom: 5,
    textAlign: 'center',
  },
  uploadFormat: {
    fontSize: 12,
    color: '#666',
    textAlign: 'center',
  },
  generateButton: {
    backgroundColor: '#ff4757',
    borderRadius: 16,
    padding: 20,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    gap: 10,
    shadowColor: '#ff4757',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
    marginTop: 10,
  },
  generateButtonIcon: {
    fontSize: 20,
    color: '#fff',
    fontWeight: 'bold',
  },
  generateButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
    letterSpacing: 0.5,
  },
  analysisSection: {
    backgroundColor: '#2a2a2a',
    borderRadius: 20,
    padding: 20,
    marginTop: 30,
    borderWidth: 1,
    borderColor: '#333',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  analysisTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 20,
    textAlign: 'center',
  },
  scoreContainer: {
    alignItems: 'center',
    marginBottom: 25,
  },
  scoreCircle: {
    width: 120,
    height: 120,
    borderRadius: 60,
    borderWidth: 4,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
  },
  scoreEmoji: {
    fontSize: 24,
    marginBottom: 5,
  },
  scoreText: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 5,
  },
  scoreLabel: {
    fontSize: 12,
    color: '#888',
    fontWeight: '600',
    letterSpacing: 1,
  },
  feedbackSection: {
    marginBottom: 20,
  },
  feedbackTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 12,
  },
  feedbackItem: {
    backgroundColor: '#333',
    borderRadius: 12,
    padding: 12,
    marginBottom: 8,
    borderLeftWidth: 3,
    borderLeftColor: '#ff4757',
  },
  feedbackText: {
    fontSize: 14,
    color: '#fff',
    lineHeight: 20,
  },
  jointText: {
    fontSize: 14,
    color: '#ff4757',
    fontWeight: 'bold',
    marginBottom: 4,
  },
  issueText: {
    fontSize: 14,
    color: '#ccc',
    lineHeight: 18,
  },
});

export default WorkoutScreen;
