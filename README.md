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

### Modular Monolith Architecture (MMA)
