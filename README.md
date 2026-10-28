Coaching Hub

A coaching marketplace prototype that helps learners choose coaches they can trust. Its main idea is a Trust Score for every coach, built from verifiable signals instead of self-reported ratings.

Live demo: coaching-hub-beta.vercel.app

Built as a prototype for the TalentLync Full Stack Intern Drive candidate exercise.

Features
Trust Score: a weighted score for each coach, made up of:
ID verification
Certificates
Sessions completed
Verified outcomes
Dispute history
Trust Ledger: a view that shows how a coach's score was earned
Escrow-conditional payments: payment is held and released only when conditions are met
Guest access: browse coaches without logging in
Tech stack
React and TypeScript
Vite
Tailwind CSS
Oxlint
Deployed on Vercel
Getting started
bash
git clone https://github.com/sadiya37790/CoachingHub.git
cd CoachingHub
npm install
npm run dev

Build for production:

bash
npm run build
Project structure
CoachingHub/
├── public/        # Static assets
├── src/           # React + TypeScript source
├── index.html
├── vite.config.ts
└── package.json
Why a Trust Score?

Star ratings are easy to inflate and say little about reliability. This prototype weights evidence a learner can rely on, such as verified identity, completed sessions and few disputes. It also ties payment to outcomes through escrow, so learners are protected.

Limitations
Prototype only: data is demo data, and there is no real payment processing
Trust Score weights are illustrative and not tuned on real data
Roadmap
Real authentication and a backend database
Integration with a payments provider for escrow
Dispute workflow and coach onboarding verification
Author

Shaik Sadiya, LinkedIn
