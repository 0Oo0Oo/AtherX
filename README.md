# 🏋️ Ather Fitness - AI-Powered Form Analysis & Pose Tracking

A React Native fitness app with AI-powered form analysis using Pose Tracker API and Google Gemini AI for personalized workout generation. Features real-time pose detection and technique analysis for perfect exercise form. Built for hackathon demonstration.

## ✨ Features

- **🤖 AI-Powered Workouts**: Generate personalized workout plans using Google Gemini AI
- **🎥 Pose Tracking & Form Analysis**: Real-time exercise form analysis using Pose Tracker API
- **📊 Progress Tracking**: View workout history, statistics, and track your fitness journey
- **💪 Motivational Messages**: Get AI-generated motivational messages and fitness tips
- **👤 User Profile**: Manage your fitness profile with BMI calculator and equipment selection
- **📱 Modern Dark UI**: Professional dark theme interface with red accent colors
- **💾 Local Storage**: All data stored securely on your device using AsyncStorage
- **⏱️ Built-in Timer**: Track your workout duration with start/pause/reset functionality

## 📸 Screenshots

The app includes three main screens:
1. **Workout Generator**: Input your goals and generate personalized workouts
2. **Progress Tracker**: View statistics and workout history
3. **Profile**: Manage your profile and get daily fitness tips

## 🚀 Getting Started

### Prerequisites

- Node.js (v14 or higher)
- npm or yarn
- Expo CLI
- A Google Gemini API key (free at [Google AI Studio](https://makersuite.google.com/app/apikey))

### Installation

1. **Clone or download this project**
   ```bash
   cd ather
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Start the development server**
   ```bash
   npm start
   # or
   npx expo start
   ```

4. **Run on your device**
   - Scan the QR code with Expo Go app (iOS/Android)
   - Press `i` for iOS simulator
   - Press `a` for Android emulator
   - Press `w` to run in web browser

## 🔑 APIs Pre-Configured & Ready!

### ✅ Both APIs Ready to Use

**Pose Tracker API:**
- **API Key**: `af48c0d0-dca9-4cc3-93e7-f67174bbedb` ✅
- **Features**: Real-time form analysis, pose detection, technique scoring
- **Status**: ✅ Ready to use out of the box

**Google Gemini API:**
- **API Key**: `AIzaSyDQmEMHhRhL4Vb1qg-9kV9pJiPRqZSPRIk` ✅
- **Features**: AI-powered workout generation, motivational messages, fitness tips
- **Status**: ✅ Ready to use out of the box

**🎉 No API setup required!** Both services are pre-configured and ready for immediate use.

## 📱 How to Use

### Generate a Workout

1. Enter your **Gemini API key** (first time only)
2. Fill in your **fitness goals** (e.g., "Build muscle in upper body")
3. Specify **available equipment** (or leave blank for bodyweight exercises)
4. Select your **fitness level** (Beginner/Intermediate/Advanced)
5. Set **workout duration** in minutes
6. Tap **✨ Generate Workout**
7. Use the built-in **timer** to track your workout
8. Tap **💾 Save Workout** to add it to your history

### Track Progress

1. Navigate to the **Progress** tab
2. View your statistics:
   - Total workouts completed
   - This week's workouts
   - Total minutes exercised
   - Current streak
3. Tap on any workout to see full details
4. Get AI-generated motivational messages

### Manage Profile

1. Go to the **Profile** tab
2. Fill in your personal information:
   - Name, age, weight, height
   - Primary fitness goal
3. View your calculated BMI
4. Get daily AI-generated fitness tips
5. Tap **🔄 Get New Tip** for fresh advice

## 🏗️ Project Structure

```
ather/
├── App.js                      # Main navigation setup
├── package.json                # Dependencies and scripts
├── app.json                    # Expo configuration
├── services/
│   ├── GeminiService.js        # Gemini AI integration
│   └── PoseTrackerService.js   # Pose tracking & form analysis
└── screens/
    ├── WorkoutScreen.js        # Form analysis with pose tracking
    ├── ProgressScreen.js       # History and statistics
    └── ProfileScreen.js        # User profile and equipment setup
```

## 🛠️ Technologies Used

- **React Native** - Mobile framework
- **Expo** - Development platform
- **React Navigation** - Navigation library
- **AsyncStorage** - Local data persistence
- **Google Gemini AI** - AI-powered workout generation
- **Expo Linear Gradient** - Beautiful gradient backgrounds

## 📦 Dependencies

```json
{
  "expo": "~50.0.0",
  "react": "18.2.0",
  "react-native": "0.73.0",
  "@react-navigation/native": "^6.1.9",
  "@react-navigation/bottom-tabs": "^6.5.11",
  "@react-native-async-storage/async-storage": "1.21.0",
  "@google/generative-ai": "^0.1.3",
  "expo-linear-gradient": "~12.7.0"
}
```

## 🎯 Key Features Breakdown

### PoseTrackerService Class (NEW!)
- **AI-Powered Form Analysis**: Real-time exercise form analysis using Pose Tracker API
- **Exercise Name Input**: Enter any exercise for analysis (Barbell Squat, Bench Press, etc.)
- **Video Upload Interface**: Upload workout videos for technique analysis
- **Form Scoring**: Get percentage scores (0-100%) for exercise technique
- **Detailed Feedback**: Joint-specific feedback (knees, back, elbows, hips)
- **Correction Suggestions**: AI-generated tips for improving form
- **Strengths Analysis**: Highlights what you're doing well
- **Visual Score Display**: Color-coded scoring with emojis (🌟 for excellent, 👍 for good, 💪 for needs work)

### GeminiService Class
- Handles all AI interactions
- Generates personalized workouts based on user inputs
- Creates motivational messages
- Provides daily fitness tips
- Includes proper error handling

### Workout Timer
- Start/pause/reset functionality
- Real-time display in MM:SS format
- Tracks completed workout duration
- Saves workout time with history

### Progress Statistics
- Total workouts completed
- Weekly workout count
- Total exercise minutes
- Consecutive day streak calculation
- Expandable workout history cards

### Data Persistence
- API key storage
- Workout history
- User profile information
- All data saved locally using AsyncStorage

## 🎨 Design Features

- **Gradient Backgrounds**: Each screen has unique gradient colors
- **Emoji Integration**: Visual appeal with relevant emojis throughout
- **Card-based Layout**: Clean, modern card components
- **Responsive Design**: Works on various screen sizes
- **Loading States**: Activity indicators for async operations
- **Error Handling**: User-friendly error messages with alerts

## 🔒 Privacy & Security

- All data stored locally on device
- No cloud storage or external servers
- API key stored securely using AsyncStorage
- No personal data transmitted except to Gemini AI for workout generation

## 🐛 Troubleshooting

### App won't start
- Make sure all dependencies are installed: `npm install`
- Clear Expo cache: `npx expo start -c`

### API key not working
- Verify your API key is correct
- Check your internet connection
- Ensure you have API quota remaining

### Workout not generating
- Confirm API key is saved
- Check all required fields are filled
- Verify internet connectivity

## 📝 Demo Instructions

For hackathon demonstration:

1. Show the clean, professional UI
2. Generate a sample workout (have API key ready)
3. Demonstrate the timer functionality
4. Show progress tracking features
5. Display AI motivational messages
6. Highlight the profile with BMI calculator

## 🚀 Future Enhancements

Potential features for future versions:
- Exercise animations/videos
- Social sharing capabilities
- Calendar integration
- Push notifications for workout reminders
- Custom exercise library
- Photo progress tracking
- Integration with fitness wearables

## 📄 License

This project is built for educational and hackathon purposes.

## 👨‍💻 Author

Built with ❤️ for hackathon demonstration

## 🙏 Acknowledgments

- Google Gemini AI for powering workout generation
- React Native community
- Expo team for amazing development tools

---

**Ready to transform your fitness journey? Start generating your personalized workouts today! 💪**
