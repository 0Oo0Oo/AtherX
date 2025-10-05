require('dotenv').config();
const { GoogleGenerativeAI } = require("@google/generative-ai");
const readline = require('readline');
const fs = require('fs');
const path = require('path');

// Load COMPLETE exercise database with ALL 2918 exercises
const { 
  fitnessData, 
  totalExercises, 
  searchByKeywords, 
  getByCategory, 
  getByEquipment, 
  getByBodyPart,
  getAllCategories,
  getAllEquipment,
  getAllBodyParts
} = require('./database');

// Polyfill for fetch and Headers in older Node.js versions
if (!global.fetch) {
  const fetch = require('node-fetch');
  global.fetch = fetch;
  global.Headers = fetch.Headers;
  global.Request = fetch.Request;
  global.Response = fetch.Response;
}

// Initialize Gemini
const genAI = new GoogleGenerativeAI(process.env.GOOGLE_API_KEY);
const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash-exp" });

// Create readline interface for user input
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

// Function to get user input
function getUserInput(prompt) {
  return new Promise((resolve) => {
    rl.question(prompt, (input) => {
      resolve(input);
    });
  });
}

// Function to read system prompt from file
function readSystemPrompt(filename = 'fitness_assistant_system_prompt.txt') {
  try {
    const filePath = path.join(__dirname, '../config', filename);
    if (fs.existsSync(filePath)) {
      return fs.readFileSync(filePath, 'utf8');
    } else {
      console.log(`System prompt file not found: ${filename}`);
      return "";
    }
  } catch (error) {
    console.error("Error reading system prompt:", error);
    return "";
  }
}

// Enhanced search function for fitness exercises
function searchFitnessExercises(query, limit = 8) {
  const queryWords = query.toLowerCase().split(/\s+/);
  const results = [];
  
  fitnessData.forEach(exercise => {
    let score = 0;
    const exerciseText = [
      exercise.title || '',
      exercise.description || '',
      exercise.equipment || '',
      exercise.bodyPart || '',
      exercise.type || '',
      exercise.level || ''
    ].join(' ').toLowerCase();
    
    queryWords.forEach(queryWord => {
      // Direct matches in title (highest priority)
      if (exercise.title && exercise.title.toLowerCase().includes(queryWord)) {
        score += 20;
      }
      
      // Direct matches in description
      if (exercise.description && exercise.description.toLowerCase().includes(queryWord)) {
        score += 15;
      }
      
      // Keyword matches
      if (exercise.keywords && exercise.keywords.includes(queryWord)) {
        score += 12;
      }
      
      // Exact field matches
      if (exercise.equipment && exercise.equipment.toLowerCase() === queryWord) score += 18;
      if (exercise.bodyPart && exercise.bodyPart.toLowerCase() === queryWord) score += 18;
      if (exercise.type && exercise.type.toLowerCase() === queryWord) score += 15;
      if (exercise.level && exercise.level.toLowerCase() === queryWord) score += 10;
      
      // Partial matches
      if (exercise.keywords) {
        exercise.keywords.forEach(keyword => {
          if (keyword.includes(queryWord) || queryWord.includes(keyword)) {
            score += 5;
          }
        });
      }
    });
    
    if (score > 0) {
      results.push({ ...exercise, relevanceScore: score });
    }
  });
  
  return results
    .sort((a, b) => b.relevanceScore - a.relevanceScore)
    .slice(0, limit);
}

// Function to find relevant exercises and format for AI
function findAndFormatExercises(userQuery) {
  const relevantExercises = searchFitnessExercises(userQuery, 6);
  
  if (!relevantExercises || relevantExercises.length === 0) {
    return "No specific exercises found in the database for this query.";
  }
  
  return relevantExercises.map((ex, index) => 
    `${index + 1}. **${ex.title}**
   - Type: ${ex.type}
   - Body Part: ${ex.bodyPart}
   - Equipment: ${ex.equipment}
   - Level: ${ex.level}
   - Rating: ${ex.rating || 'N/A'}
   - Category: ${ex.category || 'General'}
   - Description: ${ex.description || 'No description available'}`
  ).join('\n\n');
}

// Enhanced AI response generation with exercise database integration
async function generateResponse(userInput, systemPrompt = "") {
  try {
    // Find relevant exercises from our database
    const exerciseContext = findAndFormatExercises(userInput);
    
    // Create enhanced prompt with exercise data
    const enhancedPrompt = `${systemPrompt}

EXERCISE DATABASE CONTEXT:
The following exercises from our comprehensive fitness database are relevant to the user's query:

${exerciseContext}

USER QUERY: ${userInput}

Please provide a helpful response that:
1. Uses information from the exercise database when relevant
2. Combines your AI knowledge with the specific exercise details provided
3. Gives practical, actionable fitness advice
4. Mentions specific exercises by name when appropriate
5. Considers the user's fitness level and available equipment if mentioned

Response:`;

    const result = await model.generateContent(enhancedPrompt);
    const response = await result.response;
    return response.text();
  } catch (error) {
    console.error("Error generating response:", error);
    return "Sorry, I couldn't generate a response. Please check your API key and try again.";
  }
}

// Function to get exercise statistics
function getExerciseStats() {
  const stats = {
    total: fitnessData.length,
    byEquipment: {},
    byLevel: {},
    byType: {},
    byBodyPart: {},
    avgRating: 0
  };
  
  let ratingSum = 0;
  let ratingCount = 0;
  
  fitnessData.forEach(exercise => {
    // Count by equipment
    stats.byEquipment[exercise.equipment] = (stats.byEquipment[exercise.equipment] || 0) + 1;
    
    // Count by level
    stats.byLevel[exercise.level] = (stats.byLevel[exercise.level] || 0) + 1;
    
    // Count by type
    stats.byType[exercise.type] = (stats.byType[exercise.type] || 0) + 1;
    
    // Count by body part
    stats.byBodyPart[exercise.bodyPart] = (stats.byBodyPart[exercise.bodyPart] || 0) + 1;
    
    // Calculate average rating
    if (exercise.rating && exercise.rating > 0) {
      ratingSum += exercise.rating;
      ratingCount++;
    }
  });
  
  stats.avgRating = ratingCount > 0 ? (ratingSum / ratingCount).toFixed(2) : 'N/A';
  
  return stats;
}

// Main function to run the AI assistant with integrated fitness database
async function runAI() {
  console.log("🏋️‍♀️ Welcome to the Enhanced Fitness AI Assistant! 🏋️‍♂️");
  console.log("Powered by Gemini 2.0 Flash + Comprehensive Exercise Database");
  console.log("Make sure to set your GOOGLE_API_KEY in your .env file.\n");
  
  // Display database stats
  const stats = getExerciseStats();
  console.log("📊 Exercise Database Stats:");
  console.log(`   Total Exercises: ${stats.total}`);
  console.log(`   Equipment Types: ${Object.keys(stats.byEquipment).join(', ')}`);
  console.log(`   Difficulty Levels: ${Object.keys(stats.byLevel).join(', ')}`);
  console.log(`   Average Rating: ${stats.avgRating}\n`);
  
  // Get system prompt
  const systemPrompt = readSystemPrompt();
  console.log("✅ System prompt and exercise database loaded.\n");
  
  console.log("💡 Try asking questions like:");
  console.log("   - 'Show me beginner ab exercises'");
  console.log("   - 'What are some good dumbbell core workouts?'");
  console.log("   - 'I want bodyweight exercises for intermediate level'");
  console.log("   - 'Find me highly rated abdominal exercises'");
  console.log("   - 'What equipment do I need for core training?'\n");

  while (true) {
    try {
      // Get user input
      const userInput = await getUserInput("🤔 What can I help you with today? ");
      
      if (!userInput.trim()) {
        console.log("Please enter a valid prompt.");
        continue;
      }
      
      // Special commands
      if (userInput.toLowerCase() === 'stats') {
        console.log("\n📊 Detailed Exercise Database Statistics:");
        console.log(JSON.stringify(stats, null, 2));
        continue;
      }
      
      if (userInput.toLowerCase().includes('random exercise')) {
        const randomExercises = fitnessData.sort(() => 0.5 - Math.random()).slice(0, 3);
        console.log("\n🎲 Here are 3 random exercises:");
        randomExercises.forEach((ex, i) => {
          console.log(`\n${i + 1}. ${ex.title}`);
          console.log(`   Equipment: ${ex.equipment} | Level: ${ex.level} | Rating: ${ex.rating || 'N/A'}`);
          if (ex.description) console.log(`   ${ex.description.substring(0, 150)}...`);
        });
        continue;
      }
      
      // Generate AI response
      console.log("\n🔍 Searching exercise database and generating response...");
      const aiResponse = await generateResponse(userInput, systemPrompt);
      console.log("\n🤖 AI Response:");
      console.log("=".repeat(60));
      console.log(aiResponse);
      console.log("=".repeat(60));
      
      // Check if user wants to continue
      const continueChoice = await getUserInput("\n❓ Would you like to ask another question? (y/n): ");
      
      if (continueChoice.toLowerCase() !== 'y' && continueChoice.toLowerCase() !== 'yes') {
        console.log("\n👋 Thanks for using the Fitness AI Assistant! Stay healthy! 💪");
        rl.close();
        process.exit(0);
      }
      
      console.log(); // Add blank line for readability
      
    } catch (error) {
      console.error("❌ Error running the AI assistant:", error);
      const retryChoice = await getUserInput("Would you like to try again? (y/n): ");
      if (retryChoice.toLowerCase() !== 'y' && retryChoice.toLowerCase() !== 'yes') {
        rl.close();
        break;
      }
    }
  }
}

// Start the application
runAI();