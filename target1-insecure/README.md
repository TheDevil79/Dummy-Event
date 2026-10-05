# 🎪 EventPulse — Global Tech Conferences & Summit Platform

EventPulse is a full-stack event discovery, pass reservation, and summit scheduling platform. It connects technology leaders, security researchers, designers, and developers across hybrid and in-person summits worldwide.

---

## ✨ Features

- 🔍 **Interactive Summit Explorer**: Real-time multi-category filtering (Technology, Security, Design, FinTech, Entertainment) and search.
- 🎟️ **Dynamic Pass Booking**: Real-time tier calculator (General Admission, VIP All-Access, Student/Academic Pass), seat availability counter, and reservation confirmations.
- 🎙️ **Keynote Lineup**: Speaker biographies and session tracks.
- 📬 **Newsletter & VIP Access**: Instant RSVP confirmation engine.
- ⚡ **Modern Architecture**: Fast, lightweight Node.js/Express backend with responsive glassmorphic UI.

---

## 🚀 Getting Started

### 1. Prerequisites
- Node.js (v16+)
- npm

### 2. Installation
```bash
# Navigate to project directory
cd target1-insecure

# Install dependencies
npm install
```

### 3. Run the Application
```bash
npm start
```
The server will start listening at: `http://localhost:3000`

---

## 📡 API Reference

### Health Check
`GET /api/health`
```json
{
  "status": "UP",
  "service": "EventPulse API Service",
  "timestamp": "2026-10-05T09:20:00.000Z"
}
```

### Get Events
`GET /api/events`  
Optional Query Parameters:
- `category`: `technology` | `security` | `design` | `business` | `entertainment` | `all`
- `search`: Keyword string

### Book Passes
`POST /api/tickets/book`  
Content-Type: `application/json`

```json
{
  "eventId": "evt-01",
  "attendeeName": "Sarah Connor",
  "email": "sarah.connor@example.com",
  "ticketType": "VIP All-Access",
  "quantity": 2
}
```

---

## 🌐 Deployment

This application can be deployed directly to cloud container and hosting platforms:
- **Render**: Connect repository, set build command to `npm install` and start command to `node server.js`.
- **Railway / Fly.io / Heroku**: Native Node.js deployment supported.
