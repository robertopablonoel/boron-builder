#!/bin/bash

echo "🧪 Testing Chat API..."
echo ""

# Check health endpoint
echo "1️⃣  Health Check:"
curl http://localhost:3000/api/chat
echo -e "\n"

# Test basic funnel generation
echo "2️⃣  Generate Funnel:"
curl -X POST http://localhost:3000/api/chat \
  -H "Content-Type: application/json" \
  -d '{
    "message": "Make a funnel for organic sleep gummies with melatonin and chamomile",
    "conversationHistory": []
  }' | jq '.funnel.name, .funnel.blocks | length'
echo ""

# Test iteration
echo "3️⃣  Iterate Funnel (add banner):"
curl -X POST http://localhost:3000/api/chat \
  -H "Content-Type: application/json" \
  -d '{
    "message": "Add an urgency banner at the top",
    "conversationHistory": [
      {
        "id": "1",
        "role": "user",
        "content": "Make a funnel for sleep gummies",
        "timestamp": 1234567890
      }
    ],
    "currentFunnel": {
      "id": "550e8400-e29b-41d4-a716-446655440000",
      "name": "Test",
      "product": {"title": "Test", "description": "Test", "price": 10, "currency": "USD"},
      "blocks": [{"id": "cta-1", "type": "AddToCartButton", "props": {"text": "Buy", "link": "#", "variant": "primary", "size": "lg"}}]
    }
  }' | jq '.funnel.blocks[0].type'
echo ""

echo "✅ API tests complete!"
