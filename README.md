# Location AI Agent 🌍🤖

A smart, multilingual location assistant built with Mastra and TypeScript that helps users get directions, calculate distances, and provides travel information. The agent speaks both proper English and Nigerian Pidgin, automatically mirroring the user's communication style!

Built for **HNG Internship Stage 3 Backend Task** - Integrated with Telex.im using the A2A protocol with proper JSON-RPC 2.0 implementation.

---

## 🎯 Features

- **📍 Smart Location Detection** - Automatically detects user location based on IP address
- **🗺️ Turn-by-Turn Directions** - Get directions from any location to any destination
- **📏 Accurate Distance Calculation** - Uses Haversine formula for precise distance in kilometers
- **⏱️ Travel Time Estimation** - Provides both driving and walking time estimates
- **🔗 Google Maps Integration** - Direct navigation links for seamless map access
- **💡 Context-Aware Safety Tips** - Offers relevant travel advice based on distance and conditions
- **🗣️ Bilingual Communication** - Responds in English or Nigerian Pidgin based on user's language
- **🎭 Tone Matching** - Adapts formality level to match user's communication style
- **🔌 A2A Protocol Integration** - Full JSON-RPC 2.0 compliant communication

---

## 🛠️ Technology Stack

| Component | Technology |
|-----------|-----------|
| **Framework** | Mastra (TypeScript) |
| **AI Model** | Google Gemini 1.5 Flash |
| **Geocoding API** | OpenStreetMap Nominatim (Free) |
| **Geolocation API** | ip-api.com (Free) |
| **Protocol** | A2A (Agent-to-Agent) with JSON-RPC 2.0 |
| **Deployment** | Vercel |
| **Observability** | Mastra Cloud |
| **Integration** | Telex.im |

---

## 📁 Project Structure
```
location-ai-agent/
├── src/
│   └── mastra/
│       ├── agents/
│       │   └── location-agent.ts          # Main agent with instructions
│       ├── tools/
│       │   └── location-tool.ts           # Location detection & direction tools
│       ├── routes/
│       │   └── a2a-agent-route.ts         # A2A protocol router (JSON-RPC 2.0)
│       └── index.ts                       # Mastra configuration
├── telex-location-workflow.json           # Telex integration config
├── .env                                   # Environment variables
├── package.json                           # Dependencies
└── README.md                              # Documentation
```

---

## 🚀 Installation & Setup

### Prerequisites
- Node.js (v18 or higher)
- npm or yarn
- Google Gemini API key
- Mastra Cloud account

### Step 1: Clone the Repository
```bash
git clone https://github.com/YOUR_USERNAME/location-ai-agent.git
cd location-ai-agent
```

### Step 2: Install Dependencies
```bash
npm install
```

### Step 3: Set Up Environment Variables
Create a `.env` file in the root directory:
```env
GOOGLE_GENERATIVE_AI_API_KEY=your_gemini_api_key_here
MASTRA_CLOUD_ACCESS_TOKEN=your_mastra_cloud_token_here
```

### Step 4: Run Development Server
```bash
npx mastra dev
```

The agent will be available at `http://localhost:4111`

---

## 💬 Usage Examples

### Example 1: Formal English Interaction
```
👤 User: Hello, I need directions to Lekki Phase 1

🤖 Agent: Hello! I can help you with that. Where are you coming from?

👤 User: I'm at Ikeja

🤖 Agent: 
📍 JOURNEY DETAILS

From: Ikeja, Lagos State, Nigeria
To: Lekki Phase 1, Lagos State, Nigeria

📏 Distance: 23.45 km
🚗 Drive: 28 minutes
🚶 Walk: 4 hours 41 minutes

🗺️ NAVIGATION
https://www.google.com/maps/dir/?api=1&origin=Ikeja&destination=Lekki&travelmode=driving

💡 TIP: Check your fuel level and drive safely

Safe travels! 🚗
```

### Example 2: Nigerian Pidgin Interaction
```
👤 User: guy, how far

🤖 Agent: I dey kampe oo! Wetin I fit do for you?

👤 User: abeg, I wan comot from Yaba go Surulere

🤖 Agent:
📍 TRIP GIST

You dey: Yaba, Lagos State, Nigeria
You dey go: Surulere, Lagos State, Nigeria

📏 Distance: 5.8 km
🚗 If you drive: 7 minutes
🚶 If you waka: 1 hour 10 minutes

🗺️ MAP LINK
https://www.google.com/maps/dir/?api=1&origin=Yaba&destination=Surulere&travelmode=driving

💡 TIP: Short trip - stay alert and follow traffic rules

Journey mercy! 🚗
```

### Example 3: Auto Location Detection
```
👤 User: what is my current location?

🤖 Agent:
📍 YOUR CURRENT LOCATION

Address: Lagos, Lagos State, Nigeria
Coordinates: 6.5244, 3.3792

(Detected automatically based on your IP address)
```

---

## 🔧 Agent Architecture

### Agent Components

#### 1. **Location Agent** (`agents/location-agent.ts`)
The core AI agent powered by Google Gemini 1.5 Flash with custom instructions for:
- Language mirroring (English/Pidgin)
- Tone adaptation
- Context-aware responses
- Natural conversation flow

#### 2. **Tools** (`tools/location-tool.ts`)

**getCurrentLocationTool**
- Gets coordinates for a specific address
- Uses OpenStreetMap Nominatim API

**getAutoLocationTool**
- Automatically detects location via IP
- Fallback to Lagos, Nigeria if detection fails

**getDirectionsTool**
- Calculates distance using Haversine formula
- Estimates travel time (50 km/h driving, 5 km/h walking)
- Generates Google Maps navigation links
- Provides context-aware safety tips

#### 3. **A2A Router** (`routes/a2a-agent-route.ts`)

Custom implementation of the A2A (Agent-to-Agent) protocol using JSON-RPC 2.0 for Telex.im integration.

**Key Features:**
- ✅ Full JSON-RPC 2.0 compliance
- ✅ Message format conversion (A2A ↔ Mastra)
- ✅ Error handling with standard error codes
- ✅ Conversation history tracking
- ✅ Artifact management
- ✅ Tool result handling

**Route:** `/a2a/agent/:agentId`

**Implementation Highlights:**
```typescript
import { registerApiRoute } from '@mastra/core/server';

export const a2aAgentRoute = registerApiRoute('/a2a/agent/:agentId', {
  method: 'POST',
  handler: async (c) => {
    // Parse JSON-RPC 2.0 request
    const { jsonrpc, id, method, params } = await c.req.json();
    
    // Validate format
    if (jsonrpc !== '2.0' || !id) {
      return errorResponse(-32600, 'Invalid Request');
    }
    
    // Convert A2A messages to Mastra format
    const mastraMessages = convertToMastraFormat(params.messages);
    
    // Execute agent
    const response = await agent.generate(mastraMessages);
    
    // Return A2A-compliant response
    return a2aResponse(id, response);
  }
});
```

---

## 🔌 A2A Protocol Integration

### JSON-RPC 2.0 Request Format
```json
{
  "jsonrpc": "2.0",
  "id": "unique-request-id",
  "method": "invoke",
  "params": {
    "message": {
      "role": "user",
      "messageId": "msg-123",
      "parts": [
        {
          "kind": "text",
          "text": "directions from Ikeja to Lekki"
        }
      ]
    },
    "taskId": "task-456",
    "contextId": "context-789"
  }
}
```

### JSON-RPC 2.0 Response Format
```json
{
  "jsonrpc": "2.0",
  "id": "unique-request-id",
  "result": {
    "id": "task-456",
    "contextId": "context-789",
    "status": {
      "state": "completed",
      "timestamp": "2025-11-03T12:00:00Z",
      "message": {
        "messageId": "msg-124",
        "role": "agent",
        "parts": [
          {
            "kind": "text",
            "text": "📍 JOURNEY DETAILS\n\nFrom: Ikeja...",
          }
        ],
        "kind": "message"
      }
    },
    "artifacts": [
      {
        "artifactId": "artifact-001",
        "name": "locationAgentResponse",
        "parts": [
          {
            "kind": "text",
            "text": "Full response text..."
          }
        ]
      }
    ],
    "history": [...],
    "kind": "task"
  }
}
```

### Error Codes

| Code | Meaning | Description |
|------|---------|-------------|
| -32600 | Invalid Request | Missing `jsonrpc` or `id` field |
| -32602 | Invalid Params | Agent not found or invalid parameters |
| -32603 | Internal Error | Server-side error during execution |

### Message Conversion

The A2A router handles conversion between two message formats:

**A2A Format (Input):**
```typescript
{
  role: "user",
  parts: [
    { kind: "text", text: "Hello" },
    { kind: "data", data: {...} }
  ]
}
```

**Mastra Format (Internal):**
```typescript
{
  role: "user",
  content: "Hello\n{...data...}"
}
```

This conversion ensures seamless communication between Telex.im and the Mastra agent.

---

## 🌐 API Integration

### Telex.im Integration

**Workflow Configuration:** `telex-location-workflow.json`
```json
{
  "name": "location_agent",
  "nodes": [
    {
      "id": "location_agent_node",
      "type": "a2a/mastra-a2a-node",
      "url": "https://your-deployment.vercel.app/a2a/agent/locationAgent"
    }
  ]
}
```

**Endpoint:** `/a2a/agent/locationAgent`

**Protocol:** A2A (Agent-to-Agent) with JSON-RPC 2.0

---

## 🧮 Distance Calculation

The agent uses the **Haversine Formula** for accurate distance calculation between two geographic coordinates:
```typescript
function calculateDistance(lat1, lon1, lat2, lon2) {
  const R = 6371; // Earth's radius in km
  const dLat = toRadians(lat2 - lat1);
  const dLon = toRadians(lon2 - lon1);
  
  const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
            Math.cos(toRadians(lat1)) * Math.cos(toRadians(lat2)) *
            Math.sin(dLon / 2) * Math.sin(dLon / 2);
  
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const distance = R * c;
  
  return distance;
}
```

**Accuracy:** ±0.5% error margin for distances up to 1000km

---

## 🎨 Key Features Implementation

### 1. Language Mirroring
The agent detects the user's language style and mirrors it:
- Formal English → Formal responses
- Casual English → Casual responses
- Nigerian Pidgin → Pidgin responses

**Implementation:** AI-powered detection through carefully crafted instructions with examples.

### 2. Context-Aware Safety Tips
Safety tips adapt based on:
- Distance (short, medium, long trips)
- Travel time
- Time of day (night travel warnings)

**Example Logic:**
```typescript
if (distance > 100) {
  tips.push('Long journey - ensure vehicle is in good condition');
} else if (distance < 5) {
  tips.push('Short trip - consider walking if weather permits');
}
```

### 3. Smart Geocoding
- Handles general area names (Ikeja, Lekki, VI)
- Translates non-English location names
- Error handling with meaningful messages
- Fallback to default locations

---

## 🚢 Deployment

### Deployed On
- **Platform:** Vercel
- **Observability:** Mastra Cloud
- **Integration:** Telex.im via A2A Protocol

### Environment Variables Required
```env
GOOGLE_GENERATIVE_AI_API_KEY=your_key
MASTRA_CLOUD_ACCESS_TOKEN=your_token
```

### Deploy to Vercel
```bash
# Install Vercel CLI
npm install -g vercel

# Login
vercel login

# Deploy
vercel --prod

# Add environment variables
vercel env add GOOGLE_GENERATIVE_AI_API_KEY production
vercel env add MASTRA_CLOUD_ACCESS_TOKEN production

# Redeploy with env vars
vercel --prod
```

---

## 📊 Monitoring & Observability

The agent is connected to **Mastra Cloud** for:
- Real-time trace monitoring
- Agent interaction logs
- Performance metrics
- Error tracking
- A2A protocol debugging

**View logs at:** https://cloud.mastra.ai

**Telex logs:** `https://api.telex.im/agent-logs/{channel-id}.txt`

---

## 🧪 Testing

### Test Locally
```bash
npx mastra dev
```

### Test A2A Endpoint
```bash
curl -X POST http://localhost:4111/a2a/agent/locationAgent \
  -H "Content-Type: application/json" \
  -d '{
    "jsonrpc": "2.0",
    "id": "test-123",
    "method": "invoke",
    "params": {
      "message": {
        "role": "user",
        "parts": [{"kind": "text", "text": "hello"}]
      }
    }
  }'
```

### Test on Telex
1. Visit https://telex.im
2. Find the Location Agent
3. Send test messages:
   - "hello"
   - "what is my current location?"
   - "directions from Ikeja to Lekki"
   - "how far" (test pidgin)

---

## 🎓 What I Learned

- **AI Agent Design** - Structuring intelligent conversational agents
- **Tool Integration** - Connecting external APIs with AI agents
- **Language Processing** - Detecting and mirroring user communication styles
- **A2A Protocol** - Implementing JSON-RPC 2.0 compliant agent communication
- **Protocol Design** - Understanding message format conversion and error handling
- **TypeScript Best Practices** - Type-safe agent development
- **Deployment & DevOps** - Cloud deployment with environment management
- **API Design** - Building robust, error-tolerant APIs

---

## 🐛 Challenges & Solutions

### Challenge 1: API Rate Limits
**Problem:** Gemini 2.0 Flash had only 50 requests/day on free tier

**Solution:** Switched to Gemini 1.5 Flash with 1,500 requests/day

### Challenge 2: Language Detection
**Problem:** Needed to detect if user is speaking Pidgin or English

**Solution:** Used AI instructions to mirror user's exact language style instead of building a detector

### Challenge 3: Accurate Distance
**Problem:** Simple calculations were inaccurate

**Solution:** Implemented Haversine formula for precise geographic distance

### Challenge 4: A2A Protocol Implementation
**Problem:** Understanding and implementing JSON-RPC 2.0 format correctly

**Solution:** Built custom router with proper message conversion, error handling, and artifact management

### Challenge 5: Message Format Conversion
**Problem:** A2A uses `parts` array with `kind` fields, Mastra uses simple `content`

**Solution:** Created conversion logic to transform between formats while preserving message context

---

## 🔮 Future Enhancements

- [ ] Real-time traffic data integration
- [ ] Multi-modal transport options (bus, train, bike)
- [ ] Voice input/output support
- [ ] Historical route recommendations
- [ ] Weather-aware route suggestions
- [ ] Support for more African languages (Yoruba, Igbo, Hausa)
- [ ] Caching for frequently requested routes
- [ ] WebSocket support for real-time updates

---

## 📝 License

MIT License - Feel free to use this project for learning and development.

---

## 👨‍💻 Author

**[Your Name]**
- GitHub: [@your_username](https://github.com/your_username)
- Twitter: [@your_handle](https://twitter.com/your_handle)
- LinkedIn: [Your Name](https://linkedin.com/in/your-profile)

---

## 🙏 Acknowledgments

- **HNG Internship** - For the amazing learning opportunity and challenging task
- **Mastra Team** - For the powerful AI framework and excellent documentation
- **Telex.im** - For the A2A integration platform and protocol specification
- **OpenStreetMap** - For free, reliable geocoding services
- **Google Gemini** - For the powerful AI model

---

## 📚 Resources

- [Mastra Documentation](https://docs.mastra.ai)
- [Telex.im Documentation](https://telex.im/docs)
- [A2A Protocol Specification](https://a2a.ai)
- [Google Gemini API](https://ai.google.dev)
- [JSON-RPC 2.0 Specification](https://www.jsonrpc.org/specification)
- [HNG Internship](https://hng.tech)

---

**⭐ If you found this project helpful, please star it on GitHub!**

**💬 Questions or suggestions? Open an issue or reach out!**
