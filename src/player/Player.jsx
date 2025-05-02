import React, { useState, useRef, useEffect } from "react";
import "./Player.css";
import { videoList } from "../Constant/videos";

const Player = () => {
  const [currentVideo, setCurrentVideo] = useState(null);
  const [seekValue, setSeekValue] = useState(0);
  const [views, setViews] = useState({});
  const [watchedRanges, setWatchedRanges] = useState([]);
  const [progress, setProgress] = useState(0);
  const videoRef = useRef(null);
  const lastTimeRef = useRef(null);

  const mergeRanges = (ranges) => {
    if (ranges.length === 0) return [];
    ranges.sort((a, b) => a.start - b.start);
    const merged = [ranges[0]];
    for (let i = 1; i < ranges.length; i++) {
      const last = merged[merged.length - 1];
      const curr = ranges[i];
      if (curr.start <= last.end) {
        last.end = Math.max(last.end, curr.end);
      } else {
        merged.push(curr);
      }
    }
    return merged;
  };

  const getWatchedDuration = (ranges) =>
    ranges.reduce((sum, r) => sum + (r.end - r.start), 0);

  const saveWatchedRanges = (videoId, ranges) => {
    const stored = JSON.parse(localStorage.getItem("videoWatchData")) || {};
    stored[videoId] = ranges;
    localStorage.setItem("videoWatchData", JSON.stringify(stored));
  };

  const loadWatchedRanges = (videoId) => {
    const stored = JSON.parse(localStorage.getItem("videoWatchData")) || {};
    return stored[videoId] || [];
  };

  const handleTimeUpdate = () => {
    const video = videoRef.current;
    if (!video) return;

    const currentTime = video.currentTime;
    const duration = video.duration;
    setSeekValue(currentTime);

    localStorage.setItem("video_id", currentVideo);
    localStorage.setItem("currentTime", currentTime);

    const lastTime = lastTimeRef.current;

    const SKIP_THRESHOLD = 2;

    if (
      lastTime === null ||
      Math.abs(currentTime - lastTime) > SKIP_THRESHOLD ||
      currentTime < lastTime
    ) {
      lastTimeRef.current = currentTime;
      return;
    }

    const newSegment = {
      start: Math.min(lastTime, currentTime),
      end: Math.max(lastTime, currentTime),
    };

    const updatedRanges = mergeRanges([...watchedRanges, newSegment]);
    setWatchedRanges(updatedRanges);
    saveWatchedRanges(currentVideo, updatedRanges);

    const watchedTime = getWatchedDuration(updatedRanges);
    setProgress(((watchedTime / duration) * 100).toFixed(2));

    if (watchedTime / duration >= 0.9 && !views[currentVideo]) {
      const updatedViews = { ...views, [currentVideo]: true };
      setViews(updatedViews);
      localStorage.setItem("viewedVideos", JSON.stringify(updatedViews));
    }

    lastTimeRef.current = currentTime;
  };

  useEffect(() => {
    if (videoRef.current && currentVideo) {
      const savedVideo = localStorage.getItem("video_id");
      const savedTime = parseFloat(localStorage.getItem("currentTime"));
      const savedRanges = loadWatchedRanges(currentVideo);
      setWatchedRanges(savedRanges);

      const videoElement = videoRef.current;
      const handleLoadedMetadata = () => {
        if (savedVideo === currentVideo && !isNaN(savedTime)) {
          videoElement.currentTime = savedTime;
        }

        const watchedTime = getWatchedDuration(savedRanges);
        setProgress(((watchedTime / videoElement.duration) * 100).toFixed(2));
      };

      videoElement.addEventListener("loadedmetadata", handleLoadedMetadata);
      return () =>
        videoElement.removeEventListener(
          "loadedmetadata",
          handleLoadedMetadata
        );
    }

    lastTimeRef.current = null;
  }, [currentVideo]);

  useEffect(() => {
    const viewed = JSON.parse(localStorage.getItem("viewedVideos")) || {};
    setViews(viewed);
  }, []);

  return (
    <div className="player">
      <div className="list-view">
        {videoList.map((video, id) => (
          <div
            className="player-card"
            key={id}
            onClick={() => {
              if (videoRef.current) {
                videoRef.current.pause();
                videoRef.current.currentTime = 0;
              }
              lastTimeRef.current = null;
              setCurrentVideo(video?.videoUrl);
            }}
          >
            <img
              width={50}
              height={50}
              src={video?.thumbnailUrl}
              alt={video?.id}
            />
            <p className="title">{video?.title}</p>
            <p className="view-status">
              {views[video.videoUrl] && "✅ Viewed"}
            </p>
          </div>
        ))}
      </div>

      <div className="video-area">
        {currentVideo && (
          <div>
            <video
              key={currentVideo}
              ref={videoRef}
              width={720}
              height={480}
              controls
              onTimeUpdate={handleTimeUpdate}
              onPlay={() => {
                lastTimeRef.current = videoRef.current?.currentTime || 0;
              }}
              onPause={() => {
                lastTimeRef.current = null;
              }}
            >
              <source src={currentVideo} type="video/mp4" />
            </video>

            <p>Final Views</p>
            {/* <p>Seek Value: {seekValue.toFixed(2)} seconds</p> */}
            <div className="progress-bar">
              <div
                className="progress-fill"
                style={{
                  border: "1px solid black",
                  width: `${progress}%`,
                  height: "10px",
                  background: "green",
                }}
              />
            </div>
            <p>Progress: {progress}%</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Player;
