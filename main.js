const form = document.getElementById('form');
const input = document.getElementById('input');
const amp_slider = document.getElementById('amp-slider');
const color_picker1 = document.getElementById('color1');
const color_picker2 = document.getElementById('color2');
var started = false;
var interval = null;

var x = 0;
var y = 0;
var amplitude = 40;
var freq = 10;
var canvas = document.getElementById("canvas");
var ctx = canvas.getContext("2d");
var width = ctx.canvas.width;
var height = ctx.canvas.height;

var timepernote = 0;
var length = 0;

notenames = new Map();
notenames.set("C", 261.6);
notenames.set("D", 293.7);
notenames.set("E", 329.6);
notenames.set("F", 349.2);
notenames.set("G", 392.0);
notenames.set("A", 440);
notenames.set("B", 493.9);

// create web audio api context
const audioCtx = new AudioContext();
const gainNode = audioCtx.createGain();

// create Oscillator node
const oscillator = audioCtx.createOscillator();
oscillator.connect(gainNode);
gainNode.connect(audioCtx.destination);
oscillator.type = "sine";
gainNode.gain.setValueAtTime(0, audioCtx.currentTime)

function frequency(pitch) {
    freq = pitch / 10000;
    if (started) {
        gainNode.gain.setValueAtTime(100, audioCtx.currentTime);
        oscillator.frequency.setValueAtTime(pitch, audioCtx.currentTime); // value in hertz
        gainNode.gain.setValueAtTime(0, audioCtx.currentTime + ((timepernote/1000)-0.1));

        input.value = "";
    } else {
        oscillator.start();
        gainNode.gain.setValueAtTime(100, audioCtx.currentTime);
        oscillator.frequency.setValueAtTime(pitch, audioCtx.currentTime); // value in hertz
        gainNode.gain.setValueAtTime(0, audioCtx.currentTime + ((timepernote/1000)-0.1));

        input.value = "";
        started = true;
    }
}

function handle() {
    reset = true;
    var usernotes = String(input.value);
    var noteslist = [];
    timepernote = (6000 / usernotes.length);
    length = usernotes.length;

    for (i = 0; i < usernotes.length; i++) {
        noteslist.push(notenames.get(usernotes.charAt(i)));
    }
     
    let j = 0;
    repeat = setInterval(() => {
        if (j < noteslist.length) {
            console.log("I've hit" + parseInt(noteslist[j]));
            frequency(parseInt(noteslist[j]));
            drawWave();
        j++
        } else {
            console.log("I'm clearing repeat");
            clearInterval(repeat)
        }

    }, timepernote)
}

let counter = 0;
function drawWave() {
    clearInterval(interval);
    if (reset) {
        ctx.clearRect(0, 0, width, height);
        ctx.moveTo(0, height/2);
        x = 0;
        y = height/2;
        ctx.beginPath();
    }

    ctx.lineWidth = 2;
    counter = 0;
    interval = setInterval(line, 20);
    reset = false;
}

function line() {
    counter++;
    console.log("drawing " + freq);
    amplitude = amp_slider.value;
    y = height/2 + amplitude * Math.sin(x * ((2*Math.PI)/((1)/(freq*(0.5*length)))));
    //gradiant
    const gradient = ctx.createLinearGradient(20, 0, 220, 0);
        gradient.addColorStop(0, color_picker1.value);
        gradient.addColorStop(1, color_picker2.value);

    ctx.strokeStyle = gradient;
    ctx.lineTo(x, y);
    ctx.stroke();
    x = x + 1;

    if(counter > (timepernote/20)) {
        clearInterval(interval);
        console.log("I'm clearing the line");
    }
}

var RECORDING_ONGOING = false;
var recordingToggle = document.getElementById("recording-toggle"); // The button

var blob, recorder = null;
var chunks = [];

recordingToggle.addEventListener("click", function(){
    RECORDING_ONGOING = !RECORDING_ONGOING; // Start / Stop recording
    if(RECORDING_ONGOING){
        recordingToggle.innerHTML = "Stop Recording";
        startRecording(); // Start the recording
    } else {
        recordingToggle.innerHTML = "Start Recording";
        stopRecording(); // Stop screen recording
    }
});

async function startRecording(){
    const canvasStream = canvas.captureStream(30); // Frame rate of canvas
    const audioDestination = audioCtx.createMediaStreamDestination();

    // Route Web Audio to the MediaStreamDestination
    gainNode.disconnect(); // Disconnect from speakers
    gainNode.connect(audioDestination); // Connect to recording stream
    gainNode.connect(audioCtx.destination); // (Optional) Also keep audio playback

    // Combine canvas + audio
    const combinedStream = new MediaStream();
    canvasStream.getVideoTracks().forEach(track => combinedStream.addTrack(track));
    audioDestination.stream.getAudioTracks().forEach(track => combinedStream.addTrack(track));

// Create recorder
recorder = new MediaRecorder(combinedStream, { mimeType: 'video/webm' });

// Handle data
chunks  = [];
recorder.ondataavailable = e => {
  if (e.data.size > 0) {
    chunks.push(e.data);
  }
};

recorder.onstart = () => console.log("Recorder started");
recorder.onstop = () => {
    console.log("Recorder stopped");
    const blob = new Blob(chunks, { type: 'video/webm' });
    console.log("Final blob size:", blob.size);
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'recording.webm';
    a.click();
    URL.revokeObjectURL(url);
};
recorder.onerror = e => console.error("Recorder error", e);
recorder.ondataavailable = e => {
    console.log("Data available", e.data.size);
    if (e.data.size > 0) chunks.push(e.data);
};

recorder.start();
}

function stopRecording(){
    if (!recorder) return;
    recorder.stop();
}