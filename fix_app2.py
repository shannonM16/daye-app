with open('src/App.jsx', 'r') as f:
    lines = f.readlines()

# Find and remove ALL occurrences of the three helper functions anywhere in the file
output = []
skip = False
skip_count = 0

i = 0
while i < len(lines):
    line = lines[i]
    stripped = line.strip()
    
    # Detect start of any of the three helper functions (indented or not)
    if (stripped == 'function getDailyPlanCount() {' or
        stripped == 'function incrementDailyPlanCount() {' or
        stripped == 'function checkDailyPlanLimit(isPro) {'):
        # Skip until we find the matching closing brace at same indent level
        indent = len(line) - len(line.lstrip())
        depth = 1
        i += 1
        while i < len(lines) and depth > 0:
            for ch in lines[i]:
                if ch == '{':
                    depth += 1
                elif ch == '}':
                    depth -= 1
            i += 1
        continue
    
    output.append(line)
    i += 1

content = ''.join(output)

# Now insert the three functions cleanly before export default function App()
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

# Verify
import subprocess
result = subprocess.run(['grep', '-n', 'function getDailyPlanCount\|function incrementDailyPlanCount\|function checkDailyPlanLimit\|export default function App', 'src/App.jsx'], capture_output=True, text=True)
print(result.stdout)
print('Done')
