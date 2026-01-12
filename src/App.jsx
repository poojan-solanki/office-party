import React, { useState, useEffect, useRef } from 'react';
import { Music, ThumbsUp, Search, Play, Pause, SkipForward, Volume2, X, Clock, Shield, Users, LogOut, ArrowLeft } from 'lucide-react';
import './firebase.js';
import FingerprintJS from '@fingerprintjs/fingerprintjs';

// Landing Page Component
function LandingPage({ onSelectMode }) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-600 via-pink-500 to-red-500 flex items-center justify-center p-4">
      <div className="max-w-2xl w-full">
        <div className="bg-white/10 backdrop-blur-lg rounded-3xl p-12 shadow-2xl text-center">
          <Music className="w-20 h-20 text-white mx-auto mb-6" />
          <h1 className="text-5xl font-bold text-white mb-4">Office Party DJ</h1>
          <p className="text-white/80 text-lg mb-12">Choose how you'd like to join the party</p>

          <div className="grid md:grid-cols-2 gap-6">
            <button
              onClick={() => onSelectMode('admin')}
              className="bg-gradient-to-br from-red-500 to-pink-600 hover:from-red-600 hover:to-pink-700 text-white rounded-2xl p-8 shadow-xl transform hover:scale-105 transition-all"
            >
              <Shield className="w-16 h-16 mx-auto mb-4" />
              <h2 className="text-2xl font-bold mb-2">DJ Control Panel</h2>
              <p className="text-white/90 text-sm">Take control of the music</p>
            </button>

            <button
              onClick={() => onSelectMode('user')}
              className="bg-gradient-to-br from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white rounded-2xl p-8 shadow-xl transform hover:scale-105 transition-all"
            >
              <Users className="w-16 h-16 mx-auto mb-4" />
              <h2 className="text-2xl font-bold mb-2">Join the Party</h2>
              <p className="text-white/90 text-sm">Add songs & vote for favorites</p>
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
    if (username === 'poojan_s_' && password === 'p01052004') {
      onLogin();
    } else {
      setError('Invalid credentials! Try again.');
      setTimeout(() => setError(''), 3000);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-600 via-pink-500 to-red-500 flex items-center justify-center p-4">
      <div className="max-w-md w-full">
        <div className="bg-white/10 backdrop-blur-lg rounded-3xl p-8 shadow-2xl">
          <button
            onClick={onBack}
            className="flex items-center gap-2 text-white/80 hover:text-white mb-6 transition-all"
          >
            <ArrowLeft className="w-5 h-5" />
            Back to menu
          </button>

          <div className="text-center mb-8">
            <Shield className="w-16 h-16 text-white mx-auto mb-4" />
            <h2 className="text-3xl font-bold text-white mb-2">DJ Control Access</h2>
            <p className="text-white/70 text-sm">Enter your credentials to control the music</p>
          </div>

          <div className="bg-yellow-500/20 border border-yellow-500/50 rounded-xl p-4 mb-6">
            <p className="text-yellow-100 text-sm text-center">
              ⚠️ <strong>Admin Only Zone</strong><br />
              Just here to vibe? Click below to join as a guest!
            </p>
          </div>

          <form onSubmit={handleLogin} className="space-y-4 mb-4">
            <div>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="Username"
                className="w-full px-4 py-3 bg-white/20 border border-white/30 rounded-xl text-white placeholder-white/60 focus:outline-none focus:ring-2 focus:ring-white/50"
              />
            </div>
            <div>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Password"
                className="w-full px-4 py-3 bg-white/20 border border-white/30 rounded-xl text-white placeholder-white/60 focus:outline-none focus:ring-2 focus:ring-white/50"
              />
            </div>
            {error && (
              <p className="text-red-300 text-sm text-center bg-red-500/20 py-2 rounded-lg">{error}</p>
            )}
            <button
              type="submit"
              className="w-full py-3 bg-white text-purple-600 rounded-xl font-bold hover:bg-white/90 transition-all shadow-lg"
            >
              Access DJ Panel
            </button>
          </form>

          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-white/30"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-4 bg-transparent text-white/60">OR</span>
            </div>
          </div>

          <button
            onClick={onSwitchToUser}
            className="w-full py-3 bg-blue-500/30 hover:bg-blue-500/40 text-white rounded-xl font-bold transition-all border border-blue-400/50"
          >
            <div className="flex items-center justify-center gap-2">
              <Users className="w-5 h-5" />
              Join as Guest Instead
            </div>
          </button>
        </div>
      </div>
    </div>
  );
}

// Main Music Voter Component
export default function MusicVoter() {
  const [mode, setMode] = useState(null);
  const [isAdminLoggedIn, setIsAdminLoggedIn] = useState(false);
  const [songs, setSongs] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const [currentSong, setCurrentSong] = useState(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(70);
  const playerRef = useRef(null);
  const intervalRef = useRef(null);

  const pipedInstances = [
    'https://api.piped.private.coffee',
    'https://pipedapi.kavin.rocks',
    'https://api.piped.yt',
  ];
  const [currentInstance, setCurrentInstance] = useState(0);

  // Load YouTube iframe API
  useEffect(() => {
    const tag = document.createElement('script');
    tag.src = 'https://www.youtube.com/iframe_api';
    const firstScriptTag = document.getElementsByTagName('script')[0];
    firstScriptTag.parentNode.insertBefore(tag, firstScriptTag);

    window.onYouTubeIframeAPIReady = () => {
      console.log('YouTube API Ready');
    };
  }, []);

  // Setup real-time Firebase listener
  useEffect(() => {
    loadSongs();

    // Load now playing for users
    if (mode === 'user') {
      loadNowPlaying();
    }

    const unsubscribe = window.storage.onUpdate(() => {
      console.log('🔥 Real-time update detected!');
      loadSongs();

      // Also reload now playing for users
      if (mode === 'user') {
        loadNowPlaying();
      }
    });

    return () => {
      if (unsubscribe) unsubscribe();
    };
  }, [mode]);


  useEffect(() => {
    if (songs.length > 0 && !currentSong && mode === 'admin' && isAdminLoggedIn) {
      const topSong = [...songs].sort((a, b) => b.votes - a.votes)[0];
      if (topSong) playSong(topSong);
    }
  }, [songs, currentSong, mode, isAdminLoggedIn]);

  // Update progress for users watching
  useEffect(() => {
    let progressInterval;

    if (mode === 'user' && currentSong) {
      if (currentSong.startTime) {
        // Calculate initial elapsed time
        const initialElapsed = Math.floor((Date.now() - currentSong.startTime) / 1000);
        setCurrentTime(Math.max(0, Math.min(initialElapsed, currentSong.duration || 0)));

        // Update every second
        progressInterval = setInterval(() => {
          const elapsed = Math.floor((Date.now() - currentSong.startTime) / 1000);
          const clampedTime = Math.max(0, Math.min(elapsed, currentSong.duration || 0));
          setCurrentTime(clampedTime);
        }, 1000);
      } else {
        // If no startTime, just show 0
        setCurrentTime(0);
      }
    }

    return () => {
      if (progressInterval) {
        clearInterval(progressInterval);
      }
    };
  }, [mode, currentSong]);

  // Get device ID using ip-api.com + FingerprintJS
  const getDeviceId = async () => {
    try {
      console.log('🔍 Generating device ID with ip-api.com + FingerprintJS...');

      let ip = 'unknown';

      // Get IP and location from ip-api.com
      try {
        const ipResponse = await fetch('https://api.ipify.org/?format=json', {
          cache: 'no-cache'
        });

        if (ipResponse.ok) {
          const ipData = await ipResponse.json();

          if (ipData.status === 'success') {
            ip = ipData.query; // This is the IP address: "14.194.129.238"

            console.log('🌐 IP Info:');
            console.log('  IP Address:', ipData.query);
            console.log('  Location:', `${ipData.city}, ${ipData.regionName}, ${ipData.country}`);
            console.log('  ISP:', ipData.isp);
            console.log('  Timezone:', ipData.timezone);
          } else {
            console.warn('⚠️ IP API failed');
            ip = 'blocked';
          }
        }
      } catch (ipError) {
        console.warn('⚠️ IP fetch blocked or failed:', ipError.message);
        ip = 'blocked';
      }

      // Load FingerprintJS library
      console.log('🖐️ Generating browser fingerprint...');
      const fp = await FingerprintJS.load();

      // Get the visitor identifier (unique fingerprint)
      const result = await fp.get();
      const visitorId = result.visitorId;

      console.log('🖐️ Fingerprint ID:', visitorId);
      console.log('📊 Confidence:', result.confidence.score);

      // Combine IP + FingerprintJS ID
      const deviceId = `${ip}_${visitorId}`;

      console.log('=====================================');
      console.log('🔐 FINAL DEVICE ID:', deviceId);
      console.log('=====================================');

      return deviceId;

    } catch (error) {
      console.error('❌ Failed to generate device ID:', error);
      alert('Unable to verify your device. Please try again.');
      return null;
    }
  };



  const loadSongs = async () => {
    try {
      const result = await window.storage.list('song:');
      if (result && result.keys && result.keys.length > 0) {
        const loadedSongs = await Promise.all(
          result.keys.map(async (key) => {
            const data = await window.storage.get(key);
            return data ? JSON.parse(data.value) : null;
          })
        );
        const validSongs = loadedSongs.filter(Boolean).sort((a, b) => b.votes - a.votes);
        setSongs(validSongs);
        console.log('📋 Loaded songs:', validSongs.length);
      } else {
        setSongs([]);
      }
    } catch (error) {
      console.error('Error loading songs:', error);
    }
  };

  const searchYouTube = async () => {
    if (!searchQuery.trim()) return;

    setIsSearching(true);
    let success = false;
    let instanceIndex = currentInstance;

    while (!success && instanceIndex < pipedInstances.length) {
      try {
        const query = encodeURIComponent(searchQuery + ' official audio');
        const response = await fetch(
          `${pipedInstances[instanceIndex]}/search?q=${query}&filter=music_songs`,
          { signal: AbortSignal.timeout(10000) }
        );

        if (!response.ok) throw new Error('Instance failed');

        const data = await response.json();

        const results = data.items.slice(0, 6).map(item => ({
          youtubeId: item.url.split('v=')[1] || item.url.split('/').pop(),
          title: item.title.replace(/ \((Official Audio|Official Video|Audio)\)/g, ''),
          artist: item.uploaderName,
          thumbnail: item.thumbnail,
          duration: item.duration,
          durationText: formatDuration(item.duration)
        }));

        setSearchResults(results);
        setCurrentInstance(instanceIndex);
        success = true;
      } catch (error) {
        console.error(`Instance ${instanceIndex} failed:`, error);
        instanceIndex++;
      }
    }

    if (!success) {
      alert('Search unavailable. Please try again later.');
    }

    setIsSearching(false);
  };

  const formatDuration = (seconds) => {
    if (!seconds) return '0:00';
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const addSongToQueue = async (song) => {
    const exists = songs.some(s => s.youtubeId === song.youtubeId);
    if (exists) {
      alert('This song is already in the queue!');
      return;
    }

    const songId = `song:${Date.now()}`;
    const newSong = {
      id: songId,
      ...song,
      votes: 0,
      addedAt: Date.now(),
      votedBy: []
    };

    try {
      await window.storage.set(songId, JSON.stringify(newSong));
      console.log('✅ Song added to Firebase');
      setSearchResults([]);
      setSearchQuery('');
    } catch (error) {
      console.error('Error adding song:', error);
      alert('Failed to add song. Please try again.');
    }
  };

  const voteSong = async (songId) => {
    // ALWAYS regenerate device ID (don't trust localStorage)
    const deviceId = await getDeviceId();

    if (!deviceId) {
      alert('Unable to verify your device. Please try again.');
      return;
    }

    console.log('🎯 Attempting to vote with device ID:', deviceId);

    const song = songs.find(s => s.id === songId);
    if (!song) return;

    // Check if this device already voted
    if (song.votedBy && song.votedBy.includes(deviceId)) {
      alert('⚠️ You already voted for this song from this device!');
      console.log('❌ Vote blocked - already voted');
      return;
    }

    const updatedSong = {
      ...song,
      votes: song.votes + 1,
      votedBy: [...(song.votedBy || []), deviceId]
    };

    try {
      await window.storage.set(songId, JSON.stringify(updatedSong));
      console.log('✅ Vote recorded! Device ID:', deviceId);
      console.log('📋 Total votes for this song:', updatedSong.votes);
    } catch (error) {
      console.error('❌ Error voting:', error);
      alert('Failed to vote. Please try again.');
    }
  };




  const playSong = async (song) => {
    console.log('▶️ Playing:', song.title, 'ID:', song.id);
    setCurrentSong(song);

    // Store currently playing song in Firebase so all users can see it
    try {
      await window.storage.set('now_playing', JSON.stringify({
        ...song,
        startTime: Date.now()
      }));
      console.log('✅ Stored now_playing in Firebase');
    } catch (error) {
      console.error('❌ Error storing now_playing:', error);
    }

    if (playerRef.current) {
      playerRef.current.destroy();
    }

    if (intervalRef.current) {
      clearInterval(intervalRef.current);
    }

    playerRef.current = new window.YT.Player('youtube-player', {
      height: '0',
      width: '0',
      videoId: song.youtubeId,
      playerVars: {
        autoplay: 1,
        controls: 0,
      },
      events: {
        onReady: (event) => {
          console.log('Player ready');
          event.target.setVolume(volume);
          event.target.playVideo();
          setIsPlaying(true);
          setDuration(event.target.getDuration());

          intervalRef.current = setInterval(() => {
            if (playerRef.current && playerRef.current.getCurrentTime) {
              setCurrentTime(playerRef.current.getCurrentTime());
            }
          }, 500);
        },
        onStateChange: (event) => {
          if (event.data === window.YT.PlayerState.PLAYING) {
            setIsPlaying(true);
          } else if (event.data === window.YT.PlayerState.PAUSED) {
            setIsPlaying(false);
          } else if (event.data === window.YT.PlayerState.ENDED) {
            console.log('🔚 Song ended:', song.title, 'ID:', song.id);
            setIsPlaying(false);

            // Delete the finished song from Firebase
            deleteSongAndPlayNext(song.id);
          }
        },
        onError: (event) => {
          console.error('YouTube player error:', event.data);
          alert('Failed to play song. Trying next...');
          deleteSongAndPlayNext(song.id);
        }
      }
    });
  };

  const loadNowPlaying = async () => {
    try {
      const result = await window.storage.get('now_playing');
      if (result && result.value) {
        const nowPlayingSong = JSON.parse(result.value);
        setCurrentSong(nowPlayingSong);
        setDuration(nowPlayingSong.duration || 0);

        console.log('🎵 Now playing loaded:', nowPlayingSong.title);
        console.log('Start time:', nowPlayingSong.startTime);
        console.log('Duration:', nowPlayingSong.duration);
      } else {
        setCurrentSong(null);
        setCurrentTime(0);
        setDuration(0);
      }
    } catch (error) {
      console.error('Error loading now playing:', error);
    }
  };



  const deleteSongAndPlayNext = async (songId) => {
    console.log('🗑️ Attempting to delete song ID:', songId);

    try {
      // Delete from Firebase first
      await window.storage.delete(songId);
      console.log('✅ Successfully deleted song from Firebase:', songId);

      // Clear now_playing temporarily
      await window.storage.delete('now_playing');

      // Reset time states immediately to prevent UI flicker
      setCurrentTime(0);
      setDuration(0);

      // Immediately update local state by filtering out the deleted song
      setSongs(prevSongs => {
        const updatedSongs = prevSongs.filter(s => s.id !== songId);
        console.log('📋 Songs after deletion:', updatedSongs.map(s => s.title));

        // Clear current song
        setCurrentSong(null);
        setIsPlaying(false);

        // Play next song with the UPDATED list
        setTimeout(() => {
          if (updatedSongs.length > 0) {
            const nextSong = [...updatedSongs].sort((a, b) => b.votes - a.votes)[0];
            console.log('✅ Playing next:', nextSong.title);
            playSong(nextSong);
          } else {
            console.log('❌ No more songs in queue');
            setCurrentSong(null);
            setIsPlaying(false);
          }
        }, 800);

        return updatedSongs;
      });

    } catch (error) {
      console.error('❌ Error deleting song:', error);
      // Fallback: reload from Firebase
      await loadSongs();
      setTimeout(() => {
        playNextSong();
      }, 1000);
    }
  };

  const togglePlayPause = () => {
    if (!playerRef.current) return;

    if (isPlaying) {
      playerRef.current.pauseVideo();
    } else {
      playerRef.current.playVideo();
    }
  };

  const playNextSong = () => {
    console.log('🎵 playNextSong called, songs available:', songs.length);

    if (songs.length === 0) {
      console.log('❌ No more songs in queue');
      setCurrentSong(null);
      setIsPlaying(false);
      return;
    }

    // Get the most voted song
    const sortedSongs = [...songs].sort((a, b) => b.votes - a.votes);
    const nextSong = sortedSongs[0];

    console.log('✅ Playing next song:', nextSong.title, 'Votes:', nextSong.votes);
    playSong(nextSong);
  };



  const removeSong = async (songId) => {
    if (mode !== 'admin') return;

    try {
      await window.storage.delete(songId);
      console.log('✅ Song removed from Firebase');
      if (currentSong?.id === songId) {
        if (playerRef.current) {
          playerRef.current.destroy();
        }
        setCurrentSong(null);
        setIsPlaying(false);
        // Auto-play next song if available
        if (songs.length > 1) {
          const nextSong = songs.find(s => s.id !== songId);
          if (nextSong) playSong(nextSong);
        }
      }
    } catch (error) {
      console.error('Error removing song:', error);
    }
  };

  const handleSeek = (e) => {
    if (!playerRef.current || mode !== 'admin') return;
    const rect = e.currentTarget.getBoundingClientRect();
    const percent = (e.clientX - rect.left) / rect.width;
    playerRef.current.seekTo(percent * duration, true);
  };

  const handleVolumeChange = (e) => {
    if (mode !== 'admin') return;
    const newVolume = parseFloat(e.target.value);
    setVolume(newVolume);
    if (playerRef.current && playerRef.current.setVolume) {
      playerRef.current.setVolume(newVolume);
    }
  };

  const handleLogout = () => {
    setMode(null);
    setIsAdminLoggedIn(false);
    if (playerRef.current) {
      playerRef.current.destroy();
    }
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
    }
  };

  const handleSwitchToUser = () => {
    setMode('user');
  };

  const handleBackToMenu = () => {
    setMode(null);
  };

  // Filter out currently playing song from the queue display
  const queueSongs = songs.filter(song => song.id !== currentSong?.id);

  if (!mode) {
    return <LandingPage onSelectMode={setMode} />;
  }

  if (mode === 'admin' && !isAdminLoggedIn) {
    return <AdminLogin onLogin={() => setIsAdminLoggedIn(true)} onSwitchToUser={handleSwitchToUser} onBack={handleBackToMenu} />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-600 via-pink-500 to-red-500 p-2 sm:p-4">
      <div id="youtube-player" style={{ display: 'none' }}></div>

      <div className="w-full max-w-md sm:max-w-2xl md:max-w-4xl mx-auto px-2 sm:px-0">
        {/* Header */}
        <div className="bg-white/10 backdrop-blur-lg rounded-3xl p-6 mb-6 shadow-2xl">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              {mode === 'admin' ? <Shield className="w-10 h-10 text-white" /> : <Users className="w-10 h-10 text-white" />}
              <div>
                <h1 className="text-4xl font-bold text-white">Office Party DJ</h1>
                <p className="text-white/80 text-sm">
                  {mode === 'admin' ? '🎛️ DJ Control Panel • Full Access' : '🎵 Party Mode • Add & Vote for Songs'}
                </p>
              </div>
            </div>
            <button
              onClick={handleLogout}
              className="flex items-center gap-2 px-3 py-2 text-sm sm:px-4 sm:py-2 bg-white/20 hover:bg-white/30 text-white rounded-xl transition-all"
            >
              <LogOut className="w-5 h-5" />
              Exit
            </button>
          </div>
        </div>

        {/* Search Box */}
        <div className="bg-white/10 backdrop-blur-lg rounded-3xl p-6 mb-6 shadow-2xl">
          <div className="flex gap-3">
            <div className="flex-1 relative">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-white/60 w-5 h-5" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && searchYouTube()}
                placeholder="Search for a song..."
                className="w-full pl-10 sm:pl-12 pr-4 py-3 sm:py-4 bg-white/20 border border-white/30 rounded-2xl text-white placeholder-white/60 focus:outline-none focus:ring-2 focus:ring-white/50 text-sm sm:text-base"
              />

            </div>
            <button
              onClick={searchYouTube}
              disabled={isSearching}
              className="px-4 py-3 text-sm sm:px-8 sm:py-4 bg-white text-purple-600 rounded-2xl font-semibold hover:bg-white/90 disabled:opacity-50 transition-all shadow-lg"
            >
              {isSearching ? 'Searching...' : 'Search'}
            </button>
          </div>

          {searchResults.length > 0 && (
            <div className="mt-4 space-y-2">
              {searchResults.map((result, idx) => (
                <div key={idx} className="bg-white/20 rounded-xl p-4 flex gap-4 items-center">
                  <img
                    src={result.thumbnail}
                    alt={result.title}
                    className="w-16 h-16 object-cover rounded-lg"
                  />
                  <div className="flex-1">
                    <p className="text-white font-semibold text-sm">{result.title}</p>
                    <p className="text-white/70 text-xs">{result.artist}</p>
                  </div>
                  <div className="flex items-center gap-2 text-white/80 text-sm">
                    <Clock className="w-4 h-4" />
                    {result.durationText}
                  </div>
                  <button
                    onClick={() => addSongToQueue(result)}
                    className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-all font-semibold"
                  >
                    Add
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Now Playing - Admin Only with Controls */}
        {mode === 'admin' && currentSong && (
          <div className="bg-white/10 backdrop-blur-lg rounded-3xl p-6 mb-6 shadow-2xl">
            <h2 className="text-2xl font-bold text-white mb-4">🎵 Now Playing</h2>
            <div className="bg-white/20 rounded-xl p-6">
              <div className="flex items-center gap-4 mb-4">
                <img
                  src={currentSong.thumbnail}
                  alt={currentSong.title}
                  className="w-24 h-24 object-cover rounded-lg shadow-lg"
                />
                <div className="flex-1">
                  <p className="text-white font-bold text-xl">{currentSong.title}</p>
                  <p className="text-white/70">{currentSong.artist}</p>
                  <div className="flex items-center gap-2 mt-2 text-white/60 text-sm">
                    <Clock className="w-4 h-4" />
                    {currentSong.durationText}
                  </div>
                </div>
              </div>

              {/* Progress Bar */}
              <div
                className="w-full h-2 bg-white/20 rounded-full mb-2 cursor-pointer overflow-hidden"
                onClick={handleSeek}
              >
                <div
                  className="h-full bg-white rounded-full transition-all duration-500 ease-linear"
                  style={{
                    width: `${duration && currentTime <= duration ? (currentTime / duration) * 100 : 0}%`,
                    maxWidth: '100%'
                  }}
                />
              </div>

              <div className="flex justify-between text-white/60 text-xs mb-4">
                <span>{formatDuration(Math.floor(currentTime))}</span>
                <span>{formatDuration(Math.floor(duration))}</span>
              </div>

              <div className="flex flex-col sm:flex-row sm:items-center gap-3">
                <button
                  onClick={togglePlayPause}
                  className="w-full sm:w-auto px-6 py-3 bg-white text-purple-600 rounded-xl font-semibold hover:bg-white/90 flex items-center justify-center gap-2 shadow-lg"
                >
                  {isPlaying ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5" />}
                  {isPlaying ? 'Pause' : 'Play'}
                </button>
                <button
                  onClick={() => {
                    if (currentSong) {
                      deleteSongAndPlayNext(currentSong.id);
                    }
                  }}
                  className="w-full sm:w-auto px-6 py-3 bg-white/20 text-white rounded-xl font-semibold hover:bg-white/30 flex items-center justify-center gap-2"
                >
                  <SkipForward className="w-5 h-5" />
                  Next
                </button>
                <div className="flex items-center gap-2 sm:flex-1 sm:ml-4">
                  <Volume2 className="w-5 h-5 text-white flex-shrink-0" />
                  <input
                    type="range"
                    min="0"
                    max="100"
                    step="5"
                    value={volume}
                    onChange={handleVolumeChange}
                    className="flex-1"
                  />
                </div>
              </div>



            </div>
          </div>
        )}

        {/* Currently Playing - User View (NO CONTROLS) */}
        {mode === 'user' && currentSong && (
          <div className="bg-white/10 backdrop-blur-lg rounded-3xl p-6 mb-6 shadow-2xl">
            <h2 className="text-2xl font-bold text-white mb-4">🎵 Now Playing</h2>
            <div className="bg-white/20 rounded-xl p-6">
              <div className="flex items-center gap-4 mb-4">
                <img
                  src={currentSong.thumbnail}
                  alt={currentSong.title}
                  className="w-24 h-24 object-cover rounded-lg shadow-lg"
                />
                <div className="flex-1">
                  <p className="text-white font-bold text-xl">{currentSong.title}</p>
                  <p className="text-white/70">{currentSong.artist}</p>
                  <div className="flex items-center gap-2 mt-2 text-white/60 text-sm">
                    <Clock className="w-4 h-4" />
                    {currentSong.durationText || formatDuration(currentSong.duration)}
                  </div>
                </div>
              </div>

              {/* Progress Bar - View Only (No Click)
              <div className="w-full h-2 bg-white/20 rounded-full mb-2 overflow-hidden">
                <div
                  className="h-full bg-white rounded-full transition-all duration-500 ease-linear"
                  style={{
                    width: `${currentSong.duration && currentTime >= 0 && currentTime <= currentSong.duration
                      ? (currentTime / currentSong.duration) * 100
                      : 0}%`,
                    maxWidth: '100%'
                  }}
                />
              </div> */}
              {/* <div className="flex justify-between text-white/60 text-xs">
                <span>{currentTime >= 0 ? formatDuration(Math.floor(currentTime)) : '0:00'}</span>
                <span>{currentSong.durationText || formatDuration(currentSong.duration)}</span>
              </div> */}
            </div>
          </div>
        )}




        {/* Song Queue - Excluding Currently Playing Song */}
        <div className="bg-white/10 backdrop-blur-lg rounded-3xl p-6 shadow-2xl">
          <h2 className="text-2xl font-bold text-white mb-4">🎶 Song Queue ({queueSongs.length})</h2>
          <div className="space-y-3">
            {queueSongs.length === 0 ? (
              <p className="text-white/60 text-center py-8">
                {currentSong ? 'No more songs in queue. Add more to keep the party going!' : 'No songs yet. Add one to get the party started!'}
              </p>
            ) : (
              queueSongs.map((song, idx) => (
                <div
                  key={song.id}
                  className="bg-white/20 rounded-xl transition-all"
                >
                  <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 sm:gap-4 p-3 sm:p-4">
                    {/* Left side: Song info */}
                    <div className="flex items-center gap-3 w-full sm:flex-1 min-w-0">
                      <div className="text-white/60 font-bold text-base sm:text-lg w-8 flex-shrink-0">#{idx + 1}</div>
                      <img
                        src={song.thumbnail}
                        alt={song.title}
                        className="w-12 h-12 sm:w-14 sm:h-14 object-cover rounded-lg flex-shrink-0"
                      />
                      <div className="flex-1 min-w-0">
                        <p className="text-white font-semibold text-sm sm:text-base truncate">{song.title}</p>
                        <div className="flex items-center gap-2 text-white/70 text-xs sm:text-sm">
                          <span className="truncate">{song.artist}</span>
                          <span className="flex-shrink-0">•</span>
                          <span className="flex items-center gap-1 flex-shrink-0">
                            <Clock className="w-3 h-3" />
                            {song.durationText}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Right side: Buttons */}
                    <div className="flex items-center gap-2 w-full sm:w-auto sm:flex-shrink-0">
                      <button
                        onClick={() => voteSong(song.id)}
                        className="flex items-center justify-center gap-1 px-3 py-2 text-xs sm:text-sm sm:px-5 sm:py-3 bg-white/30 hover:bg-white/40 text-white rounded-xl font-bold transition-all flex-1 sm:flex-none sm:min-w-[80px]"
                      >
                        <ThumbsUp className="w-4 h-4 sm:w-5 sm:h-5" />
                        {song.votes}
                      </button>
                      {mode === 'admin' && (
                        <button
                          onClick={() => removeSong(song.id)}
                          className="p-2 sm:p-3 bg-red-500/50 hover:bg-red-500/70 text-white rounded-xl transition-all flex-shrink-0"
                          title="Remove song"
                        >
                          <X className="w-4 h-4 sm:w-5 sm:h-5" />
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              ))


            )}
          </div>
        </div>
      </div>
    </div>
  );
}
