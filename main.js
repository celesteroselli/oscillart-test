const form = document.getElementById('form');
const input = document.getElementById('input');
const amp_slider = document.getElementById('amp-slider');
const color_picker = document.getElementById('color');
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

notenames = new Map();
notenames.set("A", 440);
notenames.set("B", 493.9);
notenames.set("C", 261.6);
notenames.set("D", 293.7);
notenames.set("E", 329.6);
notenames.set("F", 349.2);
notenames.set("G", 392.0);

// create web audio api context
const audioCtx = new AudioContext();
const gainNode = audioCtx.createGain();

// create Oscillator node
const oscillator = audioCtx.createOscillator();
oscillator.connect(gainNode);
gainNode.connect(audioCtx.destination);
oscillator.type = "square";
gainNode.gain.setValueAtTime(0, audioCtx.currentTime)

function frequency(pitch) {
    freq = pitch / 100;
    if (started) {
        gainNode.gain.setValueAtTime(100, audioCtx.currentTime);
        oscillator.frequency.setValueAtTime(pitch, audioCtx.currentTime); // value in hertz
        gainNode.gain.setValueAtTime(0, audioCtx.currentTime + 1.9);

        input.value = "";
    } else {
        oscillator.start();
        gainNode.gain.setValueAtTime(100, audioCtx.currentTime);
        oscillator.frequency.setValueAtTime(pitch, audioCtx.currentTime); // value in hertz
        gainNode.gain.setValueAtTime(0, audioCtx.currentTime + 1.9);

        input.value = "";
        started = true;
    }
}

function handle() {
    reset = true;
    var usernotes = String(input.value);
    var noteslist = [];
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

    }, 2000)
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
    y = height/2 + amplitude * Math.sin(x/freq);
    ctx.strokeStyle = color_picker.value;
    ctx.lineTo(x, y);
    ctx.stroke();
    x = x + 1;

    if(counter > 100) {
        clearInterval(interval);
        console.log("I'm clearing the line");
    }
}