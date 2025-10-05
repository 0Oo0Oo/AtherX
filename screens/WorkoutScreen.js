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
import GeminiService from '../services/GeminiService';

const WorkoutScreen = () => {
  // API key and workout generation state
  const [apiKey, setApiKey] = useState('');
  const [userGoals, setUserGoals] = useState('');
  const [equipment, setEquipment] = useState('None');
  const [fitnessLevel, setFitnessLevel] = useState('Beginner');
  const [duration, setDuration] = useState('30');
  const [workout, setWorkout] = useState('');
  const [loading, setLoading] = useState(false);
  const [showWorkoutForm, setShowWorkoutForm] = useState(true);
  const [showTimer, setShowTimer] = useState(false);

  // Timer state variables
  const [timerRunning, setTimerRunning] = useState(false);
  const [workoutStartTime, setWorkoutStartTime] = useState(null);
  const [elapsedTime, setElapsedTime] = useState(0);

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
                <Text style={styles.logoText}>💬</Text>
              </View>
              <View style={styles.titleContainer}>
                <Text style={styles.title}>AI WORKOUT COACH</Text>
                <Text style={styles.subtitle}>Personalized training plans</Text>
              </View>
            </View>
          </View>

          {/* API Key Section */}
          <View style={styles.inputSection}>
            <Text style={styles.inputLabel}>GEMINI API KEY</Text>
            <TextInput
              style={styles.mainInput}
              placeholder="Enter your Gemini API key..."
              placeholderTextColor="#666"
              value={apiKey}
              onChangeText={setApiKey}
              secureTextEntry={false}
            />
            <TouchableOpacity style={styles.saveKeyButton} onPress={saveApiKey}>
              <Text style={styles.saveKeyButtonText}>💾 Save API Key</Text>
            </TouchableOpacity>
          </View>

          {/* Workout Generation Form */}
          <View style={styles.inputSection}>
            <Text style={styles.inputLabel}>YOUR FITNESS GOALS</Text>
            <TextInput
              style={[styles.mainInput, { height: 80, textAlignVertical: 'top' }]}
              placeholder="e.g., Build muscle, lose weight, improve endurance..."
              placeholderTextColor="#666"
              value={userGoals}
              onChangeText={setUserGoals}
              multiline
            />
          </View>

          <View style={styles.inputRow}>
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>EQUIPMENT</Text>
              <TextInput
                style={styles.mainInput}
                placeholder="e.g., Full gym, dumbbells only..."
                placeholderTextColor="#666"
                value={equipment}
                onChangeText={setEquipment}
              />
            </View>
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>DURATION (MIN)</Text>
              <TextInput
                style={styles.mainInput}
                placeholder="30"
                placeholderTextColor="#666"
                value={duration}
                onChangeText={setDuration}
                keyboardType="numeric"
              />
            </View>
          </View>

          <View style={styles.inputSection}>
            <Text style={styles.inputLabel}>FITNESS LEVEL</Text>
            <View style={styles.levelGrid}>
              {['Beginner', 'Intermediate', 'Advanced'].map((level) => (
                <TouchableOpacity
                  key={level}
                  style={[
                    styles.levelOption,
                    fitnessLevel === level && styles.levelOptionSelected
                  ]}
                  onPress={() => setFitnessLevel(level)}
                >
                  <Text style={[
                    styles.levelOptionText,
                    fitnessLevel === level && styles.levelOptionTextSelected
                  ]}>
                    {level}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* Generate Button */}
          <TouchableOpacity
            style={styles.generateButton}
            onPress={generateWorkout}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <>
                <Text style={styles.generateButtonIcon}>⚡</Text>
                <Text style={styles.generateButtonText}>GENERATE WORKOUT</Text>
              </>
            )}
          </TouchableOpacity>

          {/* Generated Workout Display */}
          {workout && (
            <View style={styles.workoutSection}>
              <Text style={styles.workoutTitle}>🎯 Your Personalized Workout</Text>
              <View style={styles.workoutContent}>
                <Text style={styles.workoutText}>{workout}</Text>
              </View>

              {/* Timer Section */}
              <View style={styles.timerSection}>
                <Text style={styles.timerTitle}>⏱️ Workout Timer</Text>
                <View style={styles.timerDisplay}>
                  <Text style={styles.timerText}>{formatTime(elapsedTime)}</Text>
                </View>
                <View style={styles.timerControls}>
                  {!timerRunning ? (
                    <TouchableOpacity style={styles.timerButton} onPress={startTimer}>
                      <Text style={styles.timerButtonText}>▶️ START</Text>
                    </TouchableOpacity>
                  ) : (
                    <TouchableOpacity style={[styles.timerButton, styles.timerButtonStop]} onPress={stopTimer}>
                      <Text style={styles.timerButtonText}>⏸️ PAUSE</Text>
                    </TouchableOpacity>
                  )}
                  <TouchableOpacity style={styles.timerButton} onPress={resetTimer}>
                    <Text style={styles.timerButtonText}>🔄 RESET</Text>
                  </TouchableOpacity>
                </View>
              </View>

              {/* Save Workout Button */}
              <TouchableOpacity style={styles.saveButton} onPress={saveWorkout}>
                <Text style={styles.saveButtonText}>💾 Save Workout</Text>
              </TouchableOpacity>
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
  saveKeyButton: {
    backgroundColor: '#333',
    borderRadius: 12,
    padding: 12,
    alignItems: 'center',
    marginTop: 8,
  },
  saveKeyButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  inputRow: {
    flexDirection: 'row',
    gap: 15,
    marginBottom: 25,
  },
  inputGroup: {
    flex: 1,
  },
  levelGrid: {
    flexDirection: 'row',
    gap: 10,
    justifyContent: 'space-between',
  },
  levelOption: {
    backgroundColor: '#2a2a2a',
    borderRadius: 12,
    padding: 12,
    flex: 1,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#333',
  },
  levelOptionSelected: {
    backgroundColor: '#ff4757',
    borderColor: '#ff4757',
  },
  levelOptionText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  levelOptionTextSelected: {
    color: '#fff',
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
  workoutSection: {
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
  workoutTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 20,
    textAlign: 'center',
  },
  workoutContent: {
    backgroundColor: '#1a1a1a',
    borderRadius: 12,
    padding: 16,
    marginBottom: 20,
  },
  workoutText: {
    color: '#fff',
    fontSize: 16,
    lineHeight: 24,
  },
  timerSection: {
    backgroundColor: '#1a1a1a',
    borderRadius: 16,
    padding: 20,
    marginBottom: 20,
    alignItems: 'center',
  },
  timerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 15,
  },
  timerDisplay: {
    backgroundColor: '#333',
    borderRadius: 20,
    width: 150,
    height: 60,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
    borderWidth: 2,
    borderColor: '#ff4757',
  },
  timerText: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#fff',
    fontFamily: 'monospace',
  },
  timerControls: {
    flexDirection: 'row',
    gap: 15,
  },
  timerButton: {
    backgroundColor: '#ff4757',
    borderRadius: 12,
    paddingVertical: 12,
    paddingHorizontal: 20,
    minWidth: 80,
    alignItems: 'center',
  },
  timerButtonStop: {
    backgroundColor: '#ffa502',
  },
  timerButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: 'bold',
  },
  saveButton: {
    backgroundColor: '#2ed573',
    borderRadius: 16,
    padding: 16,
    alignItems: 'center',
    shadowColor: '#2ed573',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 4,
  },
  saveButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default WorkoutScreen;
