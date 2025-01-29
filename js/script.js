document.addEventListener('DOMContentLoaded', () => {
    let player;
    let loopCount = 0;
    let isLooping = false;
    let loopTimeout;
    let startSeconds = 0;
    let endSeconds = 0;

    // Initialize YouTube Player
    function initPlayer(videoId) {
        if (player) {
            player.destroy();
        }

        player = new YT.Player('videoContainer', {
            height: '100%',
            width: '100%',
            videoId: videoId,
            playerVars: {
                controls: 1,
                rel: 0
            },
            events: {
                'onReady': onPlayerReady,
                'onStateChange': onPlayerStateChange
            }
        });
    }

    function onPlayerReady(event) {
        event.target.playVideo();
    }

    function onPlayerStateChange(event) {
        if (isLooping && event.data === YT.PlayerState.ENDED) {
            event.target.seekTo(startSeconds);
        }
    }

    // Event Listeners
    document.getElementById('loadBtn').addEventListener('click', loadVideo);
    document.getElementById('startBtn').addEventListener('click', startLooping);
    document.getElementById('stopBtn').addEventListener('click', stopLooping);

    function loadVideo() {
        const url = document.getElementById('ytUrl').value;
        const videoId = extractVideoId(url);
        
        if (!videoId) {
            showError('Invalid YouTube URL');
            return;
        }
        
        try {
            initPlayer(videoId);
            showSuccess('Video loaded successfully!');
        } catch (error) {
            showError('Error loading video');
            console.error(error);
        }
    }

    function extractVideoId(url) {
        const patterns = [
            /^.*(youtu\.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/,
            /^.*(youtube.com\/shorts\/)([^#\&\?]*).*/,
            /^.*(youtube.com\/live\/)([^#\&\?]*).*/
        ];
        
        for (const pattern of patterns) {
            const match = url.match(pattern);
            if (match && match[2].length === 11) {
                return match[2];
            }
        }
        return null;
    }

    function parseTimeToSeconds(timeString) {
        if (!timeString) return 0;
        
        const parts = timeString.split(':').reverse();
        let seconds = 0;
        
        if (parts.length > 2 || !/^\d+[:]?\d*$/.test(timeString)) {
            throw new Error('Invalid time format. Use MM:SS or SS');
        }
        
        if (parts.length >= 1) seconds += parseInt(parts[0]) || 0;
        if (parts.length >= 2) seconds += parseInt(parts[1]) * 60 || 0;
        
        return seconds;
    }

    function startLooping() {
        try {
            if (!player || !player.getCurrentTime) {
                throw new Error('Please load a video first');
            }

            startSeconds = parseTimeToSeconds(document.getElementById('startTime').value);
            endSeconds = parseTimeToSeconds(document.getElementById('endTime').value);
            
            if (endSeconds <= startSeconds) {
                throw new Error('End time must be after start time');
            }

            isLooping = true;
            loopCount = 0;
            updateLoopCounter();
            player.seekTo(startSeconds);
            player.playVideo();

            // Set up interval checking
            const checkTime = () => {
                if (!isLooping) return;
                
                const currentTime = player.getCurrentTime();
                if (currentTime >= endSeconds) {
                    loopCount++;
                    updateLoopCounter();
                    player.seekTo(startSeconds);
                }
                loopTimeout = setTimeout(checkTime, 500);
            };

            checkTime();
        } catch (error) {
            showError(error.message);
        }
    }

    function stopLooping() {
        isLooping = false;
        clearTimeout(loopTimeout);
        if (player) {
            player.pauseVideo();
        }
    }

    function updateLoopCounter() {
        document.getElementById('loopCount').textContent = loopCount;
    }

    function showError(message) {
        const alert = document.createElement('div');
        alert.className = 'alert alert-danger';
        alert.textContent = message;
        document.body.appendChild(alert);
        
        setTimeout(() => alert.remove(), 3000);
    }

    function showSuccess(message) {
        const alert = document.createElement('div');
        alert.className = 'alert alert-success';
        alert.textContent = message;
        document.body.appendChild(alert);
        
        setTimeout(() => alert.remove(), 3000);
    }
});