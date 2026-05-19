// Gets due date info - now accepts dueDate parameter from auth context instead of localStorage
export const getDueDateInfo = (dueDateStr) => {
  if (!dueDateStr) return { currentWeek: 1, weeksLeft: 40, trimester: 1, daysLeft: 280 };
  
  const dueDate = new Date(dueDateStr);
  const today = new Date();
  const msPerWeek = 7 * 24 * 60 * 60 * 1000;
  const msPerDay = 24 * 60 * 60 * 1000;
  const weeksLeft = Math.ceil((dueDate - today) / msPerWeek);
  const daysLeft = Math.ceil((dueDate - today) / msPerDay);
  const currentWeek = Math.min(Math.max(40 - weeksLeft, 1), 40);
  const trimester = currentWeek <= 13 ? 1 : currentWeek <= 26 ? 2 : 3;
  return { currentWeek, weeksLeft: Math.max(weeksLeft, 0), trimester, daysLeft: Math.max(daysLeft, 0) };
};

export const getBabySize = (week) => {
  if (week <= 4) return { emoji: '🫐', name: 'Blueberry' };
  if (week <= 8) return { emoji: '🍓', name: 'Strawberry' };
  if (week <= 12) return { emoji: '🍋', name: 'Lemon' };
  if (week <= 16) return { emoji: '🍊', name: 'Orange' };
  if (week <= 20) return { emoji: '🥭', name: 'Mango' };
  if (week <= 24) return { emoji: '🌽', name: 'Corn' };
  if (week <= 28) return { emoji: '🥦', name: 'Cauliflower' };
  if (week <= 32) return { emoji: '🍍', name: 'Pineapple' };
  if (week <= 36) return { emoji: '🎃', name: 'Pumpkin' };
  return { emoji: '🍉', name: 'Watermelon' };
};

export const getTodayKey = () => {
  return new Date().toISOString().split('T')[0];
};

export const formatDate = (dateStr) => {
  const date = new Date(dateStr);
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
};

export const getDayName = (dateStr) => {
  const date = new Date(dateStr);
  return date.toLocaleDateString('en-US', { weekday: 'short' });
};

export const getGreeting = () => {
  const hour = new Date().getHours();
  if (hour < 12) return 'Good morning';
  if (hour < 17) return 'Good afternoon';
  return 'Good evening';
};
