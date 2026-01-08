// Script/gameEngine.js

const STORAGE_KEY = "quiz_user_profile";

// Initial State
const initialState = {
  totalPoints: 0,
  history: [], // Array of past quiz results
  badges: [], // Array of unlocked badge IDs
  streaks: {
    currentDaily: 0,
    lastLoginDate: null,
  },
};

// Badge Definitions
const BADGES = [
  {
    id: "perfect-score",
    icon: "🏆",
    title: "Perfectionist",
    desc: "Score 100% on a quiz",
  },
  {
    id: "speed-demon",
    icon: "⚡",
    title: "Speed Demon",
    desc: "Complete a quiz in under 2 minutes",
  },
  {
    id: "week-warrior",
    icon: "🔥",
    title: "Week Warrior",
    desc: "Take quizzes 7 days in a row",
  },
  {
    id: "novice",
    icon: "🌱",
    title: "First Step",
    desc: "Complete your first quiz",
  },
];

export const gameEngine = {
  // 1. Get User Data
  getUserData() {
    const stored = localStorage.getItem(STORAGE_KEY);
    return stored ? JSON.parse(stored) : initialState;
  },

  // 2. Save User Data
  saveUserData(data) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  },

  // 3. Process Quiz Result
  processResult(result) {
    const user = this.getUserData();
    const { score, total, timeElapsed, examId } = result;

    // --- A. Calculate Points ---
    let pointsEarned = 0;
    const basePoints = score * 10; // 10 pts per correct answer
    pointsEarned += basePoints;

    // Bonus: Speed (if avg time per question < 10s or total < 2 mins)
    // Adding 5 pts per question if answered quickly implies looking at individual Q times,
    // but for simplicity, let's use the "under 2 mins" rule for a flat bonus.
    let speedBonus = 0;
    if (timeElapsed < 120 && score > 0) {
      speedBonus = 50; // Flat bonus for speed
      pointsEarned += speedBonus;
    }

    // --- B. Badge Logic ---
    const newBadges = [];

    // Check: Novice
    if (!user.badges.includes("novice")) {
      newBadges.push("novice");
    }

    // Check: Perfect Score
    if (
      score === total &&
      total > 0 &&
      !user.badges.includes("perfect-score")
    ) {
      newBadges.push("perfect-score");
    }

    // Check: Speed Demon
    if (
      timeElapsed < 120 &&
      score > 0 &&
      !user.badges.includes("speed-demon")
    ) {
      newBadges.push("speed-demon");
    }

    // --- C. Update User Profile ---
    user.totalPoints += pointsEarned;
    user.badges = [...user.badges, ...newBadges];

    // Add to history
    const historyEntry = {
      examId,
      date: new Date().toISOString(),
      score,
      total,
      percentage: Math.round((score / total) * 100),
      pointsEarned,
      timeElapsed,
    };
    user.history.unshift(historyEntry); // Add to beginning of array

    this.saveUserData(user);

    return {
      pointsEarned,
      speedBonus,
      newBadges: newBadges.map((id) => BADGES.find((b) => b.id === id)),
      totalPoints: user.totalPoints,
    };
  },

  // 4. Get Leaderboard (Simulated Local vs Mock Global)
  getLeaderboard() {
    // In a real app, this fetches from a database.
    // For now, we return the local user + mock data.
    const user = this.getUserData();
    const mockUsers = [
      { name: "QuizMaster", points: 5000, rank: 1 },
      { name: "Alex", points: 4200, rank: 2 },
      { name: "Sarah", points: 3800, rank: 3 },
    ];

    const currentUser = {
      name: "You",
      points: user.totalPoints,
      rank: 0,
      isUser: true,
    };
    const all = [...mockUsers, currentUser].sort((a, b) => b.points - a.points);

    // Assign ranks
    return all.map((u, i) => ({ ...u, rank: i + 1 }));
  },
};
