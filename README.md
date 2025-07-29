MIT License

Copyright (c) [2025] [Hoang Tran], [Alice Li Maunumäki], [Timo Saari], [Joseph Lu], [Stella-Kwon]

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.


# ft_transcendence
Full-stack project @ Hive Helsinki

## Backend
The backend, powered by [Fastify](https://fastify.dev/), built with TypeScript, provides a robust set of features:
- User management
	- Users can securely subscribe to the website.
    - Registered users can securely log in.
    - Users can select a unique display name to participate in tournaments.
    - Users can update their profile.
	- Users can add others as friends and view their online status.
- Game management
	- win/loss records, rankings, leaderboards, and player performance metrics.
	- Each user has a Match History including 1v1 games, dates, and relevant details, accessible to logged-in users
- JWT (JSON Web Token) and HttpOnly cookies for stateless authentication.
- Simplify user sign-in through Google provider.
- Enhanced security with Two-Factor Authentication (2FA) support.
- File upload
- Real-time communication
	- WebSocket-based chat system with rooms and direct messaging
	- Real-time friend status updates and notifications
	- Live chat with message history and read receipts
	- Room management with member invitations and moderation

### Modular Monolith Architecture (MMA)