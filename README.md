# ft_transcendence
Full-stack project @ Hive Helsinki

### Core Microservices
1. **User Management Service**
    - Users can securely subscribe to the website.
    - Registered users can securely log in.
    - Users can select a unique display name to participate in tournaments.
    - Users can update their information.
    - 🔥 Remote authentication with Google Sign-In:
      - Integrate the authentication system, allowing users to securely sign in.
      - Obtain the necessary credentials and permissions from the authority to enable secure login.
      - Implement user-friendly login and authorization flows that adhere to best practices and security standards.
      - Ensure the secure exchange of authentication tokens and user information between the web application and the authentication provider.
2. **Social Service**: manages friendships, blocking list and presence status.
    - Users can add others as friends and view their online status.
4. **Stats and History Service**: is responsible for tracking, calculating, and storing game-related data such as
win/loss records, rankings, leaderboards, and player performance metrics.
    - Each user has a Match History including 1v1 games, dates, and relevant details, accessible to logged-in users
5. **Media Service**
    - Handle user upload of avatar, with a default option if none is provided.
    - Enforce size limitations and validate file types.
    - Serve images via CDN.
    - Malware scanning.
