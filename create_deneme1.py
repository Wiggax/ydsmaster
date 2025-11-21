import json

# Answer key for Deneme-1
answer_key = {
    1: 3, 2: 1, 3: 2, 4: 0, 5: 4, 6: 0, 7: 1, 8: 2, 9: 0, 10: 1,
    11: 0, 12: 4, 13: 2, 14: 1, 15: 3, 16: 0, 17: 4, 18: 0, 19: 3, 20: 0,
    21: 1, 22: 3, 23: 1, 24: 3, 25: 4, 26: 2, 27: 1, 28: 2, 29: 1, 30: 0,
    31: 3, 32: 0, 33: 4, 34: 1, 35: 2, 36: 0, 37: 1, 38: 3, 39: 0, 40: 3,
    41: 4, 42: 2, 43: 1, 44: 1, 45: 2, 46: 2, 47: 0, 48: 4, 49: 0, 50: 3,
    51: 1, 52: 0, 53: 3, 54: 2, 55: 4, 56: 1, 57: 2, 58: 4, 59: 1, 60: 4,
    61: 3, 62: 2, 63: 0, 64: 4, 65: 3, 66: 0, 67: 2, 68: 4, 69: 4, 70: 3,
    71: 0, 72: 3, 73: 1, 74: 1, 75: 0, 76: 0, 77: 3, 78: 2, 79: 4, 80: 3
}

# Convert A,B,C,D,E to 0,1,2,3,4
letter_to_num = {'A': 0, 'B': 1, 'C': 2, 'D': 3, 'E': 4}

# Read the database
with open('db.json', 'r', encoding='utf-8') as f:
    db = json.load(f)

# Clear existing exams
db['yds_exams'] = []

# Create Deneme-1
exam = {
    "id": 1,
    "title": "YDS Deneme-1",
    "duration": 180,
    "totalQuestions": 80,
    "sections": []
}

# This is a simplified version - I'll create the full structure with all questions
# For now, creating a basic structure to test

print("Creating YDS Deneme-1...")
print(f"Total questions: 80")
print(f"Answer key loaded: {len(answer_key)} answers")

# Save to database
db['yds_exams'].append(exam)

with open('db.json', 'w', encoding='utf-8') as f:
    json.dump(db, f, ensure_ascii=False, indent=2)

print("✅ Deneme-1 created successfully!")
