# **App Name**: Duet

## Core Features:

- User Authentication: Implement login using email/password or anonymous login through Firebase Auth.
- Real-time Chat: Enable real-time text chat between two users using Firestore.
- Chat UI: Display messages in a clean, visually distinct chat bubble design. Provides for user recognition of who wrote each message.
- Video Call: Enable video calls between two users using WebRTC.  Uses Firestore for call setup and signalling to establish the call. This part of the application functions as a tool in mediating the video connection.
- AI Summary: Summarize the last 10 messages using Firebase Studio AI SDK or Gemini Integration (a tool to enhance chat understanding).
- Dark/Light Mode Toggle: Allow users to toggle between dark and light themes.

## Style Guidelines:

- Primary color: Deep Indigo (#663399) for a calm and intimate feel.
- Background color: Very light Lavender (#F0F0F8) to ensure comfortable readability in a light scheme. A dark scheme with this hue darkened will also be supported via toggle control.
- Accent color: Soft Teal (#339966) to create a clear visual distinction, ensure readability of functional elements, and hint to themes of togetherness/sharing.
- Body font: 'PT Sans', a humanist sans-serif, used for the main text to combine modern look and approachability.
- Headline font: 'Playfair', a modern serif used for headlines and titles, to create elegance in contrast with the main body font.
- Code font: 'Source Code Pro' for displaying configuration code.
- Simple, outlined icons for a clean and modern look.
- Subtle animations for message bubbles and transitions.