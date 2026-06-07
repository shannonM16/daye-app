with open('src/App.jsx', 'r') as f:
    lines = f.readlines()

# Remove lines 530-562 (0-indexed: 529-561) — the original handleTaskInput
# Line 530 starts with "  const handleTaskInput = useCallback(async (tasks) => {"
# Line 562 ends with "  }, [userProfile, checkInData, user, meetings, setUserTasks, setExtraTasks, setCheckInHistory])"

# Find the original (first) handleTaskInput
start = None
end = None
for i, line in enumerate(lines):
    if 'const handleTaskInput = useCallback' in line and start is None:
        start = i
    elif 'const handleTaskInput = useCallback' in line and start is not None:
        # This is the second one — we want to keep this one
        break

# Now find the end of the first one (closing of useCallback)
if start is not None:
    depth = 0
    for i in range(start, len(lines)):
        for ch in lines[i]:
            if ch == '{': depth += 1
            elif ch == '}': depth -= 1
        if depth == 0 and i > start:
            end = i
            break

print(f"Removing original handleTaskInput: lines {start+1} to {end+1}")
print("First line:", lines[start].strip())
print("Last line:", lines[end].strip())

# Remove those lines
output = lines[:start] + lines[end+1:]

with open('src/App.jsx', 'w') as f:
    f.writelines(output)

print("Done")
