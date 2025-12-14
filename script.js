// Mood tracking functionality
const moodColors = {
  1: "#ff4d4d",
  2: "#ffa64d", 
  3: "#ffd24d",
  4: "#9be15d",
  5: "#4CAF50"
};

const moodEmojis = {
  1: "😢",
  2: "😕", 
  3: "😐",
  4: "😊",
  5: "🤩"
};

const moodTexts = {
  1: "Very Sad",
  2: "Sad",
  3: "Neutral", 
  4: "Happy",
  5: "Excellent"
};

let moods = JSON.parse(localStorage.getItem("moods")) || [];
let selectedMood = null;
let chart = null;

// Hardcoded conversation flow
let conversationIndex = 0;
const hardcodedConversation = [
  {
    trigger: "hello",
    response: "Hello! I'm your AI wellness companion. I can see your mood tracking shows some ups and downs this week. How are you feeling right now?"
  },
  {
    trigger: "feeling",
    response: "I understand. Looking at your data, your mood average is fluctuating. Can you tell me what's been weighing on your mind lately?"
  },
  {
    trigger: "stressed",
    response: "Stress can really impact our wellbeing. I notice your sleep hours vary between 5-8 hours. How has your sleep been affecting your stress levels?"
  },
  {
    trigger: "sleep",
    response: "Sleep is crucial for mental health. Based on your patterns, I'd suggest trying a 5-minute breathing exercise before bed. What activities usually help you relax?"
  },
  {
    trigger: "work",
    response: "Work stress is very common. Your mood entries show you're actively tracking your wellbeing, which is great! Have you tried taking short breaks during your workday?"
  },
  {
    trigger: "anxious",
    response: "Anxiety can be overwhelming. I see you've completed some wellness activities - that's excellent progress! Try a 10-minute mindful walk when you feel anxious."
  },
  {
    trigger: "better",
    response: "I'm glad you're feeling better! Your commitment to tracking your mood shows real dedication to your mental health. Keep up these positive habits!"
  },
  {
    trigger: "tired",
    response: "Fatigue affects everything. Your sleep data shows inconsistent patterns. Consider setting a regular bedtime routine and writing down 3 things you're grateful for each night."
  },
  {
    trigger: "lonely",
    response: "Loneliness is a valid feeling. Your wellness journey shows you're taking care of yourself. Consider reaching out to a friend or joining a community activity."
  },
  {
    trigger: "thanks",
    response: "You're very welcome! Remember, I'm always here to support you. Your progress in tracking your mental health is truly commendable. Take care of yourself! 💙 let's upload a photo of your beatiful smile"
  }
];

// Initialize dashboard
document.addEventListener('DOMContentLoaded', function() {
  initChart();
  renderHistory();
  updateStats();
  initSleepChart();
  initActivities();
  renderActivities();
  addTestImage();
  renderAlbum();
  initChat();
});

function selectMood(value) {
  selectedMood = value;
  
  // Update UI
  document.querySelectorAll('.mood-btn').forEach(btn => {
    btn.classList.remove('selected');
  });
  
  document.querySelector(`[data-mood="${value}"]`).classList.add('selected');
  document.getElementById('submitMood').disabled = false;
}

function addMood() {
  if (!selectedMood) return;
  
  const date = new Date().toLocaleString();
  const mood = { 
    value: Number(selectedMood), 
    date,
    timestamp: Date.now()
  };
  
  moods.push(mood);
  localStorage.setItem("moods", JSON.stringify(moods));
  
  // Update chart
  updateChart();
  renderHistory();
  updateStats();
  
  // Reset selection
  document.querySelectorAll('.mood-btn').forEach(btn => {
    btn.classList.remove('selected');
  });
  document.getElementById('submitMood').disabled = true;
  selectedMood = null;
  
  // Show success message
  showNotification("Mood recorded successfully! 🎉");
}

function initChart() {
  const ctx = document.getElementById("moodChart");
  
  chart = new Chart(ctx, {
    type: "line",
    data: {
      labels: moods.slice(-7).map(m => new Date(m.timestamp).toLocaleDateString()),
      datasets: [{
        label: "Mood Over Time",
        data: moods.slice(-7).map(m => m.value),
        borderColor: "#667eea",
        backgroundColor: "rgba(102, 126, 234, 0.1)",
        tension: 0.4,
        fill: true,
        pointBackgroundColor: "#667eea",
        pointBorderColor: "#fff",
        pointBorderWidth: 2,
        pointRadius: 6
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          display: false
        }
      },
      scales: {
        y: {
          beginAtZero: true,
          max: 5,
          ticks: {
            stepSize: 1,
            callback: function(value) {
              return moodEmojis[value] || value;
            }
          }
        },
        x: {
          grid: {
            display: false
          }
        }
      }
    }
  });
}

function updateChart() {
  const recentMoods = moods.slice(-7);
  chart.data.labels = recentMoods.map(m => new Date(m.timestamp).toLocaleDateString());
  chart.data.datasets[0].data = recentMoods.map(m => m.value);
  chart.update();
}

function renderHistory() {
  const container = document.getElementById("moodHistory");
  container.innerHTML = "";
  
  const recentMoods = moods.slice(-10).reverse();
  
  recentMoods.forEach(mood => {
    const div = document.createElement("div");
    div.className = "mood-entry";
    div.style.borderLeftColor = moodColors[mood.value];
    
    div.innerHTML = `
      <div class="emoji">${moodEmojis[mood.value]}</div>
      <div class="details">
        <div class="mood-text">${moodTexts[mood.value]}</div>
        <div class="date">${mood.date}</div>
      </div>
    `;
    
    container.appendChild(div);
  });
  
  if (recentMoods.length === 0) {
    container.innerHTML = '<p style="text-align: center; color: #718096;">No mood entries yet. Start tracking your mood above!</p>';
  }
}

function updateStats() {
  const weeklyMoods = moods.filter(m => {
    const weekAgo = Date.now() - (7 * 24 * 60 * 60 * 1000);
    return m.timestamp > weekAgo;
  });
  
  const average = weeklyMoods.length > 0 
    ? (weeklyMoods.reduce((sum, m) => sum + m.value, 0) / weeklyMoods.length).toFixed(1)
    : 0;
  
  document.getElementById('weeklyAvg').textContent = average;
  document.getElementById('totalEntries').textContent = moods.length;
}

// Chat functionality - no toggle needed since it's always visible

function initChat() {
  addBotMessage("Hello! I'm your AI wellness companion and psychologist. I can see your mood tracking, sleep patterns, and activities. Tell me about your day and how you're feeling!");
}

function addBotMessage(message) {
  const messagesContainer = document.getElementById('chatMessages');
  const messageDiv = document.createElement('div');
  messageDiv.className = 'message bot';
  messageDiv.textContent = message;
  messagesContainer.appendChild(messageDiv);
  messagesContainer.scrollTop = messagesContainer.scrollHeight;
}

function addUserMessage(message) {
  const messagesContainer = document.getElementById('chatMessages');
  const messageDiv = document.createElement('div');
  messageDiv.className = 'message user';
  messageDiv.textContent = message;
  messagesContainer.appendChild(messageDiv);
  messagesContainer.scrollTop = messagesContainer.scrollHeight;
}

function showTypingIndicator() {
  const messagesContainer = document.getElementById('chatMessages');
  const typingDiv = document.createElement('div');
  typingDiv.className = 'message bot typing-indicator';
  typingDiv.innerHTML = `
    <span>AI is typing</span>
    <div class="typing-dots">
      <span></span>
      <span></span>
      <span></span>
    </div>
  `;
  typingDiv.id = 'typing-indicator';
  messagesContainer.appendChild(typingDiv);
  messagesContainer.scrollTop = messagesContainer.scrollHeight;
}

function removeTypingIndicator() {
  const indicator = document.getElementById('typing-indicator');
  if (indicator) {
    indicator.remove();
  }
}

function sendMessage() {
  const input = document.getElementById('chatInput');
  const message = input.value.trim();
  
  if (!message) return;
  
  addUserMessage(message);
  input.value = '';
  showTypingIndicator();
  
  setTimeout(() => {
    removeTypingIndicator();
    const response = getHardcodedResponse(message);
    addBotMessage(response);
    parseActivitySuggestions(response);
  }, 1500);
}

function getHardcodedResponse(message) {
  const lowerMessage = message.toLowerCase();
  
  // Find matching response or use next in sequence
  for (let conv of hardcodedConversation) {
    if (lowerMessage.includes(conv.trigger)) {
      return conv.response;
    }
  }
  
  // If no match, use sequential responses
  const response = hardcodedConversation[conversationIndex % hardcodedConversation.length].response;
  conversationIndex++;
  return response;
}

function getDashboardContext() {
  const weeklyMoods = moods.filter(m => {
    const weekAgo = Date.now() - (7 * 24 * 60 * 60 * 1000);
    return m.timestamp > weekAgo;
  });
  
  const average = weeklyMoods.length > 0 
    ? (weeklyMoods.reduce((sum, m) => sum + m.value, 0) / weeklyMoods.length).toFixed(1)
    : 0;
  
  const activities = JSON.parse(localStorage.getItem('suggestedActivities')) || [];
  const sleepData = JSON.parse(localStorage.getItem('sleepData')) || mockSleepData;
  
  return {
    recentMoods: moods.slice(-7).map(m => m.value),
    weeklyMoodAverage: average,
    sleepHours: sleepData,
    completedActivities: activities.filter(a => a.count > 0),
    totalMoodEntries: moods.length,
    lastMood: moods.length > 0 ? moods[moods.length - 1] : null
  };
}



function parseActivitySuggestions(response) {
  const activities = JSON.parse(localStorage.getItem('suggestedActivities')) || [];
  const activityKeywords = ['try', 'suggest', 'recommend', 'consider', 'practice'];
  
  if (activityKeywords.some(keyword => response.toLowerCase().includes(keyword))) {
    if (response.toLowerCase().includes('breathing') && !activities.some(a => a.name.includes('breathing'))) {
      activities.push({ id: Date.now(), name: "Deep breathing exercise", count: 0, lastDone: null });
    }
    if (response.toLowerCase().includes('walk') && !activities.some(a => a.name.includes('walk'))) {
      activities.push({ id: Date.now(), name: "Take a mindful walk", count: 0, lastDone: null });
    }
    if (response.toLowerCase().includes('journal') && !activities.some(a => a.name.includes('journal'))) {
      activities.push({ id: Date.now(), name: "Write in journal", count: 0, lastDone: null });
    }
    
    localStorage.setItem('suggestedActivities', JSON.stringify(activities));
    renderActivities();
  }
}



function handleKeyPress(event) {
  if (event.key === 'Enter') {
    sendMessage();
  }
}

function handlePhotoUpload() {
  const fileInput = document.getElementById('photoInput');
  const file = fileInput.files[0];
  
  if (file) {
    const reader = new FileReader();
    reader.onload = function(e) {
      const preview = document.getElementById('photoPreview');
      preview.innerHTML = `<img src="${e.target.result}" alt="Uploaded photo">`;
      
      // Save photo to session album
      saveToAlbum(e.target.result);
      
      // Simulate AI analysis of the photo
      setTimeout(() => {
        analyzePhoto(e.target.result);
      }, 2000);
    };
    reader.readAsDataURL(file);
  }
}

function analyzePhoto(imageData) {
  // Simulate AI photo analysis
  const responses = [
    "I can see a sense of calm in this image. The colors and composition suggest you're finding moments of peace today. 🌸",
    "This photo radiates positive energy! The lighting and subject matter show that you're appreciating the beauty around you. ✨",
    "There's a contemplative quality to this image that suggests you're taking time for reflection, which is wonderful for mental health. 🌿",
    "The composition of this photo shows creativity and mindfulness - both excellent signs of emotional wellbeing! 🎨",
    "I can sense a story in this image. Whatever you're going through, remember that every moment is part of your unique journey. 🌟"
  ];
  
  const randomResponse = responses[Math.floor(Math.random() * responses.length)];
  
  showTypingIndicator();
  
  setTimeout(() => {
    removeTypingIndicator();
    addBotMessage("Thank you for sharing this photo with me! Let me analyze it...");
    
    setTimeout(() => {
      addBotMessage(randomResponse);
      
      setTimeout(() => {
        addBotMessage("It's been wonderful talking with you today. Remember, I'm always here when you need someone to listen. Take care of yourself! 💙🤗");
      }, 2000);
    }, 3000);
  }, 1500);
}

function showNotification(message) {
  const notification = document.createElement('div');
  notification.style.cssText = `
    position: fixed;
    top: 20px;
    right: 20px;
    background: #4CAF50;
    color: white;
    padding: 1rem 1.5rem;
    border-radius: 10px;
    box-shadow: 0 4px 12px rgba(0,0,0,0.15);
    z-index: 10000;
    animation: slideIn 0.3s ease;
  `;
  notification.textContent = message;
  
  document.body.appendChild(notification);
  
  setTimeout(() => {
    notification.style.animation = 'slideOut 0.3s ease';
    setTimeout(() => notification.remove(), 300);
  }, 3000);
}

// Sleep tracking functionality
let sleepChart = null;
const mockSleepData = [7, 6.5, 8, 5, 7.5, 8.5, 6];

function initSleepChart() {
  const ctx = document.getElementById("sleepChart");
  
  sleepChart = new Chart(ctx, {
    type: "bar",
    data: {
      labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
      datasets: [{
        label: "Sleep Hours",
        data: mockSleepData,
        backgroundColor: "rgba(102, 126, 234, 0.6)",
        borderColor: "#667eea",
        borderWidth: 2,
        borderRadius: 8
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          display: false
        }
      },
      scales: {
        y: {
          beginAtZero: true,
          max: 10,
          ticks: {
            stepSize: 1,
            callback: function(value) {
              return value + 'h';
            }
          }
        },
        x: {
          grid: {
            display: false
          }
        }
      }
    }
  });
}

// Activities functionality
const mockActivities = [
  { id: 1, name: "5-minute breathing exercise", count: 0, lastDone: null },
  { id: 2, name: "Take a 10-minute walk outside", count: 0, lastDone: null },
  { id: 3, name: "Write 3 things you're grateful for", count: 0, lastDone: null }
];

function initActivities() {
  let activities = JSON.parse(localStorage.getItem('suggestedActivities'));
  if (!activities) {
    localStorage.setItem('suggestedActivities', JSON.stringify(mockActivities));
  }
}

function renderActivities() {
  const container = document.getElementById('activitiesList');
  const activities = JSON.parse(localStorage.getItem('suggestedActivities')) || [];
  
  container.innerHTML = '';
  
  activities.forEach(activity => {
    const activityDiv = document.createElement('div');
    activityDiv.className = 'activity-item';
    
    const lastDoneText = activity.lastDone 
      ? `Last done: ${new Date(activity.lastDone).toLocaleDateString()}`
      : 'Never done';
    
    activityDiv.innerHTML = `
      <div class="activity-info">
        <div class="activity-name">${activity.name}</div>
        <div class="activity-stats">Completed ${activity.count} times • ${lastDoneText}</div>
      </div>
      <button class="activity-btn" onclick="completeActivity(${activity.id})">
        <i class="fas fa-check"></i> Done
      </button>
    `;
    
    container.appendChild(activityDiv);
  });
}

function completeActivity(activityId) {
  let activities = JSON.parse(localStorage.getItem('suggestedActivities')) || [];
  
  const activity = activities.find(a => a.id === activityId);
  if (activity) {
    activity.count++;
    activity.lastDone = Date.now();
    
    localStorage.setItem('suggestedActivities', JSON.stringify(activities));
    renderActivities();
    showNotification(`Great job completing: ${activity.name}! 🎉`);
  }
}

// Album functionality
function addTestImage() {
  let album = JSON.parse(localStorage.getItem('therapyAlbum')) || [];
  
  // Add test image if album is empty
  if (album.length === 0) {
    const testPhoto = {
      image: 'yass.jpeg',
      date: new Date().toLocaleDateString(),
      timestamp: Date.now()
    };
    album.push(testPhoto);
    localStorage.setItem('therapyAlbum', JSON.stringify(album));
  }
}

function saveToAlbum(imageData) {
  let album = JSON.parse(localStorage.getItem('therapyAlbum')) || [];
  
  const sessionPhoto = {
    image: imageData,
    date: new Date().toLocaleDateString(),
    timestamp: Date.now()
  };
  
  album.push(sessionPhoto);
  localStorage.setItem('therapyAlbum', JSON.stringify(album));
  
  renderAlbum();
  showNotification('Photo added to your therapy album! 📸');
}

function renderAlbum() {
  const albumContainer = document.getElementById('sessionAlbum');
  const album = JSON.parse(localStorage.getItem('therapyAlbum')) || [];
  
  if (album.length === 0) {
    albumContainer.innerHTML = `
      <div class="empty-album">
        <i class="fas fa-camera"></i>
        <p>No therapy session photos yet.<br>Upload photos during your conversations to create memories!</p>
      </div>
    `;
    return;
  }
  
  albumContainer.innerHTML = '';
  
  album.reverse().forEach(photo => {
    const photoDiv = document.createElement('div');
    photoDiv.className = 'session-photo';
    photoDiv.innerHTML = `
      <img src="${photo.image}" alt="Therapy session photo">
      <div class="session-date">${photo.date}</div>
    `;
    albumContainer.appendChild(photoDiv);
  });
}

// Add CSS animations
const style = document.createElement('style');
style.textContent = `
  @keyframes slideIn {
    from { transform: translateX(100%); opacity: 0; }
    to { transform: translateX(0); opacity: 1; }
  }
  @keyframes slideOut {
    from { transform: translateX(0); opacity: 1; }
    to { transform: translateX(100%); opacity: 0; }
  }
`;
document.head.appendChild(style);