<template>
  <div id="app">
    <!--<img src="./assets/logo.png">-->
    <h2>Drums Rhytm Game</h2>
    <router-view/>
  </div>
</template>

<script>
export default {
  name: 'app'
}
</script>

<style>
body {
  background-color: whitesmoke; /*#191b1c;*/
}
#app {
  font-family: 'Avenir', Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  color: #2c3e50;
  margin-top: 30px;
}

h2 {
      font-size: 3em;
    text-transform: uppercase;
    margin: 5px;
}
</style>
