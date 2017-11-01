<template>
  <div class="DrumGrid">
    <div class="grid-header">
      Number of steps: <input type="number" min="5" max="16" v-model="numSteps">
    </div>
    <div class="grid-main">
      <div class="step" v-for="ix in parseInt(numSteps)" v-bind:key="ix">
      <div v-for="sound in sounds" class="track" v-on:click="setTrackActive($event, sound.name)" v-bind:key="ix,sound" v-bind:class="sound.name"></div>
      </div>
    </div>
  </div>
  
</template>

<script>
//import VueHowler from 'vue-howler'

export default {
  name: 'DrumGrid',
  //mixins: [VueHowler],
  data () {
    return {
      numSteps: 5,
      sounds: [
        { name:'Clave01' },
        { name:'Clave02' },
        { name:'Cowbell' },
        { name:'Kick01' },
        { name:'Rim01' },
        { name:'Rim02' },
        { name:'Snare01' },
        { name:'Snare02' }
      ],
    }
  },
  methods: {
    setTrackActive: function(event, soundName) {
        event.target.classList.toggle("active");
        var audio = new Audio("./static/sounds/" + soundName + ".wav");
        audio.play();
        //this.$els.audio.play();
    }
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
    margin:5px;
    display:inline-block;
    background-color:#202224;
}
.track.active {
  background-color:#525252;
}

.step {
  width:60px;
  display:inline-block;
}
</style>
