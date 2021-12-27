<template>
  <ul>
    <li><a href="">Mörderspiel und so</a></li>
    <li class="right"><a href="" v-on:click="logOut">Ausloggen</a></li>
    <li class="right"><a href="" v-on:click="restart">REEEEESTART</a></li> <!-- v-if="loggedIn" -->
  </ul>
</template>

<script>
const axios = require('axios')
export default {

  data() {
    return {
    }
  },
  methods: {
    logOut: function () {
      localStorage.removeItem('accessToken')
    },
    restart: function () {
      if (!window.confirm("Echt jetzt?"))
        return
      if (!window.confirm("Also wirklich?"))
        return
      if (!window.confirm("Ganz sicher?"))
        return
      if (!window.confirm("Ganz ganz sicher?"))
        return
      if (!window.confirm("Ok du hast es getan!"))
        return
      if (!window.confirm("Scherz"))
        return
      if (!window.confirm("Bist du dir wirklich ganz sicher?"))
        return
      axios.get('/restart', {
        headers: {
          authorization: 'Bearer ' + localStorage.accessToken
        }
      })
    }
  }

} 
</script>

<style>
ul {
  list-style-type: none;
  margin: 0;
  padding: 0;
  overflow: hidden;
  background-color: #333;
}

li {
  float: left;
}

li a {
  display: block;
  color: white;
  text-align: center;
  padding: 14px 16px;
  text-decoration: none;
}

/* Change the link color to #111 (black) on hover */
li a:hover {
  background-color: #111;
}

.right {
  float: right;
}
</style>