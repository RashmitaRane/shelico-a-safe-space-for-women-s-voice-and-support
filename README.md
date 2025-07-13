Shelico – A Safe Space for Women’s Voice and Support
Shelico – A digital platform for women to access health education, support, and a community where they can speak freely, ask questions, and find help without judgment.

1. Introduction
In many communities, women’s health topics remain surrounded by misinformation, stigma, and lack of access to support.
Shelico is built to challenge that. It’s a web-based platform that allows women to bust myths, ask sensitive health questions,
find verified helpline contacts, and share real, personal health stories—all in one safe and supportive environment.

2. Project Description
What Does the Application Do?
Shelico enables users to:
-Learn the truth behind common women's health myths through flip-card interactions.
-Ask public or private health queries, which are addressed by admins (e.g., medical professionals or community moderators).
-Search and call emergency helplines by location and concern type (mental health, pregnancy, etc.).
-Share personal health stories that inspire and inform others.
-Admins manage myth cards, queries, helpline listings, and monitor stories.

3. Key Features
-Health Myth Cards: Interactive flip cards to debunk myths with verified facts.
-Ask a Health Query:Public or private mode.
-Responses from admins.
-Emergency Helpline Support:Filter by city/state and concern.Click-to-call interface.
-Storyboard:Users post text-based health stories.Admin moderation tools available.
-Authentication System:OTP email verification.Password reset functionality.
-Admin Dashboard:Manage all user submissions and platform content.

4. Technologies Used
-Frontend	HTML, CSS, JavaScript
-Backend	Python (Flask Framework)
-Database	MySQL
-Email Service	Python smtplib + Gmail SMTP
-Dev Tools	Visual Studio Code (Windows)
-Deployment	Local setup (currently)

5. Why These Technologies?
-Flask is a lightweight Python web framework that simplifies backend development and REST API integration.
-MySQL is robust, fast, and easy to use for structured relational data like users, queries, and stories.
-HTML/CSS/JS offers full control over UI/UX for a responsive and clean frontend.
-Python’s smtplib handles OTP and password-reset emails without external libraries.
-VS Code provides a rich development experience with Git, debugging, and Flask support.

6. Challenges Faced
-Implementing OTP-based verification securely without using external services like Twilio.
-Handling role-based access (users vs admins) across routes and data operations.
-Building flexible visibility options for queries (private vs public).
-Coordinating MySQL joins across complex tables like health_queries, users, responses, and admin.
-Designing a seamless and accessible frontend experience for non-tech users.

7. Future Enhancements
-Add live chat or video consultation with certified health professionals.
-Make the platform mobile-responsive or convert into a PWA.
-Add real-time notifications (e.g., when an admin replies to a query).
-Enable story likes, comments, and follow features.

