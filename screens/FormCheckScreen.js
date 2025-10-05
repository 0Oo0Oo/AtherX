import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
  Modal,
  ScrollView,
  ActivityIndicator,
} from 'react-native';
import { CameraView, CameraType, useCameraPermissions } from 'expo-camera';
import { Video } from 'expo-av';
import * as FileSystem from 'expo-file-system';
import { LinearGradient } from 'expo-linear-gradient';
import PoseTrackerService from '../services/PoseTrackerService';
import config from '../config/apiConfig';


const FormCheckScreen = () => {
  const [permission, requestPermission] = useCameraPermissions();
  const [isRecording, setIsRecording] = useState(false);
  const [recordedVideo, setRecordedVideo] = useState(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisResult, setAnalysisResult] = useState(null);
  const [showResults, setShowResults] = useState(false);
  const [selectedExercise, setSelectedExercise] = useState('Barbell Squat');
  const [showExercisePicker, setShowExercisePicker] = useState(false);
  const [exerciseLibrary, setExerciseLibrary] = useState([]);
  const [recordingTime, setRecordingTime] = useState(0);
  const [isCameraReady, setIsCameraReady] = useState(false);

  const cameraRef = useRef(null);
  const recordingInterval = useRef(null);
  const poseTrackerService = new PoseTrackerService();


  useEffect(() => {
    loadExerciseLibrary();
  }, []);


  const loadExerciseLibrary = async () => {
    try {
      const exercises = await poseTrackerService.getExerciseLibrary();
      setExerciseLibrary(exercises);
    } catch (error) {
      console.error('Error loading exercises:', error);
      setExerciseLibrary(poseTrackerService.getDefaultExercises());
    }
  };

  // Added this function
  const handleCameraReady = () => {
    setIsCameraReady(true);
  };


  const startRecording = async () => {
    if (!cameraRef.current) {
      Alert.alert('❌ Error', 'Camera not available. Please restart the app.');
      return;
    }

    // More lenient camera ready check
    if (!isCameraReady) {
      Alert.alert('Camera Initializing', 'Please wait a moment for the camera to initialize.');
      return;
    }

    try {
      console.log('Starting recording...');
      setIsRecording(true);
      setRecordingTime(0);

      // Start recording timer
      recordingInterval.current = setInterval(() => {
        setRecordingTime(prev => prev + 1);
      }, 1000);

      const recordingOptions = {
        maxDuration: config.MAX_RECORDING_DURATION,
        mute: true,
      };

      // Add a small delay before starting recording
      await new Promise(resolve => setTimeout(resolve, 100));

      const videoRecordPromise = cameraRef.current.recordAsync(recordingOptions);
      const data = await videoRecordPromise;

      setRecordedVideo(data.uri);
      setIsRecording(false);

      if (recordingInterval.current) {
        clearInterval(recordingInterval.current);
      }

      Alert.alert(
        '🎬 Recording Complete!',
        'Your workout video has been recorded. Would you like to analyze your form?',
        [
          { text: 'Record Again', onPress: () => setRecordedVideo(null) },
          { text: 'Analyze Form', onPress: analyzeForm }
        ]
      );
    } catch (error) {
      console.error('Recording failed:', error);
      setIsRecording(false);
      if (recordingInterval.current) {
        clearInterval(recordingInterval.current);
      }

      // More specific error handling
      if (error.message && error.message.includes('not ready')) {
        Alert.alert(
          '⏳ Camera Still Initializing',
          'The camera is still starting up. Please wait a few seconds and try again.',
          [
            { text: 'Wait and Retry', onPress: () => {
              setTimeout(() => {
                setIsCameraReady(true);
              }, 2000);
            }},
            { text: 'OK' }
          ]
        );
      } else {
        Alert.alert('❌ Error', 'Failed to record video. Please try again.');
      }
    }
  };


  const stopRecording = async () => {
    if (!cameraRef.current || !isRecording) return;


    try {
      cameraRef.current.stopRecording();
      if (recordingInterval.current) {
        clearInterval(recordingInterval.current);
      }
    } catch (error) {
      console.error('Error stopping recording:', error);
    }
  };


  const analyzeForm = async () => {
    if (!recordedVideo) {
      Alert.alert('❌ Error', 'No video recorded to analyze.');
      return;
    }


    setIsAnalyzing(true);
    
    try {
      // Convert video file to blob for API
      const fileInfo = await FileSystem.getInfoAsync(recordedVideo);
      const videoBlob = {
        uri: recordedVideo,
        type: 'video/mp4',
        name: 'workout-video.mp4',
        size: fileInfo.size
      };


      const result = await poseTrackerService.analyzeForm(selectedExercise, videoBlob);
      setAnalysisResult(result);
      setShowResults(true);
    } catch (error) {
      console.error('Analysis failed:', error);
      Alert.alert(
        '❌ Analysis Failed', 
        'Unable to analyze your form. This could be due to:\n\n• Poor video quality\n• Exercise not clearly visible\n• Network connectivity issues\n\nPlease try recording again.'
      );
    } finally {
      setIsAnalyzing(false);
    }
  };


  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };


  const resetSession = () => {
    setRecordedVideo(null);
    setAnalysisResult(null);
    setShowResults(false);
    setRecordingTime(0);
  };


  if (!permission) {
    return (
      <View style={styles.container}>
        <LinearGradient colors={['#1a1a1a', '#2d2d2d']} style={styles.background}>
          <ActivityIndicator size="large" color="#ff4757" />
          <Text style={styles.loadingText}>Requesting camera permission...</Text>
        </LinearGradient>
      </View>
    );
  }


  if (!permission.granted) {
    return (
      <View style={styles.container}>
        <LinearGradient colors={['#1a1a1a', '#2d2d2d']} style={styles.background}>
          <View style={styles.permissionContainer}>
            <Text style={styles.permissionIcon}>📷</Text>
            <Text style={styles.permissionTitle}>Camera Access Required</Text>
            <Text style={styles.permissionText}>
              To analyze your workout form, we need access to your camera. Please enable camera permissions in your device settings.
            </Text>
            <TouchableOpacity style={styles.permissionButton} onPress={requestPermission}>
              <Text style={styles.permissionButtonText}>Grant Permission</Text>
            </TouchableOpacity>
          </View>
        </LinearGradient>
      </View>
    );
  }


  return (
    <View style={styles.container}>
      <LinearGradient colors={['#1a1a1a', '#2d2d2d']} style={styles.background}>
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.logoContainer}>
            <View style={styles.logo}>
              <Text style={styles.logoText}>📹</Text>
            </View>
            <View style={styles.titleContainer}>
              <Text style={styles.title}>FORM CHECK</Text>
              <Text style={styles.subtitle}>AI-powered form analysis</Text>
            </View>
          </View>
        </View>


        {/* Exercise Selection */}
        <TouchableOpacity 
          style={styles.exerciseSelector} 
          onPress={() => setShowExercisePicker(true)}
        >
          <Text style={styles.exerciseSelectorLabel}>Current Exercise:</Text>
          <Text style={styles.exerciseSelectorText}>{selectedExercise}</Text>
          <Text style={styles.exerciseSelectorIcon}>▼</Text>
        </TouchableOpacity>


        {/* Camera or Video Preview */}
        <View style={styles.cameraContainer}>
          {recordedVideo ? (
            <View style={styles.videoPreviewContainer}>
              <Video
                source={{ uri: recordedVideo }}
                style={styles.videoPreview}
                useNativeControls
                resizeMode="contain"
                isLooping
              />
              <View style={styles.videoOverlay}>
                <TouchableOpacity style={styles.deleteButton} onPress={() => setRecordedVideo(null)}>
                  <Text style={styles.deleteButtonText}>🗑️ Delete</Text>
                </TouchableOpacity>
              </View>
            </View>
          ) : (
            <CameraView
              ref={cameraRef}
              style={styles.camera}
              onCameraReady={handleCameraReady} // Added this line
            >
              <View style={styles.cameraOverlay}>
                {!isCameraReady && ( // Added this block
                  <View style={styles.cameraLoadingIndicator}>
                    <ActivityIndicator size="large" color="#ff4757" />
                    <Text style={styles.cameraLoadingText}>Initializing camera...</Text>
                  </View>
                )}
                {isRecording && (
                  <View style={styles.recordingIndicator}>
                    <View style={styles.recordingDot} />
                    <Text style={styles.recordingText}>REC {formatTime(recordingTime)}</Text>
                  </View>
                )}
                <View style={styles.cameraGuide}>
                  <Text style={styles.guideText}>Position yourself in the frame</Text>
                  <Text style={styles.guideSubtext}>Make sure your full body is visible</Text>
                </View>
              </View>
            </CameraView>
          )}
        </View>


        {/* Controls */}
        <View style={styles.controls}>
          {!recordedVideo ? (
            <TouchableOpacity
              style={[
                styles.recordButton, 
                isRecording && styles.recordButtonActive,
                !isCameraReady && styles.recordButtonDisabled // Added this line
              ]}
              onPress={isRecording ? stopRecording : startRecording}
              disabled={isAnalyzing || !isCameraReady} // Updated this line
            >
              <Text style={styles.recordButtonText}>
                {!isCameraReady ? '⏳ PREPARING...' : (isRecording ? '⏹️ STOP' : '🔴 RECORD')} {/* Updated this line */}
              </Text>
            </TouchableOpacity>
          ) : (
            <View style={styles.actionButtons}>
              <TouchableOpacity
                style={styles.actionButton}
                onPress={resetSession}
                disabled={isAnalyzing}
              >
                <Text style={styles.actionButtonText}>📹 Record Again</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.actionButton, styles.primaryActionButton]}
                onPress={analyzeForm}
                disabled={isAnalyzing}
              >
                {isAnalyzing ? (
                  <ActivityIndicator color="#fff" />
                ) : (
                  <Text style={styles.actionButtonText}>🤖 Analyze Form</Text>
                )}
              </TouchableOpacity>
            </View>
          )}
        </View>


        {/* Exercise Picker Modal */}
        <Modal
          visible={showExercisePicker}
          animationType="slide"
          transparent={true}
          onRequestClose={() => setShowExercisePicker(false)}
        >
          <View style={styles.modalContainer}>
            <View style={styles.modalContent}>
              <View style={styles.modalHeader}>
                <Text style={styles.modalTitle}>Select Exercise</Text>
                <TouchableOpacity onPress={() => setShowExercisePicker(false)}>
                  <Text style={styles.modalClose}>✕</Text>
                </TouchableOpacity>
              </View>
              <ScrollView style={styles.exerciseList}>
                {exerciseLibrary.map((exercise, index) => (
                  <TouchableOpacity
                    key={index}
                    style={[
                      styles.exerciseOption,
                      selectedExercise === exercise && styles.exerciseOptionSelected
                    ]}
                    onPress={() => {
                      setSelectedExercise(exercise);
                      setShowExercisePicker(false);
                    }}
                  >
                    <Text style={[
                      styles.exerciseOptionText,
                      selectedExercise === exercise && styles.exerciseOptionTextSelected
                    ]}>
                      {exercise}
                    </Text>
                    {selectedExercise === exercise && (
                      <Text style={styles.exerciseOptionCheck}>✓</Text>
                    )}
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </View>
          </View>
        </Modal>


        {/* Results Modal */}
        <Modal
          visible={showResults}
          animationType="slide"
          transparent={true}
          onRequestClose={() => setShowResults(false)}
        >
          <View style={styles.modalContainer}>
            <View style={styles.resultsModal}>
              <View style={styles.modalHeader}>
                <Text style={styles.modalTitle}>Form Analysis Results</Text>
                <TouchableOpacity onPress={() => setShowResults(false)}>
                  <Text style={styles.modalClose}>✕</Text>
                </TouchableOpacity>
              </View>
              
              {analysisResult && (
                <ScrollView style={styles.resultsContent}>
                  {/* Score */}
                  <View style={styles.scoreContainer}>
                    <Text style={styles.scoreLabel}>Overall Form Score</Text>
                    <Text style={[
                      styles.scoreValue,
                      { color: poseTrackerService.getScoreColor(analysisResult.score) }
                    ]}>
                      {analysisResult.score}/100 {poseTrackerService.getScoreEmoji(analysisResult.score)}
                    </Text>
                  </View>


                  {/* Strengths */}
                  {analysisResult.strengths.length > 0 && (
                    <View style={styles.feedbackSection}>
                      <Text style={styles.feedbackTitle}>✅ What You Did Well</Text>
                      {analysisResult.strengths.map((strength, index) => (
                        <View key={index} style={styles.feedbackItem}>
                          <Text style={styles.feedbackText}>{strength}</Text>
                        </View>
                      ))}
                    </View>
                  )}


                  {/* Corrections */}
                  {analysisResult.corrections.length > 0 && (
                    <View style={styles.feedbackSection}>
                      <Text style={styles.feedbackTitle}>💡 Areas for Improvement</Text>
                      {analysisResult.corrections.map((correction, index) => (
                        <View key={index} style={styles.feedbackItem}>
                          <Text style={styles.feedbackText}>{correction}</Text>
                        </View>
                      ))}
                    </View>
                  )}


                  {/* Detailed Feedback */}
                  {analysisResult.feedback.length > 0 && (
                    <View style={styles.feedbackSection}>
                      <Text style={styles.feedbackTitle}>🔍 Detailed Analysis</Text>
                      {analysisResult.feedback.map((item, index) => (
                        <View key={index} style={styles.detailedFeedbackItem}>
                          <View style={styles.feedbackHeader}>
                            <Text style={styles.feedbackJoint}>{item.joint}</Text>
                            <Text style={[
                              styles.feedbackSeverity,
                              { 
                                color: item.severity === 'high' ? '#ff4757' : 
                                       item.severity === 'medium' ? '#ffa502' : '#2ed573'
                              }
                            ]}>
                              {item.severity.toUpperCase()}
                            </Text>
                          </View>
                          <Text style={styles.feedbackIssue}>{item.issue}</Text>
                        </View>
                      ))}
                    </View>
                  )}


                  <TouchableOpacity
                    style={styles.doneButton}
                    onPress={() => {
                      setShowResults(false);
                      resetSession();
                    }}
                  >
                    <Text style={styles.doneButtonText}>✨ Great! Let's Try Again</Text>
                  </TouchableOpacity>
                </ScrollView>
              )}
            </View>
          </View>
        </Modal>
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
  header: {
    alignItems: 'center',
    marginBottom: 20,
    paddingHorizontal: 20,
    paddingTop: 60,
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
  exerciseSelector: {
    backgroundColor: '#2a2a2a',
    marginHorizontal: 20,
    marginBottom: 20,
    padding: 15,
    borderRadius: 12,
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#333',
  },
  exerciseSelectorLabel: {
    color: '#888',
    fontSize: 14,
    marginRight: 10,
  },
  exerciseSelectorText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
    flex: 1,
  },
  exerciseSelectorIcon: {
    color: '#ff4757',
    fontSize: 16,
  },
  cameraContainer: {
    flex: 1,
    marginHorizontal: 20,
    borderRadius: 20,
    overflow: 'hidden',
    marginBottom: 20,
  },
  camera: {
    flex: 1,
  },
  cameraOverlay: {
    flex: 1,
    justifyContent: 'space-between',
    padding: 20,
  },
  cameraLoadingIndicator: { // Added this style
    position: 'absolute',
    top: '50%',
    left: '50%',
    transform: [{ translateX: -50 }, { translateY: -50 }],
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    padding: 20,
    borderRadius: 12,
  },
  cameraLoadingText: { // Added this style
    color: '#fff',
    fontSize: 14,
    marginTop: 10,
    textAlign: 'center',
  },
  recordingIndicator: {
    alignSelf: 'flex-start',
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 71, 87, 0.9)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    gap: 8,
  },
  recordingDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#fff',
  },
  recordingText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: 'bold',
  },
  cameraGuide: {
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    padding: 15,
    borderRadius: 12,
  },
  guideText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 5,
  },
  guideSubtext: {
    color: '#ccc',
    fontSize: 14,
  },
  videoPreviewContainer: {
    flex: 1,
    position: 'relative',
  },
  videoPreview: {
    flex: 1,
  },
  videoOverlay: {
    position: 'absolute',
    top: 20,
    right: 20,
  },
  deleteButton: {
    backgroundColor: 'rgba(255, 71, 87, 0.9)',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
  },
  deleteButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  controls: {
    paddingHorizontal: 20,
    paddingBottom: 40,
  },
  recordButton: {
    backgroundColor: '#ff4757',
    borderRadius: 16,
    padding: 20,
    alignItems: 'center',
    shadowColor: '#ff4757',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  recordButtonActive: {
    backgroundColor: '#ff3742',
  },
  recordButtonDisabled: { // Added this style
    backgroundColor: '#666',
    shadowOpacity: 0.1,
  },
  recordButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  actionButtons: {
    flexDirection: 'row',
    gap: 12,
  },
  actionButton: {
    flex: 1,
    backgroundColor: '#2a2a2a',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#333',
  },
  primaryActionButton: {
    backgroundColor: '#ff4757',
    borderColor: '#ff4757',
  },
  actionButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  loadingText: {
    color: '#fff',
    fontSize: 16,
    textAlign: 'center',
    marginTop: 20,
  },
  permissionContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
  },
  permissionIcon: {
    fontSize: 64,
    marginBottom: 20,
  },
  permissionTitle: {
    color: '#fff',
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 15,
    textAlign: 'center',
  },
  permissionText: {
    color: '#888',
    fontSize: 16,
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 30,
  },
  permissionButton: {
    backgroundColor: '#ff4757',
    paddingHorizontal: 30,
    paddingVertical: 15,
    borderRadius: 12,
  },
  permissionButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  modalContainer: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: '#2a2a2a',
    borderRadius: 20,
    padding: 20,
    width: '90%',
    maxHeight: '80%',
  },
  resultsModal: {
    backgroundColor: '#2a2a2a',
    borderRadius: 20,
    padding: 20,
    width: '95%',
    maxHeight: '90%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#333',
    paddingBottom: 15,
  },
  modalTitle: {
    color: '#fff',
    fontSize: 20,
    fontWeight: 'bold',
  },
  modalClose: {
    color: '#888',
    fontSize: 24,
    fontWeight: 'bold',
  },
  exerciseList: {
    maxHeight: 400,
  },
  exerciseOption: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#333',
  },
  exerciseOptionSelected: {
    backgroundColor: '#ff475720',
  },
  exerciseOptionText: {
    color: '#fff',
    fontSize: 16,
    flex: 1,
  },
  exerciseOptionTextSelected: {
    color: '#ff4757',
    fontWeight: '600',
  },
  exerciseOptionCheck: {
    color: '#ff4757',
    fontSize: 18,
    fontWeight: 'bold',
  },
  resultsContent: {
    flex: 1,
  },
  scoreContainer: {
    alignItems: 'center',
    marginBottom: 30,
    padding: 20,
    backgroundColor: '#1a1a1a',
    borderRadius: 16,
  },
  scoreLabel: {
    color: '#888',
    fontSize: 16,
    marginBottom: 10,
  },
  scoreValue: {
    fontSize: 32,
    fontWeight: 'bold',
  },
  feedbackSection: {
    marginBottom: 25,
  },
  feedbackTitle: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 15,
  },
  feedbackItem: {
    backgroundColor: '#1a1a1a',
    padding: 15,
    borderRadius: 12,
    marginBottom: 10,
  },
  feedbackText: {
    color: '#fff',
    fontSize: 14,
    lineHeight: 20,
  },
  detailedFeedbackItem: {
    backgroundColor: '#1a1a1a',
    padding: 15,
    borderRadius: 12,
    marginBottom: 10,
  },
  feedbackHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  feedbackJoint: {
    color: '#ff4757',
    fontSize: 14,
    fontWeight: 'bold',
  },
  feedbackSeverity: {
    fontSize: 12,
    fontWeight: 'bold',
  },
  feedbackIssue: {
    color: '#fff',
    fontSize: 14,
    lineHeight: 20,
  },
  doneButton: {
    backgroundColor: '#ff4757',
    borderRadius: 12,
    padding: 18,
    alignItems: 'center',
    marginTop: 20,
    marginBottom: 10,
  },
  doneButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
});


export default FormCheckScreen;
