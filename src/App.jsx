import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  Music,
  ThumbsUp,
  Search,
  Play,
  Pause,
  SkipForward,
  Volume2,
  X,
  Clock,
  Shield,
  Users,
  LogOut,
  ArrowLeft,
  CheckCircle2,
  AlertCircle,
  Sparkles,
  Flame,
  Radio,
  Loader2
} from 'lucide-react';
import './firebase.js';
import FingerprintJS from '@fingerprintjs/fingerprintjs';

// Helper: Extract YouTube ID cleanly
function extractYouTubeId(urlOrStr) {
  if (!urlOrStr) return '';
  const match = urlOrStr.match(/(?:v=|\/embed\/|\/watch\?v=|\/v\/|youtu\.be\/|\/shorts\/|^)([a-zA-Z0-9_-]{11})/);
  if (match && match[1]) return match[1];
  const clean = urlOrStr.split('?')[0].split('&')[0].split('/').pop();
  return clean || urlOrStr;
}

// Helper: Format seconds to M:SS
function formatDuration(seconds) {
  if (!seconds || isNaN(seconds) || seconds < 0) return '0:00';
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins}:${secs.toString().padStart(2, '0')}`;
}

// Helper: Create song entry object
function createSongEntry(song, creatorDeviceId) {
  const ts = Date.now();
  const rand = Math.random().toString(36).substring(2, 7);
  return {
    id: `song:${ts}_${rand}`,
    ...song,
    votes: 1,
    addedAt: ts,
    votedBy: creatorDeviceId ? [creatorDeviceId] : []
  };
}

// Toast Notification Component
function Toast({ toast, onClose }) {
  if (!toast) return null;

  const bgColors = {
    success: 'bg-emerald-600/90 border-emerald-400/50 text-white',
    error: 'bg-rose-600/90 border-rose-400/50 text-white',
    warning: 'bg-amber-600/90 border-amber-400/50 text-white',
    info: 'bg-purple-600/90 border-purple-400/50 text-white'
  };

  const icons = {
    success: <CheckCircle2 className="w-5 h-5 flex-shrink-0" />,
    error: <AlertCircle className="w-5 h-5 flex-shrink-0" />,
    warning: <AlertCircle className="w-5 h-5 flex-shrink-0" />,
    info: <Sparkles className="w-5 h-5 flex-shrink-0" />
  };

  return (
    <div className="fixed bottom-6 right-6 z-50 max-w-sm w-full transition-all">
      <div
        className={`flex items-center justify-between gap-3 px-4 py-3 rounded-2xl shadow-2xl backdrop-blur-md border ${
          bgColors[toast.type || 'info']
        }`}
      >
        <div className="flex items-center gap-3">
          {icons[toast.type || 'info']}
          <p className="text-sm font-medium">{toast.message}</p>
        </div>
        <button
          onClick={onClose}
          className="text-white/70 hover:text-white transition-colors p-1"
          aria-label="Close notification"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}

// Landing Page Component
function LandingPage({ onSelectMode }) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-600 via-pink-500 to-red-500 flex items-center justify-center p-4">
      <div className="max-w-2xl w-full">
        <div className="bg-white/10 backdrop-blur-lg rounded-3xl p-8 sm:p-12 shadow-2xl text-center border border-white/20">
          <div className="relative inline-block mb-6">
            <div className="absolute inset-0 bg-white/20 rounded-full blur-xl animate-pulse"></div>
            <Music className="w-20 h-20 text-white relative z-10 mx-auto" />
          </div>
          <h1 className="text-4xl sm:text-5xl font-extrabold text-white mb-4 tracking-tight">
            Office Party DJ
          </h1>
          <p className="text-white/80 text-base sm:text-lg mb-10 max-w-md mx-auto">
            Democracy on the AUX. Add your favorite tracks and vote for what plays next!
          </p>

          <div className="grid sm:grid-cols-2 gap-6">
            <button
              onClick={() => onSelectMode('admin')}
              className="group bg-gradient-to-br from-red-500 to-pink-600 hover:from-red-600 hover:to-pink-700 text-white rounded-2xl p-6 sm:p-8 shadow-xl transform hover:-translate-y-1 hover:shadow-2xl transition-all duration-300 border border-white/20 text-left cursor-pointer"
            >
              <Shield className="w-12 h-12 mb-4 group-hover:scale-110 transition-transform" />
              <h2 className="text-2xl font-bold mb-2">DJ Control Panel</h2>
              <p className="text-white/80 text-sm">Control the player, skip songs & manage the queue</p>
            </button>

            <button
              onClick={() => onSelectMode('user')}
              className="group bg-gradient-to-br from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white rounded-2xl p-6 sm:p-8 shadow-xl transform hover:-translate-y-1 hover:shadow-2xl transition-all duration-300 border border-white/20 text-left cursor-pointer"
            >
              <Users className="w-12 h-12 mb-4 group-hover:scale-110 transition-transform" />
              <h2 className="text-2xl font-bold mb-2">Join the Party</h2>
              <p className="text-white/80 text-sm">Search tracks, queue bangers & vote for the next song</p>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// Admin Login Component
function AdminLogin({ onLogin, onSwitchToUser, onBack }) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleLogin = (e) => {
    e.preventDefault();
    const expectedUser = import.meta.env.VITE_ADMIN_USERNAME || 'poojan_s_';
    const expectedPass = import.meta.env.VITE_ADMIN_PASSWORD || 'p01052004';

    if (username === expectedUser && password === expectedPass) {
      sessionStorage.setItem('op_admin_authenticated', 'true');
      onLogin();
    } else {
      setError('Invalid credentials! Please try again.');
      setTimeout(() => setError(''), 3500);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-600 via-pink-500 to-red-500 flex items-center justify-center p-4">
      <div className="max-w-md w-full">
        <div className="bg-white/10 backdrop-blur-lg rounded-3xl p-8 shadow-2xl border border-white/20">
          <button
            onClick={onBack}
            className="flex items-center gap-2 text-white/80 hover:text-white mb-6 transition-all text-sm font-medium cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to menu
          </button>

          <div className="text-center mb-6">
            <Shield className="w-14 h-14 text-white mx-auto mb-3" />
            <h2 className="text-3xl font-bold text-white mb-1">DJ Access</h2>
            <p className="text-white/70 text-sm">Enter credentials to control playback</p>
          </div>

          <div className="bg-amber-500/20 border border-amber-400/40 rounded-xl p-3.5 mb-6">
            <p className="text-amber-100 text-xs sm:text-sm text-center">
              🔒 <strong>DJ Control Panel</strong><br />
              Just here to vote & listen? Switch to Guest mode below!
            </p>
          </div>

          <form onSubmit={handleLogin} className="space-y-4 mb-4">
            <div>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="Username"
                autoComplete="username"
                className="w-full px-4 py-3 bg-white/20 border border-white/30 rounded-xl text-white placeholder-white/60 focus:outline-none focus:ring-2 focus:ring-white/60 text-sm transition-all"
              />
            </div>
            <div>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Password"
                autoComplete="current-password"
                className="w-full px-4 py-3 bg-white/20 border border-white/30 rounded-xl text-white placeholder-white/60 focus:outline-none focus:ring-2 focus:ring-white/60 text-sm transition-all"
              />
            </div>
            {error && (
              <div className="flex items-center gap-2 text-rose-200 text-xs bg-rose-500/30 border border-rose-400/40 p-2.5 rounded-lg">
                <AlertCircle className="w-4 h-4 flex-shrink-0" />
                <span>{error}</span>
              </div>
            )}
            <button
              type="submit"
              className="w-full py-3 bg-white text-purple-700 rounded-xl font-bold hover:bg-white/90 active:scale-95 transition-all shadow-lg text-sm cursor-pointer"
            >
              Log In as DJ
            </button>
          </form>

          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-white/20"></div>
            </div>
            <div className="relative flex justify-center text-xs">
              <span className="px-3 bg-white/10 backdrop-blur-md rounded-full text-white/70">OR</span>
            </div>
          </div>

          <button
            onClick={onSwitchToUser}
            className="w-full py-3 bg-blue-500/30 hover:bg-blue-500/40 text-white rounded-xl font-semibold transition-all border border-blue-400/40 text-sm flex items-center justify-center gap-2 cursor-pointer"
          >
            <Users className="w-4 h-4" />
            Join as Guest Instead
          </button>
        </div>
      </div>
    </div>
  );
}

// Main Music Voter Component
export default function MusicVoter() {
  const [mode, setMode] = useState(null);
  const [isAdminLoggedIn, setIsAdminLoggedIn] = useState(() => {
    return sessionStorage.getItem('op_admin_authenticated') === 'true';
  });
  const [songs, setSongs] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const [currentSong, setCurrentSong] = useState(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(70);
  const [deviceId, setDeviceId] = useState(null);
  const [toast, setToast] = useState(null);

  const playerRef = useRef(null);
  const intervalRef = useRef(null);
  const deleteSongAndPlayNextRef = useRef(null);

  const showToast = useCallback((message, type = 'info') => {
    setToast({ message, type });
    const timer = setTimeout(() => setToast(null), 3500);
    return () => clearTimeout(timer);
  }, []);

  // Public Piped / Invidious Search Endpoints with Fallback
  const searchEndpoints = [
    {
      url: (q) => `https://pipedapi.leptons.xyz/search?q=${encodeURIComponent(q + ' song audio')}&filter=music_songs`,
      parse: (data) => (data?.items || []).filter(i => i.url || i.title).slice(0, 8).map(item => ({
        youtubeId: extractYouTubeId(item.url),
        title: (item.title || 'Unknown Song').replace(/ \((Official Audio|Official Video|Audio|Music Video|Lyric Video)\)/gi, '').trim(),
        artist: item.uploaderName || 'Artist',
        thumbnail: item.thumbnail || (item.thumbnails?.[0]?.url) || 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=200&h=200&fit=crop',
        duration: item.duration || 180,
        durationText: formatDuration(item.duration || 180)
      }))
    },
    {
      url: (q) => `https://api.piped.privacydev.net/search?q=${encodeURIComponent(q + ' official audio')}&filter=music_songs`,
      parse: (data) => (data?.items || []).filter(i => i.url || i.title).slice(0, 8).map(item => ({
        youtubeId: extractYouTubeId(item.url),
        title: (item.title || 'Unknown Song').replace(/ \((Official Audio|Official Video|Audio|Music Video)\)/gi, '').trim(),
        artist: item.uploaderName || 'Artist',
        thumbnail: item.thumbnail || 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=200&h=200&fit=crop',
        duration: item.duration || 180,
        durationText: formatDuration(item.duration || 180)
      }))
    },
    {
      url: (q) => `https://invidious.nerdvpn.de/api/v1/search?q=${encodeURIComponent(q + ' music')}&type=video`,
      parse: (data) => (Array.isArray(data) ? data : []).slice(0, 8).map(item => ({
        youtubeId: item.videoId || extractYouTubeId(item.videoThumbnails?.[0]?.url),
        title: (item.title || 'Unknown Song').replace(/ \((Official Audio|Official Video|Audio)\)/gi, '').trim(),
        artist: item.author || 'Artist',
        thumbnail: item.videoThumbnails?.[0]?.url || `https://i.ytimg.com/vi/${item.videoId}/hqdefault.jpg`,
        duration: item.lengthSeconds || 180,
        durationText: formatDuration(item.lengthSeconds || 180)
      }))
    }
  ];

  // Initialize YouTube Iframe API
  useEffect(() => {
    if (!window.YT) {
      const tag = document.createElement('script');
      tag.src = 'https://www.youtube.com/iframe_api';
      const firstScriptTag = document.getElementsByTagName('script')[0];
      firstScriptTag.parentNode.insertBefore(tag, firstScriptTag);
    }
  }, []);

  // Compute Device ID with IP + FingerprintJS and fallback cache
  const getDeviceId = useCallback(async () => {
    if (deviceId) return deviceId;

    try {
      let ip = 'anon';

      // Try ipify with timeout
      try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 2500);
        const ipRes = await fetch('https://api.ipify.org/?format=json', {
          cache: 'no-cache',
          signal: controller.signal
        });
        clearTimeout(timeoutId);
        if (ipRes.ok) {
          const ipData = await ipRes.json();
          if (ipData?.ip) ip = ipData.ip;
        }
      } catch {
        // Backup IP lookup
        try {
          const controller2 = new AbortController();
          const timeoutId2 = setTimeout(() => controller2.abort(), 2500);
          const ipRes2 = await fetch('https://ipapi.co/json/', {
            cache: 'no-cache',
            signal: controller2.signal
          });
          clearTimeout(timeoutId2);
          if (ipRes2.ok) {
            const ipData2 = await ipRes2.json();
            if (ipData2?.ip) ip = ipData2.ip;
          }
        } catch {
          ip = 'local';
        }
      }

      // Generate fingerprint
      let visitorId = '';
      try {
        const fp = await FingerprintJS.load();
        const result = await fp.get();
        visitorId = result.visitorId;
      } catch {
        let cached = localStorage.getItem('op_visitor_token');
        if (!cached) {
          cached = 'v_' + Math.random().toString(36).substring(2, 12);
          localStorage.setItem('op_visitor_token', cached);
        }
        visitorId = cached;
      }

      const finalId = `${ip}_${visitorId}`;
      setDeviceId(finalId);
      return finalId;
    } catch (err) {
      console.error('Device ID error:', err);
      const fallback = 'dev_' + Math.random().toString(36).substring(2, 12);
      setDeviceId(fallback);
      return fallback;
    }
  }, [deviceId]);

  // Setup Realtime Sync
  useEffect(() => {
    let isMounted = true;

    const syncData = async () => {
      if (!window.storage) return;
      try {
        const [songsRes, nowPlayingRes] = await Promise.all([
          window.storage.list('song:'),
          window.storage.get('now_playing')
        ]);

        if (songsRes?.keys?.length) {
          const loadedSongs = await Promise.all(
            songsRes.keys.map(async (key) => {
              const data = await window.storage.get(key);
              if (!data?.value) return null;
              try {
                return typeof data.value === 'object' ? data.value : JSON.parse(data.value);
              } catch {
                return null;
              }
            })
          );
          if (isMounted) {
            setSongs(loadedSongs.filter(Boolean).sort((a, b) => (b.votes || 0) - (a.votes || 0)));
          }
        } else if (isMounted) {
          setSongs([]);
        }

        if (nowPlayingRes?.value && isMounted) {
          const np = typeof nowPlayingRes.value === 'object' ? nowPlayingRes.value : JSON.parse(nowPlayingRes.value);
          setCurrentSong(np);
          setDuration(np.duration || 0);
        } else if (isMounted) {
          setCurrentSong(null);
        }
      } catch (err) {
        console.error('Sync error:', err);
      }
    };

    syncData();

    const unsubscribe = window.storage?.onUpdate?.(() => {
      syncData();
    });

    return () => {
      isMounted = false;
      if (unsubscribe) unsubscribe();
    };
  }, [mode]);

  // Guest Progress Calculation
  useEffect(() => {
    if (mode !== 'user' || !currentSong?.startTime) {
      return;
    }

    const interval = setInterval(() => {
      const elapsed = Math.floor((Date.now() - currentSong.startTime) / 1000);
      const maxDur = currentSong.duration || 0;
      setCurrentTime(maxDur > 0 ? Math.min(elapsed, maxDur) : elapsed);
    }, 1000);

    return () => clearInterval(interval);
  }, [mode, currentSong]);

  // Search function with multi-endpoint fallback
  const searchYouTube = async () => {
    if (!searchQuery.trim()) return;

    setIsSearching(true);
    let results = [];

    for (const endpoint of searchEndpoints) {
      try {
        const response = await fetch(endpoint.url(searchQuery.trim()), {
          signal: AbortSignal.timeout(6000)
        });

        if (!response.ok) continue;

        const data = await response.json();
        const parsed = endpoint.parse(data);
        if (parsed && parsed.length > 0) {
          results = parsed.filter(item => item.youtubeId);
          if (results.length > 0) break;
        }
      } catch (err) {
        console.warn('Search mirror attempt failed:', err);
      }
    }

    if (results.length > 0) {
      setSearchResults(results);
    } else {
      showToast('No tracks found or search services busy. Try a different query.', 'warning');
    }

    setIsSearching(false);
  };

  // Add song to queue
  const addSongToQueue = async (song) => {
    if (!song || !song.youtubeId) {
      showToast('Invalid track selection.', 'error');
      return;
    }

    const exists = songs.some(s => s.youtubeId === song.youtubeId);
    if (exists) {
      showToast('This track is already in the queue!', 'warning');
      return;
    }

    const currentDevId = await getDeviceId();
    const newSong = createSongEntry(song, currentDevId);

    try {
      await window.storage.set(newSong.id, JSON.stringify(newSong));
      showToast(`Added "${song.title}" to the queue!`, 'success');
      setSearchResults([]);
      setSearchQuery('');
    } catch (error) {
      console.error('Error adding song:', error);
      showToast('Failed to add song to queue.', 'error');
    }
  };

  // Vote for a song
  const voteSong = async (songId) => {
    const currentDevId = await getDeviceId();

    if (!currentDevId) {
      showToast('Unable to verify device for voting.', 'error');
      return;
    }

    const song = songs.find(s => s.id === songId);
    if (!song) return;

    if (song.votedBy && song.votedBy.includes(currentDevId)) {
      showToast('You have already voted for this track!', 'warning');
      return;
    }

    const updatedSong = {
      ...song,
      votes: (song.votes || 0) + 1,
      votedBy: [...(song.votedBy || []), currentDevId]
    };

    try {
      await window.storage.set(songId, JSON.stringify(updatedSong));
      showToast(`Voted for "${song.title}"! (+1)`, 'success');
    } catch (error) {
      console.error('Error voting:', error);
      showToast('Failed to record vote.', 'error');
    }
  };

  // Play a song in Admin DJ mode
  const playSong = useCallback(async (song) => {
    if (!song) return;
    console.log('▶️ Playing song:', song.title, song.youtubeId);

    const nowPlayingData = {
      ...song,
      startTime: Date.now()
    };

    setCurrentSong(nowPlayingData);
    setDuration(song.duration || 0);
    setCurrentTime(0);

    try {
      await window.storage.set('now_playing', JSON.stringify(nowPlayingData));
    } catch (err) {
      console.error('Error setting now_playing:', err);
    }

    if (intervalRef.current) {
      clearInterval(intervalRef.current);
    }

    // Reuse existing player if available
    if (playerRef.current && typeof playerRef.current.loadVideoById === 'function') {
      try {
        playerRef.current.loadVideoById(song.youtubeId);
        playerRef.current.setVolume(volume);
        playerRef.current.playVideo();
        setIsPlaying(true);
        return;
      } catch (err) {
        console.warn('loadVideoById failed, recreating player:', err);
      }
    }

    // Initialize new player safely
    const initPlayer = () => {
      if (!window.YT || !window.YT.Player) {
        setTimeout(initPlayer, 200);
        return;
      }

      const playerContainer = document.getElementById('youtube-player');
      if (!playerContainer) return;

      try {
        playerRef.current = new window.YT.Player('youtube-player', {
          height: '0',
          width: '0',
          videoId: song.youtubeId,
          playerVars: {
            autoplay: 1,
            controls: 0,
            playsinline: 1,
            enablejsapi: 1
          },
          events: {
            onReady: (event) => {
              event.target.setVolume(volume);
              event.target.playVideo();
              setIsPlaying(true);
              const trackDuration = event.target.getDuration();
              if (trackDuration) setDuration(trackDuration);

              intervalRef.current = setInterval(() => {
                if (playerRef.current && playerRef.current.getCurrentTime) {
                  const curr = playerRef.current.getCurrentTime();
                  setCurrentTime(curr);
                  const dur = playerRef.current.getDuration();
                  if (dur) setDuration(dur);
                }
              }, 500);
            },
            onStateChange: (event) => {
              if (event.data === window.YT.PlayerState.PLAYING) {
                setIsPlaying(true);
              } else if (event.data === window.YT.PlayerState.PAUSED) {
                setIsPlaying(false);
              } else if (event.data === window.YT.PlayerState.ENDED) {
                setIsPlaying(false);
                deleteSongAndPlayNextRef.current?.(song.id);
              }
            },
            onError: (event) => {
              console.error('YouTube player error:', event.data);
              showToast('Track playback failed, skipping to next...', 'warning');
              deleteSongAndPlayNextRef.current?.(song.id);
            }
          }
        });
      } catch (e) {
        console.error('Player instantiation error:', e);
      }
    };

    initPlayer();
  }, [volume, showToast]);

  // Delete song and advance queue
  const deleteSongAndPlayNext = useCallback(async (songId) => {
    try {
      const remainingSongs = songs.filter(s => s.id !== songId);
      const nextSong = [...remainingSongs].sort((a, b) => (b.votes || 0) - (a.votes || 0))[0] || null;

      await window.storage.delete(songId);

      if (nextSong) {
        playSong(nextSong);
      } else {
        await window.storage.delete('now_playing');
        setCurrentSong(null);
        setIsPlaying(false);
        setCurrentTime(0);
        setDuration(0);
      }
    } catch (err) {
      console.error('Error transitioning song:', err);
    }
  }, [songs, playSong]);

  // Keep ref updated
  useEffect(() => {
    deleteSongAndPlayNextRef.current = deleteSongAndPlayNext;
  }, [deleteSongAndPlayNext]);

  const togglePlayPause = () => {
    if (!playerRef.current) return;
    if (isPlaying) {
      if (typeof playerRef.current.pauseVideo === 'function') playerRef.current.pauseVideo();
      setIsPlaying(false);
    } else {
      if (typeof playerRef.current.playVideo === 'function') playerRef.current.playVideo();
      setIsPlaying(true);
    }
  };

  const handleSeek = (e) => {
    if (!playerRef.current || mode !== 'admin' || !duration) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const percent = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));
    const seekTime = percent * duration;
    if (typeof playerRef.current.seekTo === 'function') {
      playerRef.current.seekTo(seekTime, true);
      setCurrentTime(seekTime);
    }
  };

  const handleVolumeChange = (e) => {
    if (mode !== 'admin') return;
    const newVolume = parseFloat(e.target.value);
    setVolume(newVolume);
    if (playerRef.current && typeof playerRef.current.setVolume === 'function') {
      playerRef.current.setVolume(newVolume);
    }
  };

  const removeSong = async (songId) => {
    if (mode !== 'admin') return;
    try {
      await window.storage.delete(songId);
      showToast('Removed song from queue.', 'info');
      if (currentSong?.id === songId) {
        deleteSongAndPlayNext(songId);
      }
    } catch (error) {
      console.error('Error removing song:', error);
    }
  };

  const handleLogout = () => {
    setMode(null);
    setIsAdminLoggedIn(false);
    sessionStorage.removeItem('op_admin_authenticated');
    if (intervalRef.current) clearInterval(intervalRef.current);
    if (playerRef.current && typeof playerRef.current.pauseVideo === 'function') {
      playerRef.current.pauseVideo();
    }
  };

  const startPartyWithTopSong = () => {
    if (songs.length > 0) {
      const topSong = [...songs].sort((a, b) => (b.votes || 0) - (a.votes || 0))[0];
      if (topSong) playSong(topSong);
    }
  };

  const queueSongs = songs.filter(song => song.id !== currentSong?.id);

  if (!mode) {
    return <LandingPage onSelectMode={setMode} />;
  }

  if (mode === 'admin' && !isAdminLoggedIn) {
    return (
      <AdminLogin
        onLogin={() => setIsAdminLoggedIn(true)}
        onSwitchToUser={() => setMode('user')}
        onBack={() => setMode(null)}
      />
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-700 via-pink-600 to-rose-600 p-3 sm:p-6 text-white selection:bg-pink-500 selection:text-white">
      {/* Hidden YouTube Player IFrame */}
      <div id="youtube-player" className="hidden"></div>

      <Toast toast={toast} onClose={() => setToast(null)} />

      <div className="w-full max-w-3xl mx-auto space-y-6">
        {/* Header */}
        <header className="bg-white/10 backdrop-blur-xl rounded-3xl p-5 sm:p-6 shadow-2xl border border-white/20 flex items-center justify-between">
          <div className="flex items-center gap-3.5">
            <div className="p-3 bg-white/20 rounded-2xl shadow-inner backdrop-blur-sm">
              {mode === 'admin' ? (
                <Shield className="w-7 h-7 text-pink-200" />
              ) : (
                <Users className="w-7 h-7 text-purple-200" />
              )}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">Office Party DJ</h1>
                <span className="hidden sm:inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-white/20 border border-white/30 text-white/90">
                  <Radio className="w-3 h-3 text-emerald-400 animate-pulse" /> Live
                </span>
              </div>
              <p className="text-white/80 text-xs sm:text-sm font-medium">
                {mode === 'admin' ? '🎛️ DJ Control Deck • Host Access' : '🎵 Party Vibe • Add & Vote for Next Tracks'}
              </p>
            </div>
          </div>
          <button
            onClick={handleLogout}
            className="flex items-center gap-1.5 px-3.5 py-2 bg-white/15 hover:bg-white/25 active:scale-95 text-white rounded-xl transition-all text-xs sm:text-sm font-medium border border-white/20 shadow-md cursor-pointer"
          >
            <LogOut className="w-4 h-4" />
            <span>Exit</span>
          </button>
        </header>

        {/* Search Box */}
        <section className="bg-white/10 backdrop-blur-xl rounded-3xl p-5 sm:p-6 shadow-2xl border border-white/20">
          <div className="flex gap-2.5 sm:gap-3">
            <div className="flex-1 relative">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-white/60 w-5 h-5 pointer-events-none" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && searchYouTube()}
                placeholder="Search song or artist..."
                className="w-full pl-11 pr-4 py-3.5 bg-white/15 border border-white/25 rounded-2xl text-white placeholder-white/60 focus:outline-none focus:ring-2 focus:ring-pink-300 text-sm sm:text-base transition-all"
              />
            </div>
            <button
              onClick={searchYouTube}
              disabled={isSearching || !searchQuery.trim()}
              className="px-5 sm:px-7 py-3.5 bg-white text-purple-700 rounded-2xl font-bold hover:bg-white/95 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-lg text-sm flex items-center gap-2 flex-shrink-0 cursor-pointer"
            >
              {isSearching ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span className="hidden sm:inline">Searching</span>
                </>
              ) : (
                'Search'
              )}
            </button>
          </div>

          {/* Search Results List */}
          {searchResults.length > 0 && (
            <div className="mt-5 space-y-2.5 max-h-96 overflow-y-auto pr-1">
              <div className="flex items-center justify-between text-xs text-white/70 px-1">
                <span>Results for "{searchQuery}"</span>
                <button
                  onClick={() => setSearchResults([])}
                  className="hover:text-white underline text-xs cursor-pointer"
                >
                  Clear
                </button>
              </div>
              {searchResults.map((result, idx) => (
                <div
                  key={result.youtubeId || idx}
                  className="bg-white/15 hover:bg-white/20 border border-white/15 rounded-2xl p-3 sm:p-4 flex items-center gap-3.5 transition-all shadow-sm"
                >
                  <img
                    src={result.thumbnail}
                    alt={result.title}
                    className="w-14 h-14 sm:w-16 sm:h-16 object-cover rounded-xl shadow flex-shrink-0 bg-black/20"
                    onError={(e) => {
                      e.target.src = 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=200&h=200&fit=crop';
                    }}
                  />
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-sm sm:text-base truncate leading-snug">{result.title}</p>
                    <p className="text-white/70 text-xs truncate mt-0.5">{result.artist}</p>
                    <div className="flex items-center gap-1.5 text-white/60 text-xs mt-1">
                      <Clock className="w-3.5 h-3.5" />
                      <span>{result.durationText}</span>
                    </div>
                  </div>
                  <button
                    onClick={() => addSongToQueue(result)}
                    className="px-4 py-2 bg-emerald-500 hover:bg-emerald-600 active:scale-95 text-white text-xs sm:text-sm rounded-xl font-bold transition-all shadow-md flex-shrink-0 cursor-pointer"
                  >
                    + Add
                  </button>
                </div>
              ))}
            </div>
          )}
        </section>

        {/* Now Playing - Admin DJ Deck */}
        {mode === 'admin' && (
          <section className="bg-white/10 backdrop-blur-xl rounded-3xl p-5 sm:p-6 shadow-2xl border border-white/20">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl sm:text-2xl font-bold flex items-center gap-2">
                <Flame className="w-6 h-6 text-amber-300 animate-pulse" />
                <span>Now Playing Deck</span>
              </h2>
              {currentSong ? (
                <span className="px-3 py-1 bg-pink-500/40 rounded-full text-xs font-semibold border border-pink-300/40">
                  DJ Control Active
                </span>
              ) : songs.length > 0 ? (
                <button
                  onClick={startPartyWithTopSong}
                  className="px-3.5 py-1.5 bg-emerald-500 hover:bg-emerald-600 active:scale-95 text-white rounded-full text-xs font-bold transition-all shadow-md flex items-center gap-1.5 cursor-pointer"
                >
                  <Play className="w-3.5 h-3.5 fill-current" />
                  <span>Start Party (#1 Track)</span>
                </button>
              ) : null}
            </div>

            {currentSong ? (
              <div className="bg-white/15 border border-white/15 rounded-2xl p-5 sm:p-6 space-y-5">
                <div className="flex items-center gap-4">
                  <div className="relative flex-shrink-0">
                    <img
                      src={currentSong.thumbnail}
                      alt={currentSong.title}
                      className="w-20 h-20 sm:w-24 sm:h-24 object-cover rounded-2xl shadow-xl bg-black/20"
                    />
                    {isPlaying && (
                      <span className="absolute -top-1.5 -right-1.5 flex h-4 w-4">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-4 w-4 bg-emerald-500"></span>
                      </span>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-bold text-lg sm:text-xl truncate leading-tight">{currentSong.title}</h3>
                    <p className="text-white/80 text-sm truncate mt-1">{currentSong.artist}</p>
                    <div className="flex items-center gap-2 mt-2 text-white/60 text-xs">
                      <Clock className="w-3.5 h-3.5" />
                      <span>{currentSong.durationText || formatDuration(currentSong.duration)}</span>
                      <span>•</span>
                      <span className="text-pink-200 font-semibold">{currentSong.votes || 0} votes</span>
                    </div>
                  </div>
                </div>

                {/* Interactive Progress Bar */}
                <div className="space-y-1.5">
                  <div
                    className="w-full h-2.5 bg-white/20 rounded-full cursor-pointer overflow-hidden relative group"
                    onClick={handleSeek}
                    title="Click to seek"
                  >
                    <div
                      className="h-full bg-gradient-to-r from-pink-400 to-purple-400 rounded-full transition-all duration-300 ease-out"
                      style={{
                        width: `${duration > 0 ? Math.min(100, (currentTime / duration) * 100) : 0}%`
                      }}
                    />
                  </div>
                  <div className="flex justify-between text-white/70 text-xs font-mono">
                    <span>{formatDuration(currentTime)}</span>
                    <span>{formatDuration(duration)}</span>
                  </div>
                </div>

                {/* Control Actions */}
                <div className="flex flex-wrap items-center justify-between gap-4 pt-2 border-t border-white/10">
                  <div className="flex items-center gap-3">
                    <button
                      onClick={togglePlayPause}
                      className="px-5 py-2.5 bg-white text-purple-800 rounded-xl font-bold hover:bg-white/90 active:scale-95 transition-all shadow-lg flex items-center gap-2 text-sm cursor-pointer"
                    >
                      {isPlaying ? <Pause className="w-4 h-4 fill-current" /> : <Play className="w-4 h-4 fill-current" />}
                      <span>{isPlaying ? 'Pause' : 'Play'}</span>
                    </button>
                    <button
                      onClick={() => deleteSongAndPlayNext(currentSong.id)}
                      className="px-4 py-2.5 bg-white/20 hover:bg-white/30 active:scale-95 text-white rounded-xl font-semibold transition-all flex items-center gap-2 text-sm border border-white/20 cursor-pointer"
                    >
                      <SkipForward className="w-4 h-4" />
                      <span>Next Track</span>
                    </button>
                  </div>

                  <div className="flex items-center gap-2.5 flex-1 max-w-xs min-w-[160px]">
                    <Volume2 className="w-4 h-4 text-white/80 flex-shrink-0" />
                    <input
                      type="range"
                      min="0"
                      max="100"
                      step="2"
                      value={volume}
                      onChange={handleVolumeChange}
                      className="w-full accent-pink-400 h-1.5 bg-white/20 rounded-lg cursor-pointer"
                      title={`Volume: ${volume}%`}
                    />
                    <span className="text-xs text-white/70 font-mono w-8 text-right">{volume}%</span>
                  </div>
                </div>
              </div>
            ) : (
              <div className="text-center py-8 bg-white/10 border border-white/10 rounded-2xl">
                <Music className="w-12 h-12 text-white/40 mx-auto mb-3 animate-pulse" />
                <p className="text-white/80 font-medium">No track currently playing</p>
                <p className="text-white/60 text-xs mt-1">
                  {songs.length > 0
                    ? 'Click "Start Party" above to play the most-voted track!'
                    : 'Search and add tracks below to get the queue started.'}
                </p>
              </div>
            )}
          </section>
        )}

        {/* Now Playing - Guest / User View */}
        {mode === 'user' && (
          <section className="bg-white/10 backdrop-blur-xl rounded-3xl p-5 sm:p-6 shadow-2xl border border-white/20">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl sm:text-2xl font-bold flex items-center gap-2">
                <Flame className="w-6 h-6 text-amber-300 animate-pulse" />
                <span>Now Playing</span>
              </h2>
              <span className="px-3 py-1 bg-purple-500/40 rounded-full text-xs font-semibold border border-purple-300/40">
                Party Audio
              </span>
            </div>

            {currentSong ? (
              <div className="bg-white/15 border border-white/15 rounded-2xl p-5 space-y-4">
                <div className="flex items-center gap-4">
                  <div className="relative flex-shrink-0">
                    <img
                      src={currentSong.thumbnail}
                      alt={currentSong.title}
                      className="w-20 h-20 sm:w-24 sm:h-24 object-cover rounded-2xl shadow-xl bg-black/20"
                    />
                    <span className="absolute -top-1.5 -right-1.5 flex h-4 w-4">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-pink-400 opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-4 w-4 bg-pink-500"></span>
                    </span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-bold text-lg sm:text-xl truncate leading-tight">{currentSong.title}</h3>
                    <p className="text-white/80 text-sm truncate mt-1">{currentSong.artist}</p>
                    <div className="flex items-center gap-2 mt-2 text-white/60 text-xs">
                      <Clock className="w-3.5 h-3.5" />
                      <span>{currentSong.durationText || formatDuration(currentSong.duration)}</span>
                      <span>•</span>
                      <span className="text-amber-200 font-semibold">{currentSong.votes || 0} votes</span>
                    </div>
                  </div>
                </div>

                {/* Read-Only Live Progress Bar */}
                <div className="space-y-1.5 pt-2 border-t border-white/10">
                  <div className="w-full h-2 bg-white/20 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-pink-400 to-amber-300 rounded-full transition-all duration-1000 ease-linear"
                      style={{
                        width: `${duration > 0 ? Math.min(100, (currentTime / duration) * 100) : 0}%`
                      }}
                    />
                  </div>
                  <div className="flex justify-between text-white/70 text-xs font-mono">
                    <span>{formatDuration(currentTime)}</span>
                    <span>{formatDuration(duration)}</span>
                  </div>
                </div>
              </div>
            ) : (
              <div className="text-center py-8 bg-white/10 border border-white/10 rounded-2xl">
                <Music className="w-12 h-12 text-white/40 mx-auto mb-3" />
                <p className="text-white/80 font-medium">No track currently on deck</p>
                <p className="text-white/60 text-xs mt-1">Search and add tracks below to get the AUX rolling!</p>
              </div>
            )}
          </section>
        )}

        {/* Song Queue */}
        <section className="bg-white/10 backdrop-blur-xl rounded-3xl p-5 sm:p-6 shadow-2xl border border-white/20">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl sm:text-2xl font-bold flex items-center gap-2">
              <Music className="w-6 h-6 text-pink-300" />
              <span>Up Next in Queue ({queueSongs.length})</span>
            </h2>
            <span className="text-xs text-white/70 font-medium">Sorted by Votes</span>
          </div>

          {queueSongs.length === 0 ? (
            <div className="text-center py-10 bg-white/10 border border-white/10 rounded-2xl">
              <Sparkles className="w-10 h-10 text-white/40 mx-auto mb-2" />
              <p className="text-white/80 font-semibold">Queue is currently empty</p>
              <p className="text-white/60 text-xs mt-1">Search for a track above and add it to start voting!</p>
            </div>
          ) : (
            <div className="space-y-3">
              {queueSongs.map((song, idx) => {
                const isVotedByMe = deviceId && song.votedBy?.includes(deviceId);
                const rankBadges = ['👑 #1', '🥈 #2', '🥉 #3'];
                const rankText = idx < 3 ? rankBadges[idx] : `#${idx + 1}`;
                const rankColor =
                  idx === 0
                    ? 'text-amber-300'
                    : idx === 1
                    ? 'text-slate-200'
                    : idx === 2
                    ? 'text-amber-500'
                    : 'text-white/60';

                return (
                  <div
                    key={song.id}
                    className="bg-white/15 hover:bg-white/20 border border-white/15 rounded-2xl p-3.5 sm:p-4 transition-all shadow-sm"
                  >
                    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                      {/* Left: Info */}
                      <div className="flex items-center gap-3.5 min-w-0 flex-1 w-full sm:w-auto">
                        <span className={`font-extrabold text-sm sm:text-base w-12 flex-shrink-0 ${rankColor}`}>
                          {rankText}
                        </span>
                        <img
                          src={song.thumbnail}
                          alt={song.title}
                          className="w-12 h-12 sm:w-14 sm:h-14 object-cover rounded-xl shadow flex-shrink-0 bg-black/20"
                          onError={(e) => {
                            e.target.src = 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=200&h=200&fit=crop';
                          }}
                        />
                        <div className="flex-1 min-w-0">
                          <p className="font-semibold text-sm sm:text-base truncate leading-snug">{song.title}</p>
                          <div className="flex items-center gap-2 text-white/70 text-xs mt-0.5">
                            <span className="truncate">{song.artist}</span>
                            <span>•</span>
                            <span className="flex items-center gap-1 flex-shrink-0">
                              <Clock className="w-3.5 h-3.5" />
                              {song.durationText || formatDuration(song.duration)}
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Right: Actions */}
                      <div className="flex items-center gap-2 self-end sm:self-center">
                        <button
                          onClick={() => voteSong(song.id)}
                          className={`flex items-center gap-1.5 px-4 py-2 rounded-xl font-bold text-xs sm:text-sm transition-all active:scale-95 shadow-md border cursor-pointer ${
                            isVotedByMe
                              ? 'bg-pink-500/80 border-pink-300 text-white'
                              : 'bg-white/20 hover:bg-white/30 border-white/20 text-white'
                          }`}
                          title={isVotedByMe ? 'You voted for this track' : 'Vote for this track'}
                        >
                          <ThumbsUp className={`w-4 h-4 ${isVotedByMe ? 'fill-current' : ''}`} />
                          <span>{song.votes || 0}</span>
                        </button>

                        {mode === 'admin' && (
                          <button
                            onClick={() => removeSong(song.id)}
                            className="p-2.5 bg-rose-500/40 hover:bg-rose-500/60 active:scale-95 text-white rounded-xl transition-all border border-rose-400/30 cursor-pointer"
                            title="Remove track"
                            aria-label="Remove track"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </section>
      </div>
    </div>
  );
}
