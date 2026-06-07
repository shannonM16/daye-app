import re

with open('src/App.jsx', 'r') as f:
    content = f.read()

# Remove the misplaced functions from inside the component
pattern = r'\n\s*function getDailyPlanCount\(\) \{.*?return count < 3\n  \}'
content = re.sub(pattern, '', content, flags=re.DOTALL)

# The three helper functions to insert before App()
funcs = """
function getDailyPlanCount() {
  try {
    const raw = localStorage.getItem('daye_daily_plan_count')
    if (!raw) return { count: 0, date: '' }
    return JSON.parse(raw)
  } catch { return { count: 0, date: '' } }
}

function incrementDailyPlanCount() {
  const today = new Date().toISOString().split('T')[0]
  const current = getDailyPlanCount()
  const count = current.date === today ? current.count + 1 : 1
  localStorage.setItem('daye_daily_plan_count', JSON.stringify({ count, date: today }))
  return count
}

function checkDailyPlanLimit(isPro) {
  if (isPro) return true
  const today = new Date().toISOString().split('T')[0]
  const { count, date } = getDailyPlanCount()
  if (date !== today) return true
  return count < 3
}

"""

content = content.replace('export default function App() {', funcs + 'export default function App() {', 1)

with open('src/App.jsx', 'w') as f:
    f.write(content)

print('Done')
