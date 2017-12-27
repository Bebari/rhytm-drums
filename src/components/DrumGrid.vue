<template>
  <div class="DrumGrid">
    <div class="grid-header">
      <div class="grid-control col-1">
        <button title="Play" v-on:click="startPlayer" v-bind:class="{ hidden: playing }"><icon name="play"></icon></button>
        <button title="Stop" v-on:click="stopPlayer"  v-bind:class="{ hidden: !playing }"><icon name="stop"></icon></button>
      </div>
      <div class="grid-control col-2">
        <button title="Clear Grid" v-on:click="clearGrid"><icon name="ban"></icon></button>
      </div>
      <div class="grid-control input col-4">
        <span>Number of steps: </span><input type="number" min="5" max="16" v-model="numSteps">
      </div>
      <div class="grid-control input col-4">
        <span>Volume: </span> <input type="range" min="0" max="100" v-model="volume" class="slider" id="volume-slider">
      </div>
      <div class="grid-control input col-4">
        <span>BPM: </span> <input type="range" min="100" max="500" v-model="bpm" v-on:change="updateInterval" class="slider" id="bpm-slider">
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
      numSteps: 16,
      tracks: [],
      playing: false,
      volume: 50,
      bpm: 350,
      counter: 0,
      keyCodes: null
    }
  },
  methods: {
    setTrackActive: function(event, soundName, ix1, ix2) {
        //event.target.classList.toggle("active");
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
    },
    updatePlayer: function () {},
    updateInterval: function () {
      this.startPlayer(false)
    },
    startPlayer: function (stopPlayer=true) {

      var self = this;
      if (stopPlayer) {
        this.counter = 0;
        this.stopPlayer();
      } else
        clearInterval(this.updatePlayer);
      
      this.playing = true;
      this.updatePlayer = setInterval(function () {

            var sounds = self.tracks[self.counter].sounds;
            for (var i = 0; i < sounds.length; i++) {
              if (sounds[i].active) {
                self.playSound(null, sounds[i].name);
              }
            }

            self.tracks[self.counter].active = true;
            if (self.counter != 0) {
              self.tracks[self.counter-1].active = false;
            } else {
              self.tracks[self.numSteps-1].active = false;
            }

            if (self.counter >= self.numSteps-1) {
              self.counter = 0;
            } else {
              self.counter++;
            }
          
      }, 600-self.bpm);
    },
    stopPlayer: function () {

      this.playing = false;
      clearInterval(this.updatePlayer);
      for (var i = 0; i < this.tracks.length; i++) {
        this.tracks[i].active = false;
      }
    },
    onKeyDown: function(e) {
      console.log(this.keyCodes[e.keyCode]);
      //console.log("click");
        var sounds = this.tracks[0].sounds;
            //console.log(e.keyCode);
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
    }
  },
  created: function() {
    this.$http.get('/static/data/keyCodes.json').then(function (response) {
      this.keyCodes = response.data;
    });

    this.$http.get('/static/data/tracks.json').then(function (response) {
      this.tracks = response.data;
    });
    window.addEventListener('keydown', this.onKeyDown);
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

/* GRID */
.DrumGrid {
  margin:0 auto;
  padding: 40px;

}
.grid-header, .grid-main, .grid-touch {
  max-width:1175px;
  margin:0px auto;
  text-align:left;
}
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
.grid-control button.hidden {
  display:none;
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
