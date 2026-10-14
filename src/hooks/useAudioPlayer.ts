import { useCallback, useEffect, useRef, useState } from 'react';

export interface AudioTrack {
  id: string;
  title: string;
  url: string;
  startTime?: number;
  endTime?: number;
}

export function useAudioPlayer() {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const segmentRef = useRef<{ start: number; end: number | null }>({ start: 0, end: null });
  const [track, setTrack] = useState<AudioTrack | null>(null);
  const [playing, setPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [speed, setSpeedState] = useState(1);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const audio = new Audio();
    audio.preload = 'metadata';
    audioRef.current = audio;
    const sync = () => {
      const { start, end } = segmentRef.current;
      if (end !== null && audio.currentTime >= end) {
        audio.pause();
        setPlaying(false);
        setCurrentTime(end - start);
        return;
      }
      setCurrentTime(Math.max(0, (audio.currentTime || 0) - start));
      setDuration(end !== null ? Math.max(0, end - start) : Number.isFinite(audio.duration) ? audio.duration : 0);
    };
    const ended = () => setPlaying(false);
    const failed = () => { setPlaying(false); setError('Lecture audio impossible.'); };
    audio.addEventListener('timeupdate', sync);
    audio.addEventListener('loadedmetadata', sync);
    audio.addEventListener('ended', ended);
    audio.addEventListener('error', failed);
    return () => {
      audio.pause();
      audio.removeEventListener('timeupdate', sync);
      audio.removeEventListener('loadedmetadata', sync);
      audio.removeEventListener('ended', ended);
      audio.removeEventListener('error', failed);
    };
  }, []);

  const play = useCallback(async (nextTrack: AudioTrack) => {
    const audio = audioRef.current;
    if (!audio) return;
    setError(null);
    if (track?.id !== nextTrack.id) {
      audio.src = nextTrack.url;
      segmentRef.current = { start: nextTrack.startTime ?? 0, end: nextTrack.endTime ?? null };
      audio.currentTime = segmentRef.current.start;
      audio.playbackRate = speed;
      setTrack(nextTrack);
    }
    try {
      await audio.play();
      setPlaying(true);
    } catch {
      setError('Le navigateur a bloqué ou n’a pas pu lire cet audio.');
      setPlaying(false);
    }
  }, [speed, track?.id]);

  const toggle = useCallback((nextTrack: AudioTrack) => {
    const audio = audioRef.current;
    if (track?.id === nextTrack.id && playing && audio) {
      audio.pause();
      setPlaying(false);
      return;
    }
    void play(nextTrack);
  }, [play, playing, track?.id]);

  const seek = useCallback((value: number) => {
    if (!audioRef.current) return;
    audioRef.current.currentTime = segmentRef.current.start + value;
    setCurrentTime(value);
  }, []);

  const setSpeed = useCallback((value: number) => {
    if (audioRef.current) audioRef.current.playbackRate = value;
    setSpeedState(value);
  }, []);

  const stop = useCallback(() => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = segmentRef.current.start;
    }
    setPlaying(false);
    setCurrentTime(0);
    setTrack(null);
  }, []);

  return { track, playing, currentTime, duration, speed, error, toggle, seek, setSpeed, stop };
}
