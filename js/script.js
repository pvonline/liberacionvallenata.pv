
/* ------ Inicio Reloj Digital ------*/

const $tiempo = document.querySelector('.tiempo'),
$fecha = document.querySelector('.fecha');

function digitalClock(){
    let f = new Date(),
    dia = f.getDate(),
    mes = f.getMonth() + 1,
    anio = f.getFullYear(),
    diaSemana = f.getDay();

    dia = ('0' + dia).slice(-2);
    mes = ('0' + mes).slice(-2)

    let timeString = f.toLocaleTimeString();
    $tiempo.innerHTML = timeString;

    let semana = ['Domingo','Lunes','Martes','Miercoles','Jueves','Viernes','Sabado'];
    let showSemana = (semana[diaSemana]);
    $fecha.innerHTML = `${showSemana}  ${dia}-${mes}-${anio}`
}
setInterval(() => {
    digitalClock()
}, 1000);
/* ------ Final Reloj Digital -------*/




/*----- inicio Reproductor webSim.AI -------*/


document.addEventListener('DOMContentLoaded', function() {
    const audioElement = document.getElementById('audio-element');
    const playBtn = document.querySelector('.play-btn');
    const volumeSlider = document.querySelector('.volume-slider');
    const metadataElement = document.querySelector('.metadata');
    let isPlaying = true;

    // Initialize audio context with high quality settings
    const AudioContext = window.AudioContext || window.webkitAudioContext;
    const audioContext = new AudioContext({
        latencyHint: 'interactive',
        sampleRate: 44100
    });

    // Create audio processing nodes
    const source = audioContext.createMediaElementSource(audioElement);
    const gainNode = audioContext.createGain();
    
    // Add a compressor to prevent distortion
    const compressor = audioContext.createDynamicsCompressor();
    compressor.threshold.value = -24;
    compressor.knee.value = 30;
    compressor.ratio.value = 12;
    compressor.attack.value = 0.003;
    compressor.release.value = 0.25;
    
    // Connect the audio nodes
    source.connect(compressor);
    compressor.connect(gainNode);
    gainNode.connect(audioContext.destination);
    
    // Initialize audio properties
    audioElement.defaultMuted = false;
    audioElement.muted = false;
    audioElement.volume = 0.70;
    audioElement.preload = "auto";
    audioElement.crossOrigin = "anonymous";
    audioElement.autoplay = true;

    // Function to force play audio
    async function forcePlayAudio() {
        try {
            if (audioContext.state === 'suspended') {
                await audioContext.resume();
            }
            
            audioElement.currentTime = 0;
            audioElement.muted = false;
            
            gainNode.gain.value = volumeSlider.value / 100;
            
            const playPromise = audioElement.play();
            
            if (playPromise !== undefined) {
                await playPromise;
                isPlaying = true;
                updatePlayButton();
                metadataElement.textContent = 'Playing...';
            }
        } catch (error) {
            console.error('Playback failed:', error);
            setTimeout(forcePlayAudio, 1000);
        }
    }

    // Initialize audio function
    async function initializeAudio() {
        try {
            await audioContext.resume();
            await forcePlayAudio();
        } catch (error) {
            console.error('Initial autoplay failed:', error);
            setTimeout(initializeAudio, 1000);
        }
    }

    // Start playback immediately
    initializeAudio();

    // Volume control through gain node
    volumeSlider.addEventListener('input', (e) => {
        const value = e.target.value / 100;
        gainNode.gain.setValueAtTime(value, audioContext.currentTime);
    });

    // Update play button UI
    function updatePlayButton() {
        playBtn.innerHTML = isPlaying ? 
            '<svg width="26" height="26" viewBox="0 0 24 24" fill="white"><path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z"/></svg>' :
            '<svg width="26" height="26" viewBox="0 0 24 24" fill="white"><path d="M8 5v14l11-7z"/></svg>';
    }

    // Handle play button clicks with improved error handling
    playBtn.addEventListener('click', async () => {
        if (audioElement.paused) {
            await forcePlayAudio();
        } else {
            audioElement.pause();
            isPlaying = false;
            updatePlayButton();
        }
    });

    // Improved error handling for stream issues
    audioElement.addEventListener('error', async (e) => {
        console.error('Audio stream error:', e);
        metadataElement.textContent = 'Reconnecting...';
        
        // Reset audio nodes
        source.disconnect();
        gainNode.disconnect();
        compressor.disconnect();
        
        // Reconnect nodes
        source.connect(compressor);
        compressor.connect(gainNode);
        gainNode.connect(audioContext.destination);
        
        // Reload and retry
        audioElement.load();
        await forcePlayAudio();
    });
});

/*----- final Reproductor webSim.AI -------*/

