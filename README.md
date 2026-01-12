# Office Party DJ �

**Tired of arguing over who controls the AUX?** Let democracy decide! 

This is a collaborative music voting app where **everyone** gets a say in what plays next. Perfect for office parties, gatherings, or anywhere you want the crowd to curate the vibe.

## 🎯 What Does This Do?

- **🔍 Search Songs**: Anyone can search for music using the **Piped API** (YouTube's privacy-friendly alternative)
- **➕ Add to Queue**: Found a banger? Add it to the shared queue
- **👍 Vote System**: Anonymous users can vote for their favorite songs — most votes plays next!
- **🎛️ Admin DJ Mode**: The admin controls the player, skips songs, and manages the queue
- **🎶 Built-in Player**: Powered by YouTube's iframe API, plays directly in the browser
- **🔐 Anonymous Voting**: Uses device fingerprinting to prevent spam votes (no login required!)
- **⚡ Real-time Updates**: Firebase keeps everyone's queue synced in real-time

## 📋 Prerequisites

Before you begin, ensure you have the following installed:
- **Node.js** (v16 or higher)
- **npm** or **yarn** package manager

## 🛠️ Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/poojan-solanki/office-party.git
   cd office-party
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Configure Firebase**
   - Create a Firebase project at [Firebase Console](https://console.firebase.google.com/)
   - Update the Firebase configuration in `src/firebase.js` with your project credentials

## 🏃‍♂️ Running the Application

### Development Mode
Start the development server with hot module replacement:
```bash
npm run dev
```
The application will be available at `http://localhost:5173`

### Production Build
Create an optimized production build:
```bash
npm run build
```

### Preview Production Build
Preview the production build locally:
```bash
npm run preview
```

## 📝 Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start development server |
| `npm run build` | Build for production |
| `npm run preview` | Preview production build |
| `npm run lint` | Run ESLint for code quality |

## 🏗️ Project Structure

```
office-party/
├── src/
│   ├── App.jsx          # Main application component
│   ├── App.css          # Application styles
│   ├── main.jsx         # Application entry point
│   ├── firebase.js      # Firebase configuration
│   └── assets/          # Static assets
├── public/              # Public static files
├── dist/                # Production build output
├── .firebase/           # Firebase deployment config
└── package.json         # Project dependencies
```

## 🔧 Tech Stack

- **Frontend**: React 19.2.0
- **Build Tool**: Vite 7.2.4
- **Styling**: TailwindCSS 4.1.18
- **Backend**: Firebase 12.7.0
- **Icons**: Lucide React
- **Security**: FingerprintJS 5.0.1

## 🚢 Deployment

This project is configured for Firebase Hosting. To deploy:

1. **Install Firebase CLI** (if not already installed)
   ```bash
   npm install -g firebase-tools
   ```

2. **Login to Firebase**
   ```bash
   firebase login
   ```

3. **Deploy**
   ```bash
   npm run build
   firebase deploy
   ```


## 🤝 Contributing

This is a fun project. If you have suggestions or improvements, feel free to reach out or contribute!

---

**Made with ❤️ using React + Vite**
