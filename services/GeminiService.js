import { GoogleGenerativeAI } from '@google/generative-ai';

class GeminiService {
  constructor(apiKey = 'AIzaSyDQmEMHhRhL4Vb1qg-9kV9pJiPRqZSPRIk') {
    this.apiKey = apiKey;
    this.genAI = null;
    this.model = null;
  }

  initialize() {
    if (!this.apiKey) {
      throw new Error('Gemini API key is required');
    }
    this.genAI = new GoogleGenerativeAI(this.apiKey);
    this.model = this.genAI.getGenerativeModel({ model: 'gemini-pro' });
  }

  async generateWorkout(userGoals, equipment, fitnessLevel, duration) {
    if (!this.model) {
      this.initialize();
    }

    const prompt = `Generate a personalized workout plan with the following details:

Goals: ${userGoals}
Available Equipment: ${equipment}
Fitness Level: ${fitnessLevel}
Workout Duration: ${duration} minutes

Please provide:
1. A warm-up routine (5 minutes)
2. Main workout exercises with sets, reps, and rest periods
3. Cool-down routine (5 minutes)
4. Tips for proper form

Format the response in a clear, structured way with emojis. Make it motivating and suitable for the specified fitness level.`;

    try {
      const result = await this.model.generateContent(prompt);
      const response = await result.response;
      return response.text();
    } catch (error) {
      console.error('Error generating workout:', error);
      throw new Error('Failed to generate workout. Please try again.');
    }
  }

  async getMotivationalMessage(workoutCount) {
    if (!this.model) {
      this.initialize();
    }

    const prompt = `Generate a short, motivational fitness message for someone who has completed ${workoutCount} workouts. Make it encouraging, energetic, and include an emoji. Keep it to 1-2 sentences.`;

    try {
      const result = await this.model.generateContent(prompt);
      const response = await result.response;
      return response.text();
    } catch (error) {
      console.error('Error generating motivational message:', error);
      return '💪 Keep pushing! Every workout counts!';
    }
  }

  async getWorkoutTip() {
    if (!this.model) {
      this.initialize();
    }

    const prompt = `Generate a quick, practical fitness tip for beginners or intermediate fitness enthusiasts. Keep it to 1-2 sentences with an emoji.`;

    try {
      const result = await this.model.generateContent(prompt);
      const response = await result.response;
      return response.text();
    } catch (error) {
      console.error('Error generating workout tip:', error);
      return '💡 Stay hydrated! Drink water before, during, and after your workout.';
    }
  }
}

export default GeminiService;
