let metronomeInterval;
let isRunning = false;
let mediaRecorder;
let audioChunks = [];
let audioBlob;
let audioUrl;
let audio;
let clickSound = new Audio('click.mp3');

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

function startMetronome() {
    const bpm = document.getElementById('tempo').value;
    const interval = 60000 / bpm;
    metronomeInterval = setInterval(() => {
        clickSound.play(); // Play the click sound
    }, interval);
}

function stopMetronome() {
    clickSound.pause();
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
        autoGainControl: false, 
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
    };
    mediaRecorder.start();
}

function stopRecording() {
    mediaRecorder.stop();
}
