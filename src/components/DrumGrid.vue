<template>
  <div class="DrumGrid">
    <div class="game-header">
      <div class="col-8">
        <div class="game-control col-16">
          <span>Select Track: </span>
          <select v-model="selected_beat">
            <option>test</option>
            <option v-for="beat in beats" v-bind:value="beat.id" v-bind:key="beat"> {{ beat.name }} </option>
          </select>
          <button title="Load Track" v-on:click="loadBeat">Load Track</button>
        </div>
        <div class="game-control col-16">
          <span>Track name: </span>
          <input v-model="beat_name">
          <button title="Save Track" v-on:click="saveBeat">Save Track</button>
        </div>
        <div class="game-control col-16">
          <span>Switch Mode: </span>
          <button title="Set to Play Mode" v-on:click="playMode = true" v-bind:class="{ hidden: playMode }">FREE Mode</button>
          <button title="Set to Free Mode" v-on:click="playMode = false" v-bind:class="{ hidden: !playMode }">PLAY Mode</button>
        </div>
        <span class="message" v-if="playMode">{{messages[playPhase]}}</span>
        <span v-if="playPhase > 2"> Repetitions remaining: {{repetitionsRemaining}}</span>
        <span v-if="!playMode">Practice your beats or create some new ones.</span>
      </div>
      <div class="col-8">
        <div class="col-16">
          <span>Top Score: {{totalDiff}}</span><br />
          <span>Current Score: {{totalDiff}}</span>
        </div>
        <div class="col-16">
          <textarea ref="scoreLog" readonly class="event-log"></textarea>
        </div>
      </div>
    </div>
    <div class="grid-header">
      <div class="grid-control col-1">
        <button title="Play" v-on:click="startPlayer" v-bind:class="{ hidden: playing }"><icon name="play"></icon></button>
        <button title="Stop" v-on:click="stopPlayer"  v-bind:class="{ hidden: !playing }"><icon name="stop"></icon></button>
      </div>
      <div class="grid-control col-1">
        <button title="Clear Grid" ref="clearGridBtn" id="clearGridBtn" v-on:click="clearGrid()" :disabled="playMode"><icon name="ban"></icon></button>
      </div>
      <div class="grid-control input col-4">
        <span>Number of steps: </span><input type="number" min="5" max="16" v-model="numSteps" :disabled="playMode">
      </div>
      <div class="grid-control input col-5">
        <span>Volume: </span> <input type="range" min="0" max="100" v-model="volume" class="slider" id="volume-slider">
      </div>
      <div class="grid-control input col-5">
        <span>BPM: </span> <input type="range" min="0" max="400" v-model="bpm" v-on:change="updateInterval" class="slider" id="bpm-slider" :disabled="playMode">
      </div>
    </div>
    <div class="grid-main">
      <div class="grid-sidebar">
         <template v-for="ix in tracks[0].sounds.length">
           <div class="sidebar-container" v-bind:key="ix"><span>{{tracks[0].sounds[ix-1].name}}</span></div>
         </template>
      </div>
      <div class="grid">
        <div class="step" v-for="ix1 in parseInt(numSteps)" v-bind:key="ix1">
          <template v-for="ix2 in tracks[ix1-1].sounds.length">
            <div class="track" 
                v-on:click="setTrackActive($event, tracks[ix1-1].sounds[ix2-1].name, ix1-1, ix2-1)" 
                v-bind:key="ix1,ix2" 
                v-bind:class="[tracks[ix1-1].sounds[ix2-1].name, {'active': tracks[ix1-1].sounds[ix2-1].active}]"></div>
            <div class="player" 
                v-bind:class="{'active': tracks[ix1-1].active}" 
                v-if="ix2 < tracks[ix1-1].sounds.length" 
                v-bind:key="ix2"></div>
          </template>
        </div>
      </div>
    </div>
    <div class="grid-touch">
      <div class="beatButtons">
        <template v-for="sound in tracks[0].sounds.length">
          <div class="beatButton" id="beatButton"
            v-bind:key="sound"
            v-on:click="playSound($event, tracks[0].sounds[sound-1].name)">
            {{ tracks[0].sounds[sound-1].name }}
          </div>
        </template>
      </div>
    </div>
  </div>
  
</template>

<script>

export default {
  name: 'DrumGrid',
  //mixins: [VueHowler],
  data () {
    return {
      numSteps: 7,
      tracks: [],
      playing: false,
      volume: 50,
      bpm: 100,
      bpmThreshold: 600,
      counter: 0,
      keyCodes: null,
      playingTimestamp: 0,
      pressedTimestampDiff: 0,
      totalDiff: 0,
      activeSounds: [],
      repetitions: 2,
      repetitionsRemaining: this.repetitions,
      playPhase: 0,
      playMode: false, //1 - Play Mode, 0 - Free Mode
      messages: ["Press PLAY button when ready.",
                 "Preparation phase. Listen up!",
                 "Preparation phase. Get ready to play!",
                 "Go, Go, Go, ..."],
      // API data
      user_id: 1,
      beat_name: "",
      selected_beat: 0,
      beats: [],
      currentScore: 0,
      topScore: 0,
      topScores: []
    }
  },
  methods: {
    setTrackActive: function(event, soundName, ix1, ix2) {
        //event.target.classList.toggle("active");
        if(this.playMode)
          return;

        var isActive = this.tracks[ix1].sounds[ix2].active;
        this.tracks[ix1].sounds[ix2].active = !isActive;

        this.playSound(null, soundName);
    },
    clearGrid: function() {
      this.tracks.forEach(function(track) {
        track.sounds.forEach(function(sound){
          sound.active = false;
        });
      });
      this.$refs.clearGridBtn.blur();
      this.$refs.scoreLog.value = "";   
    },
    updatePlayer: function () {},
    updateInterval: function () {
      if(this.playing)
        this.startPlayer(false)
    },
    startPlayer: function (stopPlayer=true) {

      if (stopPlayer) {
        this.$refs.scoreLog.value = "";
        this.totalDiff = 0;
        this.stopPlayer();
        if (this.playMode)
          this.playPhase++;
      } else
        clearInterval(this.updatePlayer);
      
      var bpmInterval = this.bpmThreshold-this.bpm;
      this.playing = true; //TODO: some fix for pressing too early
      var self = this;
      this.updatePlayer = setInterval(function () {
            
            var sounds = self.tracks[self.counter].sounds;
            self.tracks[self.counter].active = true;
            if (self.counter != 0) {
              self.tracks[self.counter-1].active = false;
            } else {
              self.tracks[self.numSteps-1].active = false;
            }

            self.playingTimestamp = Date.now() + bpmInterval/2; //time when sound will play

            for (var i = 0; i < sounds.length; i++) {
              if (sounds[i].active) { 
                if (self.playPhase < 2) {
                  var snd = sounds[i].name;
                  setTimeout(function() {
                    self.playSound(null, snd);
                  }, bpmInterval/2); //play sound at about half of the interval duration
                } else {
                  self.activeSounds.push(i);
                }
              }
            }

            if (self.playPhase > 2) { //end of preparations
              setTimeout(function() {                 
                  if(self.pressedTimestampDiff == 0) { //user did not press during interval
                    self.totalDiff += bpmInterval
                    self.$refs.scoreLog.value += "Missed!\\\n";
                  } else
                    self.totalDiff += Math.abs(self.pressedTimestampDiff);
                  self.pressedTimestampDiff = 0;
                  self.activeSounds = [];
              }, bpmInterval-10); //-10 to ensure execution before interval
            }
            //console.log("len " + self.activeSounds.length);
            if (self.counter >= self.numSteps-1) { //if end of grid
              self.counter = 0;
              if (self.playMode) 
                self.playPhase++;

              if (self.playPhase > 2) {
                setTimeout(function() {
                  if (self.repetitionsRemaining == 0)
                    self.stopPlayer();
                  self.repetitionsRemaining--;
                },bpmInterval-10);
              }
            } else {
              self.counter++;
            }
          
      }, bpmInterval); //goes from 200 to 600 based on bpmThreshold (TODO: might want to set BPM for each track)
    },
    stopPlayer: function () { 
      this.repetitionsRemaining = this.repetitions;
      this.counter = 0;
      this.playPhase = 0;
      this.playing = false;
      clearInterval(this.updatePlayer);
      for (var i = 0; i < this.tracks.length; i++) {
        this.tracks[i].active = false;
      }
    },
    onKeyDown: function(e) {

      var sounds = this.tracks[0].sounds;
      if (this.playMode && this.playPhase > 2) {
        if (this.pressedTimestampDiff != 0)
          return; //if pressed more than once during interval
        //console.log(this.activeSounds.length);
        var sIx = sounds.findIndex(s => s.keyCode == e.keyCode);
        if(this.activeSounds.includes(sIx)) { //TODO: currently works when AT LEAST one correct key
          this.pressedTimestampDiff = this.playingTimestamp - Date.now(); //correct key
          this.$refs.scoreLog.value += "Correct! Diff: " + this.pressedTimestampDiff + "\\\n";
        } else {
          this.pressedTimestampDiff = (this.bpmThreshold-this.bpm); //wrong key 
          this.$refs.scoreLog.value += "Wrong Key! \\\n";
        }
      }

      for(var i= 0; i < sounds.length; i++) {
        if(e.keyCode == sounds[i].keyCode){
          this.playSound(null, sounds[i].name);
        }  
      }
    },
    playSound: function(event, soundName) {
      //console.log("taped");
      var audio = new Audio("/static/sounds/" + soundName + ".wav");
      audio.volume = this.volume/100;
      audio.play();
    },
    loadBeat: function(event) {
      this.$http.get('http://drums.test/api/beats/'+this.selected_beat).then(function (response) {
        this.beat_name = response.data.name;
        this.numSteps = response.data.steps;
        this.bpm = response.data.bpm;
        this.repetitions = response.data.repeats; 
        this.tracks = JSON.parse(response.data.layout);
      });
    },
    saveBeat: function(event) {
      var beat = {
        "name":this.beat_name,
        "steps":this.numSteps,
        "bpm":this.bpm,
        "repeats":this.repetitions,
        "layout":this.tracks}

      this.$http.post('http://drums.test/api/beats', beat).then(function (response) {
        console.log(response);
      });
    },
    saveScore: function(event) {
      this.$http.get('http://drums.test/api/scores/'+this.selected_beat+'/'+this.user_id).then(function (response) {
        this.topScore = response.data;
      });

      if(this.currentScore > this.topScore) {
        // Popup: Congrats, you have a new top score!
        var score_json = '{"beat_id":'+this.selected_beat+',"user_id":'+this.user_id+',"score:"'+this.currentScore+'}';
          this.$http.post('http://drums.test/api/scores', score_json).then(function (response) {
            console.log(response);
          });
      }
    },
    getScore: function(event) {
      this.$http.get('http://drums.test/api/scores/'+this.selected_beat+'/'+this.user_id).then(function (response) {
        this.topScore = response.data;
      });
    },
    getTopScores: function(event) {
      this.$http.get('http://drums.test/api/scores/'+this.selected_beat).then(function (response) {
        this.topScores = response.data;
      });
    },
  },
  created: function() {
    this.$http.get('/static/data/keyCodes.json').then(function (response) {
      this.keyCodes = response.data;
    });

    this.$http.get('/static/data/tracks.json').then(function (response) {
      this.tracks = response.data;
    });

    this.$http.get('http://drums.test/api/beats').then(function (response) {
      this.beats = response.data;
    });
    window.addEventListener('keydown', this.onKeyDown);
    window.addEventListener('keyup', this.onKeyUp);
  }
}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->

<style scoped>
/* GENERAL */
span {
    font-family: Verdana;
    /* letter-spacing: 2px; */
    font-size: 0.80em;
    font-weight: bold;
    color: white;
}

button.hidden {
  display:none;
}

button:focus { outline:none }

.DrumGrid {
  margin:0 auto;
  padding: 10px 40px 40px 40px;

}

.grid-header, .grid-main, .grid-touch, .game-header {
  max-width:1175px;
  margin:0px auto;
  text-align:left;
}

/* 16 - column layout */
[class*="col-"] {
    float: left;
}

.col-1 {width: 6.25%;}
.col-2 {width: 12.50%;}
.col-3 {width: 18.75%;}
.col-4 {width: 25%;}
.col-5 {width: 31.25%;}
.col-6 {width: 37.50%;}
.col-7 {width: 43.75%;}
.col-8 {width: 50%;}
.col-9 {width: 56.25%;}
.col-10 {width: 62.50%;}
.col-11 {width: 68.75%;}
.col-12 {width: 75%;}
.col-13 {width: 81.25%;}
.col-14 {width: 87.50%;}
.col-15 {width: 93.75%;}
.col-16 {width: 100%;}

/* GAME HEADER */
.game-header {
  background-color: rgb(32,34,36);
  margin-bottom: 20px;
  height: 160px;
  border: 1px solid;
  box-sizing:border-box;
  padding:10px; 
}

.game-header textarea {
  resize: none;
  width: 100%;
  height: 100px;
  margin-top: 5px;
  box-sizing: border-box;
}

.game-control {
  margin-bottom:5px;
}

/* GRID */
.grid-header {
  background-color: rgb(32,34,36);
  height: 60px;
  box-sizing: border-box;
  padding: 10px 20px;
  color:white;
}
.grid-main, .grid-touch {
  background-color: #121314;
  padding: 20px 0px;
}

.track {
    border: 5px solid black;
    width: 40px;
    height: 40px;
    margin:0px 5px;
    display:inline-block;
    background-color:#202224;
}
.track.active {
  background-color:#525252;
}
.player {
  border: 2px solid green;
  -webkit-transition: margin 0.1s ease-out;
  -moz-transition: margin 0.1s ease-out;
  -o-transition: margin 0.1s ease-out;
  transition: margin 0.1s ease-out;
  margin: 0px 26px 5px 26px;
}
.player.active{
  -webkit-transition: margin 0.1s ease-out;
  -moz-transition: margin 0.1s ease-out;
  -o-transition: margin 0.1s ease-out;
  transition: margin 0.1s ease-out;
  margin:0px 22px 5px 22px;
}
.step {
  width:60px;
  display:inline-block;
}
.beatButton {
    border: 5px solid black;
    width: 70px;
    height: 70px;
    margin: 10px 20px;
    display:inline-block;
    color:aliceblue;
    background-color:#5e8345;
}
#BeatButton:active {
    background-color:#232540;
}
.beatButtons {
  margin-left: 200px;
}
/* ===== CONTROLS ===== */
.grid-control {
  text-align: center;
}

.grid-control .fa-icon {
  color:white;
}

.grid-control.input {
  padding-top:10px;
}

.grid-control button {
  width: 40px;
  height: 40px;
  background-color: green;
  border: 0px;
  border-radius: 50%;
}
#clearGridBtn { background-color: #525252; }
#clearGridBtn:focus {
  outline:none;
  background-color:green;
}

/* SLIDER */
/* The slider itself */
.slider {
    -webkit-appearance: none;
    height: 5px;
    border-radius: 20px;
    background: #d3d3d3;
    outline: none;
    opacity: 0.7;
    -webkit-transition: opacity .15s ease-in-out;
    transition: opacity .15s ease-in-out;
}

/* Mouse-over effects */
.slider:hover {
    opacity: 1; /* Fully shown on mouse-over */
}

/* The slider handle (use webkit (Chrome, Opera, Safari, Edge) and moz (Firefox) to override default look) */ 
.slider::-webkit-slider-thumb {
  -webkit-appearance: none;
  appearance: none;
  width: 15px;
  height: 15px;
  border-radius: 50%;
  background: #4CAF50;
  cursor: pointer;
}
.slider::-moz-range-thumb {
  width: 15px;
  height: 15px;
  border: 0;
  border-radius: 50%;
  background: #4CAF50;
  cursor: pointer;
}


/* SIDEBAR */
.grid-sidebar {
  width:200px;
  float:left;
}

.grid {
  width: 970px;
  display:inline-block;
}

.sidebar-container {
    background-color: #16181a;
    margin: 3px 10px 19px 10px;
    padding: 13px 10px;
}

</style>
