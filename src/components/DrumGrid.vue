<template>
  <div class="DrumGrid">
    <div class="grid-header">
      <span>Number of steps: <input type="number" min="5" max="16" v-model="numSteps"></span>
      <button v-on:click="startPlayer"><icon name="play"></icon></button>
      <button v-on:click="stopPlayer">Stop</button>
      <div class="slider-container">
        <input type="range" min="1" max="100" value="50" class="slider" id="volume-slider">
      </div>
    </div>
    <div class="grid-main">
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
  
</template>

<script>

export default {
  name: 'DrumGrid',
  //mixins: [VueHowler],
  data () {
    return {
      numSteps: 10,
      tracks: []
    }
  },
  methods: {
    setTrackActive: function(event, soundName, ix1, ix2) {
        //event.target.classList.toggle("active");
        var isActive = this.tracks[ix1].sounds[ix2].active;
        this.tracks[ix1].sounds[ix2].active = !isActive;

        var audio = new Audio("./static/sounds/" + soundName + ".wav");
        audio.volume = 0.8;
        audio.play();
        //this.$els.audio.play();
    },
    updatePlayer: function () {},
    startPlayer: function () {

      var counter = 0;
      var self = this;
      this.stopPlayer();
      this.updatePlayer = setInterval(function () {

            var sounds = self.tracks[counter].sounds;
            for (var i = 0; i < sounds.length; i++) {
              if (sounds[i].active) {
                var audio = new Audio("./static/sounds/" + sounds[i].name + ".wav");
                audio.volume = 0.8;
                audio.play();
              }
            }

            self.tracks[counter].active = true;
            if (counter != 0) {
              self.tracks[counter-1].active = false;
            } else {
              self.tracks[self.numSteps-1].active = false;
            }

            if (counter >= self.numSteps-1) {
              counter = 0;
            } else {
              counter++;
            }
          
      }, 200);
    },
    stopPlayer: function () {
      clearInterval(this.updatePlayer);
      for (var i = 0; i < this.tracks.length; i++) {
        this.tracks[i].active = false;
      }
    }
  },
  created: function() {
    this.$http.get('/static/data/tracks.json').then(function (response) {
      this.tracks = response.data;
    });
  }
}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>
.DrumGrid {
  margin:0 auto;
  padding: 40px;

}
.grid-header, .grid-main {
  max-width:1000px;
  margin:0px auto;
}
.grid-header {
  background-color: rgb(32,34,36);
  height: 60px;
  box-sizing: border-box;
  padding: 20px;
  color:white;
}
.grid-main {
  background-color: #121314;
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

/* SLIDER STYLE */
.slider-container {
    width: 100%; /* Width of the outside container */
}

/* The slider itself */
.slider {
    -webkit-appearance: none;
    width: 100%;
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

</style>
