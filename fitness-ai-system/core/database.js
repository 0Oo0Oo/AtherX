// COMPLETE FITNESS DATABASE - ALL 2918 EXERCISES FROM CSV
const fs = require('fs');
const path = require('path');

// Read and parse the complete CSV file
function loadAllExercisesFromCSV() {
  try {
    const csvPath = path.join(__dirname, '../data/megaGymDataset.csv');
    const csvContent = fs.readFileSync(csvPath, 'utf8');
    const lines = csvContent.split('\n');
    
    // Skip header line and process all exercise rows
    const exercises = [];
    for (let i = 1; i < lines.length; i++) {
      const line = lines[i].trim();
      if (line) {
        const exercise = parseCSVLine(line, i - 1); // i-1 because we skip header
        if (exercise) {
          exercises.push(exercise);
        }
      }
    }
    
    return exercises;
  } catch (error) {
    console.error('Error loading CSV:', error);
    return [];
  }
}

// Parse a single CSV line (handling quotes and commas properly)
function parseCSVLine(line, id) {
  const columns = [];
  let current = '';
  let inQuotes = false;
  
  for (let i = 0; i < line.length; i++) {
    const char = line[i];
    if (char === '"') {
      inQuotes = !inQuotes;
    } else if (char === ',' && !inQuotes) {
      columns.push(current.trim());
      current = '';
    } else {
      current += char;
    }
  }
  columns.push(current.trim()); // Add the last column
  
  // Skip malformed lines
  if (columns.length < 8) return null;
  
  return {
    id: parseInt(columns[0]) || id,
    title: cleanString(columns[1]) || `Exercise ${id}`,
    description: cleanString(columns[2]) || '',
    type: cleanString(columns[3]) || 'Strength',
    bodyPart: cleanString(columns[4]) || 'Unknown',
    equipment: cleanString(columns[5]) || 'Body Only',
    level: cleanString(columns[6]) || 'Beginner',
    rating: parseFloat(columns[7]) || null,
    ratingDesc: cleanString(columns[8]) || ''
  };
}

function cleanString(str) {
  return str ? str.replace(/^"(.*)"$/, '$1').trim() : '';
}

// Generate comprehensive keywords for each exercise
function generateKeywords(exercise) {
  const keywords = new Set();
  
  // Title keywords
  if (exercise.title) {
    exercise.title.toLowerCase().split(/[\s-_]+/).forEach(word => {
      if (word.length > 2) keywords.add(word.replace(/[^\w]/g, ''));
    });
  }
  
  // Description keywords - extract meaningful terms
  if (exercise.description) {
    const words = exercise.description.toLowerCase()
      .replace(/[^\w\s]/g, ' ')
      .split(/\s+/)
      .filter(word => 
        word.length > 3 && 
        !['this', 'that', 'with', 'from', 'they', 'also', 'well', 'time', 'reps', 
          'performed', 'usually', 'exercise', 'movement', 'muscle', 'muscles', 
          'popular', 'targeting', 'often', 'variation'].includes(word)
      );
    words.forEach(word => keywords.add(word));
  }
  
  // Equipment synonyms and variants
  if (exercise.equipment) {
    const eq = exercise.equipment.toLowerCase();
    keywords.add(eq.replace(/[^\w]/g, ''));
    
    const equipmentMap = {
      'bands': ['band', 'resistance', 'elastic', 'tube'],
      'barbell': ['bar', 'weight', 'bb', 'olympic'],
      'dumbbell': ['weight', 'db', 'dumbell', 'freeweight'],
      'kettlebells': ['kettlebell', 'kb', 'bell'],
      'cable': ['machine', 'pulley', 'cables'],
      'body only': ['bodyweight', 'calisthenics', 'noequipment', 'bw'],
      'e-z curl bar': ['ez', 'ezbar', 'curl', 'curlbar'],
      'medicine ball': ['medball', 'med', 'ball'],
      'foam roll': ['roller', 'foam', 'mobility'],
      'other': ['misc', 'equipment']
    };
    
    Object.keys(equipmentMap).forEach(key => {
      if (eq.includes(key.replace(/[- ]/g, ''))) {
        equipmentMap[key].forEach(variant => keywords.add(variant));
      }
    });
  }
  
  // Body part keywords and muscle group synonyms
  if (exercise.bodyPart) {
    const bp = exercise.bodyPart.toLowerCase();
    keywords.add(bp.replace(/[^\w]/g, ''));
    
    const bodyPartMap = {
      'abdominals': ['abs', 'core', 'stomach', 'midsection'],
      'biceps': ['bis', 'arms', 'bicep'],
      'triceps': ['tris', 'arms', 'tricep'],
      'chest': ['pecs', 'pectorals', 'breast'],
      'shoulders': ['delts', 'deltoids', 'shoulder'],
      'back': ['lats', 'latissimus', 'rhomboids', 'traps'],
      'legs': ['quads', 'quadriceps', 'hamstrings', 'glutes', 'calves'],
      'forearms': ['forearm', 'wrists', 'grip'],
      'cardio': ['cardiovascular', 'aerobic', 'endurance']
    };
    
    Object.keys(bodyPartMap).forEach(key => {
      if (bp.includes(key)) {
        bodyPartMap[key].forEach(variant => keywords.add(variant));
      }
    });
  }
  
  // Level synonyms
  if (exercise.level) {
    const level = exercise.level.toLowerCase();
    keywords.add(level);
    
    const levelMap = {
      'beginner': ['easy', 'basic', 'starter', 'novice'],
      'intermediate': ['moderate', 'medium', 'standard'],
      'advanced': ['hard', 'difficult', 'expert', 'pro']
    };
    
    if (levelMap[level]) {
      levelMap[level].forEach(variant => keywords.add(variant));
    }
  }
  
  // Exercise type keywords
  if (exercise.type) {
    keywords.add(exercise.type.toLowerCase());
    if (exercise.type.toLowerCase() === 'strength') {
      ['resistance', 'weights', 'lifting'].forEach(syn => keywords.add(syn));
    }
  }
  
  return Array.from(keywords);
}

// Categorize exercises
function determineCategory(exercise) {
  const title = (exercise.title || '').toLowerCase();
  const desc = (exercise.description || '').toLowerCase();
  const equipment = (exercise.equipment || '').toLowerCase();
  const bodyPart = (exercise.bodyPart || '').toLowerCase();
  
  // Specific movement patterns
  if (title.includes('plank')) return 'Plank Variations';
  if (title.includes('crunch')) return 'Crunches';
  if (title.includes('push') && title.includes('up')) return 'Push-ups';
  if (title.includes('squat')) return 'Squats';
  if (title.includes('deadlift')) return 'Deadlifts';
  if (title.includes('press') && bodyPart.includes('shoulder')) return 'Shoulder Press';
  if (title.includes('curl') && bodyPart.includes('bicep')) return 'Bicep Curls';
  if (title.includes('row')) return 'Rowing';
  if (title.includes('pull') && title.includes('up')) return 'Pull-ups';
  if (title.includes('twist') || desc.includes('oblique')) return 'Rotational';
  if (title.includes('roll')) return 'Roll Outs';
  if (title.includes('fly') || title.includes('flye')) return 'Flyes';
  if (title.includes('lunge')) return 'Lunges';
  
  // Equipment-based categories
  if (equipment.includes('cable')) return 'Cable Exercises';
  if (equipment.includes('dumbbell')) return 'Dumbbell Exercises';
  if (equipment.includes('barbell')) return 'Barbell Exercises';
  if (equipment.includes('kettlebell')) return 'Kettlebell Exercises';
  if (equipment.includes('band')) return 'Resistance Band Exercises';
  if (equipment.includes('body only')) return 'Bodyweight Exercises';
  
  // Body part fallback
  if (bodyPart.includes('chest')) return 'Chest Exercises';
  if (bodyPart.includes('back')) return 'Back Exercises';
  if (bodyPart.includes('shoulder')) return 'Shoulder Exercises';
  if (bodyPart.includes('arm') || bodyPart.includes('bicep') || bodyPart.includes('tricep')) return 'Arm Exercises';
  if (bodyPart.includes('leg') || bodyPart.includes('quad') || bodyPart.includes('hamstring')) return 'Leg Exercises';
  if (bodyPart.includes('abdominal') || bodyPart.includes('core')) return 'Core Exercises';
  
  return 'General Fitness';
}

// Load and process all exercises
const allExercises = loadAllExercisesFromCSV();
const processedData = allExercises.map(exercise => ({
  ...exercise,
  keywords: generateKeywords(exercise),
  category: determineCategory(exercise)
}));

console.log(`\\n🎯 COMPLETE FITNESS DATABASE LOADED`);
console.log(`📊 Total Exercises: ${processedData.length}`);
console.log(`🗂️ Categories: ${[...new Set(processedData.map(ex => ex.category))].length}`);
console.log(`🏋️ Equipment Types: ${[...new Set(processedData.map(ex => ex.equipment))].length}`);
console.log(`💪 Body Parts: ${[...new Set(processedData.map(ex => ex.bodyPart))].length}`);

// Export the complete database
module.exports = {
  fitnessData: processedData,
  totalExercises: processedData.length,
  searchByKeywords: (query) => {
    const searchTerms = query.toLowerCase().split(/\\s+/);
    return processedData.filter(exercise => 
      searchTerms.some(term => 
        exercise.keywords.some(keyword => keyword.includes(term)) ||
        exercise.title.toLowerCase().includes(term) ||
        exercise.description.toLowerCase().includes(term)
      )
    );
  },
  getByCategory: (category) => {
    return processedData.filter(ex => ex.category === category);
  },
  getByEquipment: (equipment) => {
    return processedData.filter(ex => 
      ex.equipment.toLowerCase().includes(equipment.toLowerCase())
    );
  },
  getByBodyPart: (bodyPart) => {
    return processedData.filter(ex => 
      ex.bodyPart.toLowerCase().includes(bodyPart.toLowerCase())
    );
  },
  getAllCategories: () => [...new Set(processedData.map(ex => ex.category))],
  getAllEquipment: () => [...new Set(processedData.map(ex => ex.equipment))],
  getAllBodyParts: () => [...new Set(processedData.map(ex => ex.bodyPart))]
};