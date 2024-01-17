let metronomeInterval;
let isRunning = false;
let mediaRecorder;
let audioChunks = [];
let audioBlob;
let audioUrl;
let audio;
let clickSound = new Audio('click.mp3'); // Load the click sound

document.getElementById('startStop').addEventListener('click', function() {
    if (isRunning) {
        stopMetronome();
        this.textContent = 'Start Metronome';
    } else {
        startMetronome();
        this.textContent = 'Stop Metronome';
    }
    isRunning = !isRunning;
});

document.getElementById('record').addEventListener('click', function() {
    if (this.textContent === 'Start Recording') {
        startRecording();
        this.textContent = 'Stop Recording';
        document.getElementById('playRecording').disabled = true;
    } else {
        stopRecording();
        this.textContent = 'Start Recording';
    }
});

document.getElementById('playRecording').addEventListener('click', function() {
    if (audio) {
        audio.play();
    }
});

let tapTimes = [];

document.getElementById('tapTempo').addEventListener('click', function() {
    const currentTime = Date.now();
    tapTimes.push(currentTime);

    if (tapTimes.length > 4) {
        tapTimes.shift(); // Remove the oldest time
    }

    if (tapTimes.length === 4) {
        const intervals = [
            tapTimes[1] - tapTimes[0],
            tapTimes[2] - tapTimes[1],
            tapTimes[3] - tapTimes[2]
        ];
        const averageInterval = intervals.reduce((a, b) => a + b) / intervals.length;
        const bpm = Math.round(60000 / averageInterval); // Convert to beats per minute and round to nearest whole number
        document.getElementById('tempo').value = bpm;
        if (isRunning) {
            stopMetronome();
            startMetronome();
        }
    }
});
function startMetronome() {
    const bpm = document.getElementById('tempo').value;
    const interval = 60000 / bpm;
    metronomeInterval = setInterval(() => {
        clickSound.play(); // Play the click sound
    }, interval);
}

function stopMetronome() {
    clearInterval(metronomeInterval);
}

document.getElementById('tempo').addEventListener('input', function() {
    if (isRunning) {
        stopMetronome();
        startMetronome();
    }
});

async function startRecording() {
    audioChunks = [];
    const stream = await navigator.mediaDevices.getUserMedia({ audio: { 
        channels: 2, 
        autoGainControl: true, 
        echoCancellation: false, 
        noiseSuppression: false 
    } });
    mediaRecorder = new MediaRecorder(stream);
    mediaRecorder.ondataavailable = event => {
        audioChunks.push(event.data);
    };
    mediaRecorder.onstop = () => {
        audioBlob = new Blob(audioChunks, { type: 'audio/mp3' });
        audioUrl = URL.createObjectURL(audioBlob);
        audio = new Audio(audioUrl);
        document.getElementById('playRecording').disabled = false;
        addAudioFileToUI(audioUrl);
    };
    mediaRecorder.start();
}

function stopRecording() {
    mediaRecorder.stop();
    stopMetronome();
}

function addAudioFileToUI(audioUrl) {
    const audioContainer = document.getElementById('audioContainer');
    const liElement = document.createElement('li');
    const nameElement = document.createElement('span');
    nameElement.textContent = document.getElementById('tempo').value + ' ' +  prompt('Enter a name for the recording');
    const audioElement = document.createElement('audio');
    audioElement.src = audioUrl;
    audioElement.controls = true;
    liElement.appendChild(nameElement);
    liElement.appendChild(audioElement);
    audioContainer.insertBefore(liElement, audioContainer.firstChild);
}