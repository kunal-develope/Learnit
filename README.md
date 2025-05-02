React Smart Video Player

A feature-rich React video player app that allows users to:

- Select and play videos from a list
- Track watched time precisely (even across sessions)
- Save and restore viewing progress using localStorage
- Prevent progress increase from repeated views or skipping
- Mark videos as "Viewed" after 90% is uniquely watched

Features

✅ List of selectable videos  
✅ Play/pause individual videos  
✅ Save and resume playback time from localStorage  
✅ Detect and store uniquely watched video segments  
✅ Show accurate progress bar for each video  
✅ Prevent skipping or rewatching from inflating progress  
✅ Mark videos as "Viewed" based on real watch history  

 Technologies Used

- **React** (Functional Components & Hooks)
- **HTML5 Video API**
- **CSS** for UI styling
- **localStorage** for persistent viewing data



 Project Structure
 
src/ ├── components/ │ └── Player.jsx # Main video player component ├── Constant/ │ └── videos.js # List of video metadata (URLs, thumbnails) ├── App.js ├── index.js └── Player.css # Styling for the player


 How It Works

- Video selection sets the active player source.
- While watching, `onTimeUpdate` tracks time.
- Time segments are stored only if watched **sequentially**, not skipped.
- Segments are merged and stored in `localStorage` as `videoWatchData`.
- When 90% of total duration is covered by unique segments, the video is marked as "Viewed".



Run Locally

Clone and run the project:

```bash
git clone https://github.com/your-username/video-player-app.git
cd video-player-app
npm install
npm start
