import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { LinearGradient } from 'expo-linear-gradient';
import GeminiService from '../services/GeminiService';

const ProfileScreen = () => {
  const [userName, setUserName] = useState('');
  const [userAge, setUserAge] = useState('');
  const [userWeight, setUserWeight] = useState('');
  const [userHeight, setUserHeight] = useState('');
  const [fitnessGoal, setFitnessGoal] = useState('');
  const [workoutTip, setWorkoutTip] = useState('');
  const [loadingTip, setLoadingTip] = useState(false);
  const [isEditing, setIsEditing] = useState(false);

  useEffect(() => {
    loadProfile();
    loadWorkoutTip();
  }, []);

  const loadProfile = async () => {
    try {
      const profile = await AsyncStorage.getItem('userProfile');
      if (profile) {
        const data = JSON.parse(profile);
        setUserName(data.name || '');
        setUserAge(data.age || '');
        setUserWeight(data.weight || '');
        setUserHeight(data.height || '');
        setFitnessGoal(data.goal || '');
      } else {
        setIsEditing(true);
      }
    } catch (error) {
      console.error('Error loading profile:', error);
    }
  };

  const saveProfile = async () => {
    if (!userName) {
      Alert.alert('⚠️ Missing Info', 'Please enter your name');
      return;
    }

    try {
      const profile = {
        name: userName,
        age: userAge,
        weight: userWeight,
        height: userHeight,
        goal: fitnessGoal,
      };
      await AsyncStorage.setItem('userProfile', JSON.stringify(profile));
      setIsEditing(false);
      Alert.alert('✅ Success', 'Profile saved successfully!');
    } catch (error) {
      Alert.alert('❌ Error', 'Failed to save profile');
    }
  };

  const loadWorkoutTip = async () => {
    setLoadingTip(true);
    try {
      const geminiService = new GeminiService(); // Uses default API key
      const tip = await geminiService.getWorkoutTip();
      setWorkoutTip(tip);
    } catch (error) {
      console.error('Error loading workout tip:', error);
      setWorkoutTip('💡 Stay consistent with your workouts for best results!');
    } finally {
      setLoadingTip(false);
    }
  };

  const clearAllData = async () => {
    Alert.alert(
      '⚠️ Clear All Data',
      'This will delete your profile, API key, and all workout history. This cannot be undone. Are you sure?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Clear All',
          style: 'destructive',
          onPress: async () => {
            try {
              await AsyncStorage.multiRemove([
                'userProfile',
                'geminiApiKey',
                'workoutHistory',
              ]);
              setUserName('');
              setUserAge('');
              setUserWeight('');
              setUserHeight('');
              setFitnessGoal('');
              setIsEditing(true);
              Alert.alert('✅ Cleared', 'All data has been cleared');
            } catch (error) {
              Alert.alert('❌ Error', 'Failed to clear data');
            }
          },
        },
      ]
    );
  };

  const getBMI = () => {
    if (userWeight && userHeight) {
      const weight = parseFloat(userWeight);
      const height = parseFloat(userHeight) / 100; // Convert cm to meters
      const bmi = (weight / (height * height)).toFixed(1);
      return bmi;
    }
    return null;
  };

  const getBMICategory = (bmi) => {
    if (!bmi) return '';
    const bmiValue = parseFloat(bmi);
    if (bmiValue < 18.5) return 'Underweight';
    if (bmiValue < 25) return 'Normal';
    if (bmiValue < 30) return 'Overweight';
    return 'Obese';
  };

  const bmi = getBMI();
  const bmiCategory = getBMICategory(bmi);

  return (
    <View style={styles.container}>
      <LinearGradient colors={['#1a1a1a', '#2d2d2d']} style={styles.background}>
        <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent}>
          <View style={styles.header}>
            <View style={styles.logoContainer}>
              <View style={styles.logo}>
                <Text style={styles.logoText}>👤</Text>
              </View>
              <View style={styles.titleContainer}>
                <Text style={styles.title}>PROFILE</Text>
                <Text style={styles.subtitle}>Complete your setup</Text>
              </View>
            </View>
          </View>

          {/* Physical Stats Section */}
          <View style={styles.inputSection}>
            <Text style={styles.sectionTitle}>PHYSICAL STATS</Text>

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>HEIGHT (CM)</Text>
              <TextInput
                style={styles.mainInput}
                placeholder="183"
                placeholderTextColor="#666"
                value={userHeight}
                onChangeText={setUserHeight}
                keyboardType="numeric"
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>WEIGHT (KG)</Text>
              <TextInput
                style={styles.mainInput}
                placeholder="95"
                placeholderTextColor="#666"
                value={userWeight}
                onChangeText={setUserWeight}
                keyboardType="numeric"
              />
            </View>
          </View>

          {/* Goals Section */}
          <View style={styles.inputSection}>
            <Text style={styles.sectionTitle}>YOUR GOALS</Text>
            <TouchableOpacity style={styles.dropdown}>
              <Text style={styles.dropdownText}>EXPERIENCE LEVEL</Text>
              <Text style={styles.dropdownArrow}>▼</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.dropdown}>
              <Text style={styles.dropdownText}>WORKOUT FREQUENCY</Text>
              <Text style={styles.dropdownArrow}>▼</Text>
            </TouchableOpacity>
          </View>

          {/* Equipment Selection */}
          <View style={styles.equipmentSection}>
            <Text style={styles.sectionTitle}>AVAILABLE EQUIPMENT</Text>
            <View style={styles.equipmentGrid}>
              <TouchableOpacity style={[styles.equipmentOption, styles.selected]}>
                <Text style={styles.equipmentText}>BARBELL</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.equipmentOption}>
                <Text style={styles.equipmentText}>DUMBBELLS</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.equipmentOption}>
                <Text style={styles.equipmentText}>RESISTANCE{'\n'}BANDS</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.equipmentOption}>
                <Text style={styles.equipmentText}>PULL-UP BAR</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.equipmentOption}>
                <Text style={styles.equipmentText}>BENCH</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.equipmentOption}>
                <Text style={styles.equipmentText}>SQUAT RACK</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.equipmentOption}>
                <Text style={styles.equipmentText}>FULL GYM{'\n'}ACCESS</Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* Complete Setup Button */}
          <TouchableOpacity style={styles.completeButton}>
            <Text style={styles.completeButtonText}>COMPLETE SETUP</Text>
          </TouchableOpacity>
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
    marginBottom: 30,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#888',
    marginBottom: 20,
    letterSpacing: 1,
  },
  inputGroup: {
    marginBottom: 20,
  },
  inputLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: '#888',
    marginBottom: 8,
    letterSpacing: 0.5,
  },
  mainInput: {
    backgroundColor: '#2a2a2a',
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    color: '#fff',
    borderWidth: 1,
    borderColor: '#333',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 1,
  },
  dropdown: {
    backgroundColor: '#2a2a2a',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#333',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 1,
  },
  dropdownText: {
    fontSize: 16,
    color: '#fff',
    fontWeight: '500',
  },
  dropdownArrow: {
    fontSize: 14,
    color: '#888',
  },
  equipmentSection: {
    marginBottom: 30,
  },
  equipmentGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    justifyContent: 'space-between',
  },
  equipmentOption: {
    backgroundColor: '#2a2a2a',
    borderRadius: 12,
    padding: 12,
    width: '48%',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#333',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 1,
    marginBottom: 8,
  },
  selected: {
    backgroundColor: '#ff4757',
    borderColor: '#ff4757',
    shadowColor: '#ff4757',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
  },
  equipmentText: {
    fontSize: 12,
    color: '#fff',
    fontWeight: '600',
    textAlign: 'center',
    lineHeight: 16,
  },
  completeButton: {
    backgroundColor: '#ff4757',
    borderRadius: 16,
    padding: 20,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#ff4757',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
    marginTop: 20,
  },
  completeButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
    letterSpacing: 0.5,
  },
});

export default ProfileScreen;
