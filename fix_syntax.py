with open('index.html', 'r', encoding='utf-8') as f:
    lines = f.readlines()

# We need to delete the dangling chunk that starts around line 8953
# Let's find the exact indices
start_idx = -1
end_idx = -1

for i, line in enumerate(lines):
    if "if (neetBatch) setActivePracticeBatch(neetBatch);" in line and "};" not in line:
        # Check if previous line is `};` which marks the end of our new getTourSteps
        if i > 0 and "};" in lines[i-1]:
            start_idx = i
    if start_idx != -1 and "const [tourStep, setTourStep] = React.useState" in line:
        end_idx = i
        break

if start_idx != -1 and end_idx != -1:
    del lines[start_idx:end_idx]
    with open('index.html', 'w', encoding='utf-8') as f:
        f.writelines(lines)
    print(f"Deleted lines from {start_idx} to {end_idx-1} to fix Syntax Error.")
else:
    print("Could not find exact block bounds.", start_idx, end_idx)
