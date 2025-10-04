import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { LinearGradient } from 'expo-linear-gradient';
import GeminiService from '../services/GeminiService';

const ProgressScreen = () => {
  const [workouts, setWorkouts] = useState([]);
  const [stats, setStats] = useState({
    totalWorkouts: 0,
    totalMinutes: 0,
    thisWeek: 0,
    streak: 0,
  });
  const [motivationalMessage, setMotivationalMessage] = useState('');
  const [expandedId, setExpandedId] = useState(null);

  useEffect(() => {
    loadWorkouts();
    loadMotivationalMessage();
  }, []);

  const loadWorkouts = async () => {
    try {
      const workoutHistory = await AsyncStorage.getItem('workoutHistory');
      if (workoutHistory) {
        const parsedWorkouts = JSON.parse(workoutHistory);
        setWorkouts(parsedWorkouts);
        calculateStats(parsedWorkouts);
      }
    } catch (error) {
      console.error('Error loading workouts:', error);
    }
  };

  const calculateStats = (workoutList) => {
    const totalWorkouts = workoutList.length;
    const totalMinutes = workoutList.reduce((sum, w) => sum + (w.duration || 0), 0);
    
    // Calculate this week's workouts
    const oneWeekAgo = new Date();
    oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
    const thisWeek = workoutList.filter(
      (w) => new Date(w.date) > oneWeekAgo
    ).length;

    // Calculate streak (simplified)
    let streak = 0;
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    for (let i = 0; i < workoutList.length; i++) {
      const workoutDate = new Date(workoutList[i].date);
      workoutDate.setHours(0, 0, 0, 0);
      const daysDiff = Math.floor((today - workoutDate) / (1000 * 60 * 60 * 24));
      
      if (daysDiff === streak) {
        streak++;
      } else {
        break;
      }
    }

    setStats({
      totalWorkouts,
      totalMinutes,
      thisWeek,
      streak,
    });
  };

  const loadMotivationalMessage = async () => {
    try {
      const workoutHistory = await AsyncStorage.getItem('workoutHistory');

      if (workoutHistory) {
        const workouts = JSON.parse(workoutHistory);
        const geminiService = new GeminiService(); // Uses default API key
        const message = await geminiService.getMotivationalMessage(workouts.length);
        setMotivationalMessage(message);
      }
    } catch (error) {
      console.error('Error loading motivational message:', error);
      setMotivationalMessage('💪 Keep pushing! Every workout counts!');
    }
  };

  const deleteWorkout = async (id) => {
    Alert.alert(
      '🗑️ Delete Workout',
      'Are you sure you want to delete this workout?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              const updatedWorkouts = workouts.filter((w) => w.id !== id);
              await AsyncStorage.setItem('workoutHistory', JSON.stringify(updatedWorkouts));
              setWorkouts(updatedWorkouts);
              calculateStats(updatedWorkouts);
              Alert.alert('✅ Deleted', 'Workout deleted successfully');
            } catch (error) {
              Alert.alert('❌ Error', 'Failed to delete workout');
            }
          },
        },
      ]
    );
  };

  const clearAllWorkouts = async () => {
    Alert.alert(
      '⚠️ Clear All History',
      'Are you sure you want to delete all workout history? This cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Clear All',
          style: 'destructive',
          onPress: async () => {
            try {
              await AsyncStorage.removeItem('workoutHistory');
              setWorkouts([]);
              calculateStats([]);
              Alert.alert('✅ Cleared', 'All workout history has been cleared');
            } catch (error) {
              Alert.alert('❌ Error', 'Failed to clear history');
            }
          },
        },
      ]
    );
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    if (date.toDateString() === today.toDateString()) {
      return 'Today';
    } else if (date.toDateString() === yesterday.toDateString()) {
      return 'Yesterday';
    } else {
      return date.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
      });
    }
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <View style={styles.container}>
      <LinearGradient colors={['#1a1a1a', '#2d2d2d']} style={styles.background}>
        <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent}>
          <View style={styles.header}>
            <View style={styles.logoContainer}>
              <View style={styles.logo}>
                <Text style={styles.logoText}>📈</Text>
              </View>
              <View style={styles.titleContainer}>
                <Text style={styles.title}>PROGRESS</Text>
                <Text style={styles.subtitle}>Track your fitness evolution</Text>
              </View>
            </View>
          </View>

          {/* Stats Cards */}
          <View style={styles.statsContainer}>
            <View style={styles.statCard}>
              <View style={styles.statIcon}>
                <Text style={styles.statIconText}>📅</Text>
              </View>
              <Text style={styles.statNumber}>{stats.totalWorkouts}</Text>
              <Text style={styles.statLabel}>WORKOUTS{'\n'}THIS WEEK</Text>
            </View>
            <View style={styles.statCard}>
              <View style={styles.statIcon}>
                <Text style={styles.statIconText}>🏆</Text>
              </View>
              <Text style={styles.statNumber}>{stats.thisWeek}</Text>
              <Text style={styles.statLabel}>AVG FORM{'\n'}SCORE</Text>
            </View>
          </View>

          <View style={styles.statsContainer}>
            <View style={styles.statCard}>
              <View style={styles.statIcon}>
                <Text style={styles.statIconText}>📈</Text>
              </View>
              <Text style={styles.statNumber}>{stats.totalMinutes}</Text>
              <Text style={styles.statLabel}>TOTAL{'\n'}WORKOUTS</Text>
            </View>
            <View style={styles.statCard}>
              <View style={styles.statIcon}>
                <Text style={styles.statIconText}>⏱️</Text>
              </View>
              <Text style={styles.statNumber}>{stats.streak}</Text>
              <Text style={styles.statLabel}>FORM CHECKS</Text>
            </View>
          </View>

          {/* CTA Button */}
          <TouchableOpacity style={styles.ctaButton}>
            <Text style={styles.ctaButtonIcon}>🚀</Text>
            <Text style={styles.ctaButtonText}>START YOUR JOURNEY</Text>
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
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20,
    gap: 15,
  },
  statCard: {
    flex: 1,
    backgroundColor: '#2a2a2a',
    borderRadius: 20,
    padding: 20,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
    borderWidth: 1,
    borderColor: '#333',
  },
  statIcon: {
    width: 40,
    height: 40,
    backgroundColor: '#ff4757',
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 10,
    shadowColor: '#ff4757',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 3,
    elevation: 3,
  },
  statIconText: {
    fontSize: 18,
    color: '#fff',
  },
  statNumber: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 8,
  },
  statLabel: {
    fontSize: 12,
    color: '#888',
    textAlign: 'center',
    fontWeight: '600',
    lineHeight: 16,
  },
  ctaButton: {
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
    marginTop: 20,
  },
  ctaButtonIcon: {
    fontSize: 20,
    color: '#fff',
  },
  ctaButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
    letterSpacing: 0.5,
  },
});

export default ProgressScreen;
