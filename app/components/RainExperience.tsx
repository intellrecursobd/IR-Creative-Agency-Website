"use client";

import type { CSSProperties } from "react";
import { useEffect, useRef, useState } from "react";

const MUSIC_LOOP_START = 3;
const passingDrops = [
  { left: 8, size: 19, duration: 11.8, delay: -2.4, drift: 18 },
  { left: 23, size: 28, duration: 14.2, delay: -9.1, drift: -24 },
  { left: 41, size: 16, duration: 10.6, delay: -5.7, drift: 31 },
  { left: 59, size: 24, duration: 13.1, delay: -12.2, drift: -19 },
  { left: 76, size: 31, duration: 15.4, delay: -7.5, drift: 23 },
  { left: 91, size: 18, duration: 12.4, delay: -10.8, drift: -28 },
];
const rainDrops = [
  { left: 3, length: 42, duration: 1.8, delay: -0.4, drift: 21, opacity: 0.36 },
  { left: 12, length: 58, duration: 2.4, delay: -1.7, drift: 29, opacity: 0.24 },
  { left: 21, length: 36, duration: 1.65, delay: -0.9, drift: 18, opacity: 0.32 },
  { left: 33, length: 52, duration: 2.15, delay: -2.1, drift: 25, opacity: 0.27 },
  { left: 44, length: 31, duration: 1.55, delay: -0.2, drift: 16, opacity: 0.31 },
  { left: 55, length: 64, duration: 2.7, delay: -1.3, drift: 34, opacity: 0.2 },
  { left: 64, length: 39, duration: 1.9, delay: -2.5, drift: 20, opacity: 0.34 },
  { left: 73, length: 48, duration: 2.25, delay: -0.7, drift: 26, opacity: 0.25 },
  { left: 82, length: 34, duration: 1.7, delay: -1.9, drift: 17, opacity: 0.3 },
  { left: 94, length: 55, duration: 2.5, delay: -1.1, drift: 30, opacity: 0.22 },
];

export default function RainExperience() {
  const audioRef = useRef<HTMLAudioElement>(null);
  const introVolumeTimerRef = useRef<number | null>(null);
  const [entered, setEntered] = useState(false);
  const [playing, setPlaying] = useState(false);
  const [blocked, setBlocked] = useState(false);
  const [sequenceKey, setSequenceKey] = useState(0);

  useEffect(() => {
    const audio = audioRef.current;
    if (audio) audio.volume = 0.72;

    return () => {
      if (introVolumeTimerRef.current !== null) {
        window.clearTimeout(introVolumeTimerRef.current);
      }
      audio?.pause();
      delete document.documentElement.dataset.eclipseSound;
    };
  }, []);

  const enterExperience = async (withSound: boolean) => {
    const audio = audioRef.current;
    setEntered(true);
    setSequenceKey((key) => key + 1);

    if (!audio) return;

    audio.currentTime = withSound ? 0 : MUSIC_LOOP_START;
    if (!withSound) {
      document.documentElement.dataset.eclipseSound = "off";
      return;
    }

    try {
      audio.volume = 0.24;
      await audio.play();
      introVolumeTimerRef.current = window.setTimeout(() => {
        audio.volume = 0.72;
      }, MUSIC_LOOP_START * 1000);
      setBlocked(false);
    } catch {
      setBlocked(true);
      setPlaying(false);
    }
  };

  const loopMusicWithoutSplash = async () => {
    const audio = audioRef.current;
    if (!audio) return;

    audio.currentTime = MUSIC_LOOP_START;
    try {
      await audio.play();
      setBlocked(false);
    } catch {
      setBlocked(true);
      setPlaying(false);
    }
  };

  const toggleSound = async () => {
    const audio = audioRef.current;
    if (!audio) return;

    if (!audio.paused) {
      audio.pause();
      return;
    }

    if (audio.ended || audio.currentTime < MUSIC_LOOP_START) {
      audio.currentTime = MUSIC_LOOP_START;
    }

    try {
      await audio.play();
      setBlocked(false);
    } catch {
      setBlocked(true);
      setPlaying(false);
    }
  };

  return (
    <div className={`rain-experience${entered ? " is-entered" : ""}`}>
      <audio
        ref={audioRef}
        src="/eclipse-404-clean-entry.mp3"
        preload="auto"
        onPlay={() => {
          setPlaying(true);
          document.documentElement.dataset.eclipseSound = "on";
        }}
        onPause={() => {
          setPlaying(false);
          document.documentElement.dataset.eclipseSound = "off";
        }}
        onEnded={loopMusicWithoutSplash}
      />

      <div className="entry-gate" role="dialog" aria-modal="true" aria-label="Enter Eclipse 404">
        <div className="entry-gate-panel">
          <p>Eclipse 404 // Signal active</p>
          <h2 className="welcome-title" aria-label="Welcome to Eclipse 404">
            <span>Welcome to</span>
            <strong data-text="Eclipse 404">Eclipse 404</strong>
          </h2>
          <div className="entry-tagline">
            <span>The location is hidden,</span>
            <span>the frequency is not.</span>
          </div>
          <button type="button" onClick={() => enterExperience(true)}>
            Enter Eclipse 404 <b aria-hidden="true">↗</b>
          </button>
          <button className="enter-muted" type="button" onClick={() => enterExperience(false)}>
            Continue muted
          </button>
        </div>
      </div>

      <div className="rain-sequence" key={sequenceKey} aria-hidden="true">
        <div className="rain-impact">
          <div className="rain-impact-art" />
        </div>
        <div className="wet-glass">
          <div className="wet-glass-texture" />
          <div className="wet-glass-depth" />
        </div>
        <div className="rain-drops">
          {rainDrops.map((drop, index) => (
            <span
              className="rain-drop"
              key={index}
              style={{
                "--rain-left": `${drop.left}%`,
                "--rain-length": `${drop.length}px`,
                "--rain-duration": `${drop.duration}s`,
                "--rain-delay": `${drop.delay}s`,
                "--rain-drift": `${drop.drift}px`,
                "--rain-opacity": drop.opacity,
              } as CSSProperties}
            />
          ))}
        </div>
        <div className="passing-drops">
          {passingDrops.map((drop, index) => (
            <span
              className="passing-drop"
              key={index}
              style={{
                "--drop-left": `${drop.left}%`,
                "--drop-size": `${drop.size}px`,
                "--drop-duration": `${drop.duration}s`,
                "--drop-delay": `${drop.delay}s`,
                "--drop-drift": `${drop.drift}px`,
                "--drop-return": `${drop.drift * -0.35}px`,
              } as CSSProperties}
            />
          ))}
        </div>
      </div>

      <div className="sound-control">
        <button
          className="sound-toggle"
          type="button"
          aria-pressed={playing}
          aria-label={playing ? "Pause Eclipse 404 soundtrack" : "Play Eclipse 404 soundtrack"}
          onClick={toggleSound}
        >
          <span className="sound-bars" aria-hidden="true">
            <i />
            <i />
            <i />
            <i />
          </span>
          <span>{playing ? "Dark signal // On" : blocked ? "Tap again for sound" : "Sound // Off"}</span>
        </button>
      </div>
    </div>
  );
}
