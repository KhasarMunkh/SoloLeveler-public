# SoloLeveler 
#### Senior Project Mobile App
## Description 
This is a Expo App Project ...
Features should include:
- Gamified personal development & productivity scheduler
- Helps user optimize and complete weekly goals
- Daily notifications
- Gain XP and perks to customize your user
- Daily Quests & Boss Fights 
References: n/a for now

**Youtube:**
- Expo General Tutorial: https://youtu.be/vFW_TxKLyrE?si=mO0Cm7Ap3aHJsUIn


## Core Stack 
- **Backend:** Typescript, Node.js, Express, Mongoose
- **Frontend:** Expo/React, NativeWind/Tailwind
- **Database:** MongoDB, 
- **Visualization:** Exploring UI Tools 
- **Testing Tools:** Postman, Expo Go (Mobile App)
- **Deployment:** Expo Go

## Installation 
#### Requirements 
1. Node/Yarn - 'npm install -g yarn'
2. MongoDB Atlas Access
3. '.env' file for each backend and frontend folder, with MONGO_URI, API url for fetching, IP access, etc.
4. Git installed
5. Have two separate terminals, one navigated to backend, and one to frontend. Install all dependencies in the package.json folder (yarn install). Install them respectively to their backend/frontend directories. Backend includes installations like dotenv, nodemon, etc. Frontend includes react-router-dom and chakra-ui. (Do this by 'yarn i' in the console for both directories)

## Server Execution / Contributions / Editing
1. Clone the repository: (Check if you have git installed and configured first)
    - git clone 'your-repo'
    - make sure to use a branch other than main to make your edits (develop branch)
2. Backend & Frontend dependencies:
    - cd frontend 
        - npm install -g yarn
        - yarn install
        - add .env file with:
            - OPENAI_API_KEY=
            - PORT=3000
            - MONGO_URI=
            - CLERK_PUBLISHABLE_KEY=
            - CLERK_SECRET_KEY=
            - NODE_ENV=
            - SKIP_AUTH=

        - npx expo start 

    - (Backend)
        - cd backend
        - npm i
        - add .env file:
            - EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY=
            - EXPO_PUBLIC_API_URL
        - npm run dev

    - To run both concurrently, run 'npm run both' in cd backend. (Still in testing)
---------------------------------------------------------------------
*Edit everything onwards, it is a template from a previous project...*


** The rest below here is for template purposes as the project progresses. 
3. Start the server
    - add .env file in the frontend folder. Please make sure the URL is correct, based on IP, WiFi access, etc.
    - npm run both to start up both backend and frontend (Do this in backend directory).
    - Test the app on Expo Go using the QR Code
4. Templates: I included templates in each folder of backend for easier implementation
5. APIs: Every API call needs a route and controller. You can put controllers within a route but I split them for modularity. Models are only necessary to fetch certain fields in each collection, and if you plan to insert new data through this application. Test your APIs using the route in Postman / browser endpoint.
6. Queries: Are done in controllers. Make sure the route is established when you want to check the output on Postman or the browser.
8. Primary Frontend Files to edit:
    - src folder
9. Helpful Extensions:
    - ES7 React/Redux/GraphQL/React-Native snippets
    - EsLint
    - GitLab Workflow
    - HTML CSS Support
    - Material Icon Theme
    - PrettierV


## IMPORTANT FILES FOR EDITING AND DEPLOYMENT:
- **Server Startup**: backend/server.js & backend/config/db.js for MongoDB Connection
- **APIs**: backend/controllers + models + routes
    - Controllers: Fetches and queries data, and set limitations on the view of data it processes
    - Models: Establishes schema
    - Routes: Establishes the request endpoint for APIs
- **Tables & Charts**: frontend/src/datacharts
    - All the visual tables and charts - the automation table, bar charts, etc. These get called by pages to display data.
- **UI Components & Filters**: frontend/src/components
    - Side bar, Navigation bar, filters, stat cards, legends
- **Pages**: frontend/src/pages
    - Pages fetch the API calls and uses the tables.jsx files to visually display them
- **MAIN UI Structure of Frontend**: frontend/src/App.jsx
- **.env files** - these do NOT get saved when merging to main branch. These are initialized by the programmer, for confidential information such as the MongoURI, API link, etc.
- **.gitignore file** - this file ignores any files from being included in commits, such as the package.json files, .env files, etc, for confidentiality.
## Visuals 
*Add when project is at near completion*
## Support & Asking Questions
- Tasks and Wireframes found @ 
- Main developers for questions: 
    - nguyench4u@gmail.com  
    - hussainmohammadi34@gmail.com  
    - paulnguyen576@gmail.com  
    - khasar.munkherdene@gmail.com  
- Mentor: Ashis Biswas
## Roadmap 
Requirements continue to evolve as new tests scripts are executed and continuously growing.
## Authors and acknowledgment 
Developers: Hossein Mohammadi, Khasar Munkh Erdene, Chau Nguyen, Paul Nguyen
Internship Support: Video Platforms Testing - Automation Team
## License 
*N/A*
## Project status 
Status: In development
Timeline: Winter 2025 to finish
