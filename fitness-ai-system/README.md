# 🏋️ Fitness AI System

A comprehensive fitness assistant powered by Google Gemini AI and a complete exercise database of 2,918 exercises.

## 📁 Project Structure

```
fitness-ai-system/
├── core/
│   ├── main.js          # Main fitness AI assistant application
│   └── database.js      # Complete exercise database (2,918 exercises)
├── data/
│   └── megaGymDataset.csv # Original CSV data source
├── config/
│   └── fitness_assistant_system_prompt.txt # AI system prompt
├── utils/
│   └── database_verification.js # Database verification script
├── .env                 # Environment variables (API keys)
├── package.json         # Dependencies and scripts
└── README.md           # This file
```

## 🚀 Quick Start

1. **Install Dependencies**
   ```bash
   npm install
   ```

2. **Set up Environment Variables**
   Create a `.env` file with your Google API key:
   ```
   GOOGLE_API_KEY=your_gemini_api_key_here
   ```

3. **Run the Fitness AI Assistant**
   ```bash
   node core/main.js
   ```

4. **Verify Database (Optional)**
   ```bash
   node utils/database_verification.js
   ```

## ✨ Features

### 🤖 AI-Powered Fitness Assistant
- **Google Gemini 2.0 Flash Integration**: Advanced natural language processing
- **Intelligent Exercise Recommendations**: Personalized workout suggestions
- **Comprehensive Exercise Database**: 2,918 exercises from megaGymDataset.csv
- **Smart Keyword Search**: Find exercises by equipment, body part, difficulty, etc.

### 📊 Complete Exercise Database
- **Total Exercises**: 2,918 (100% of CSV data)
- **Body Parts**: 17 different muscle groups
- **Equipment Types**: 13 categories (barbell, dumbbell, bodyweight, etc.)
- **Exercise Categories**: 26 different types
- **Difficulty Levels**: Beginner, Intermediate, Expert
- **Detailed Descriptions**: Full exercise instructions and tips

### 🔍 Advanced Search Capabilities
- **Equipment-based filtering**: Find exercises for available equipment
- **Body-part targeting**: Focus on specific muscle groups
- **Difficulty matching**: Appropriate exercises for your fitness level
- **Rating-based recommendations**: Highly-rated exercises prioritized
- **Keyword intelligence**: Natural language exercise discovery

## 💡 Usage Examples

### Interactive Mode
```bash
node core/main.js
```

Then ask questions like:
- "Show me beginner ab exercises"
- "What are some good dumbbell workouts?"
- "I want bodyweight exercises for intermediate level"
- "Find me highly rated chest exercises"
- "What equipment do I need for leg training?"

### Database Statistics
```bash
node utils/database_verification.js
```

## 🏗️ Technical Details

### Core Components

**main.js** - Main application featuring:
- Gemini AI integration
- Exercise search and filtering
- Interactive CLI interface
- Personalized workout generation

**database.js** - Complete exercise database with:
- CSV parsing and data processing
- Keyword generation algorithms
- Search and filtering functions
- Exercise categorization system

### Data Processing
- **Smart CSV Parsing**: Handles quotes, commas, and special characters
- **Keyword Generation**: Creates searchable terms from titles and descriptions
- **Equipment Mapping**: Synonyms and variants for all equipment types
- **Body Part Classification**: Comprehensive muscle group categorization

### Search Algorithm
- **Multi-term matching**: Supports complex search queries
- **Relevance scoring**: Ranks results by match quality
- **Synonym expansion**: Finds exercises using alternative terms
- **Category filtering**: Narrows results by exercise type

## 🎯 API Integration

### Google Gemini AI
- **Model**: gemini-2.0-flash-exp
- **Features**: Natural language processing, workout generation
- **Configuration**: Environment variable based setup
- **Error Handling**: Graceful fallbacks and user-friendly messages

## 🔧 Configuration

### Environment Variables
```bash
GOOGLE_API_KEY=your_gemini_api_key_here
```

### Dependencies
```json
{
  "@google/generative-ai": "Latest",
  "dotenv": "Latest",
  "node-fetch": "Latest"
}
```

## 📈 Database Statistics

- **Total Exercises**: 2,918
- **Equipment Types**: 13 (Barbell, Dumbbell, Cable, Bodyweight, etc.)
- **Body Parts**: 17 (Chest, Back, Shoulders, Arms, Legs, Core, etc.)
- **Exercise Categories**: 26 (Squats, Push-ups, Deadlifts, etc.)
- **Average Rating**: 7.76/10
- **Completion**: 100% of source CSV data

## 🏆 Key Improvements

✅ **Complete Data Usage**: All 2,918 exercises from CSV (not partial)  
✅ **Smart Search**: Advanced keyword matching and relevance scoring  
✅ **AI Integration**: Seamless Gemini 2.0 Flash integration  
✅ **Clean Architecture**: Organized folder structure and modular design  
✅ **Comprehensive Keywords**: Extensive synonym and variant mapping  
✅ **Robust Parsing**: Handles complex CSV data with quotes and commas  

## 🚀 Future Enhancements

- Web interface for easier interaction
- Exercise video/image integration
- Workout plan persistence
- Progress tracking capabilities
- Social sharing features
- Mobile app development

## 📝 License

Educational and demonstration purposes.

---

**Ready to transform your fitness journey with AI-powered exercise recommendations! 💪**