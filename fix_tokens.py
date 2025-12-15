import json
import re

with open('postman/collections/Integration Testing.postman_collection.json', 'r', encoding='utf-8') as f:
    content = f.read()

# Replace Bearer tokens in headers
content = re.sub(
    r'"value": "Bearer eyJ[^"]+",',
    '"value": "Bearer {{admin_token}}",',
    content
)

# Replace tokens in bearer auth
content = re.sub(
    r'"value": "eyJ[^"]+",\s*"type": "string"',
    '"value": "{{admin_token}}",\n                      "type": "string"',
    content
)

with open('postman/collections/Integration Testing.postman_collection.json', 'w', encoding='utf-8') as f:
    f.write(content)

print("✅ Replaced all hardcoded tokens with {{admin_token}}")

# Verify JSON is still valid
with open('postman/collections/Integration Testing.postman_collection.json', 'r', encoding='utf-8') as f:
    json.load(f)
print("✅ JSON is still valid")
