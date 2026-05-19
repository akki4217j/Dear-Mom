const tasksByTrimester = {
  1: [
    { id: 1, task: "Take prenatal vitamins", category: "health" },
    { id: 2, task: "Drink 8 glasses of water", category: "hydration" },
    { id: 3, task: "Eat a folic acid rich meal", category: "nutrition" },
    { id: 4, task: "Get 8 hours of sleep", category: "rest" },
    { id: 5, task: "Take a 10 min gentle walk", category: "exercise" },
    { id: 6, task: "Log your mood today", category: "mental" },
    { id: 7, task: "Avoid caffeine today", category: "health" },
  ],
  2: [
    { id: 1, task: "Take prenatal vitamins", category: "health" },
    { id: 2, task: "Drink 10 glasses of water", category: "hydration" },
    { id: 3, task: "Do 15 min prenatal yoga", category: "exercise" },
    { id: 4, task: "Eat calcium-rich foods", category: "nutrition" },
    { id: 5, task: "Sleep on your left side", category: "rest" },
    { id: 6, task: "Read or journal for 10 mins", category: "mental" },
    { id: 7, task: "Kick count session", category: "health" },
  ],
  3: [
    { id: 1, task: "Take prenatal vitamins", category: "health" },
    { id: 2, task: "Practice breathing exercises", category: "exercise" },
    { id: 3, task: "Pack hospital bag checklist item", category: "prep" },
    { id: 4, task: "Eat iron-rich meal", category: "nutrition" },
    { id: 5, task: "Rest for at least 1 hour", category: "rest" },
    { id: 6, task: "Contraction timer check", category: "health" },
    { id: 7, task: "Connect with partner today", category: "mental" },
  ]
};

export const categoryColors = {
  health: { bg: 'bg-rose-100', border: 'border-l-rose-500', text: 'text-rose-700' },
  hydration: { bg: 'bg-blue-100', border: 'border-l-blue-500', text: 'text-blue-700' },
  nutrition: { bg: 'bg-green-100', border: 'border-l-green-500', text: 'text-green-700' },
  rest: { bg: 'bg-purple-100', border: 'border-l-purple-500', text: 'text-purple-700' },
  exercise: { bg: 'bg-orange-100', border: 'border-l-orange-500', text: 'text-orange-700' },
  mental: { bg: 'bg-pink-100', border: 'border-l-pink-500', text: 'text-pink-700' },
  prep: { bg: 'bg-yellow-100', border: 'border-l-yellow-500', text: 'text-yellow-700' },
};

export default tasksByTrimester;
