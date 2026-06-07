with open('src/App.jsx', 'r') as f:
    content = f.read()

# Remove the modal JSX block entirely
import re

# Remove the showPlanLimitModal modal block
modal_pattern = r'\{showPlanLimitModal && \(.*?\)\s*\}'
content = re.sub(modal_pattern, '', content, flags=re.DOTALL)

# Remove the useState for showPlanLimitModal
content = content.replace('const [showPlanLimitModal, setShowPlanLimitModal] = useState(false)\n', '')
content = content.replace("const [showPlanLimitModal, setShowPlanLimitModal] = useState(false)\r\n", '')

with open('src/App.jsx', 'w') as f:
    f.write(content)

# Verify it's gone
if 'showPlanLimitModal' in content:
    remaining = [i+1 for i, line in enumerate(content.split('\n')) if 'showPlanLimitModal' in line]
    print(f"Still found on lines: {remaining}")
else:
    print("Clean - showPlanLimitModal fully removed")
