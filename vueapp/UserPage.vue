<template>
  <div class="center">
    <h1>{{target}}</h1>
    <h2>{{style}}</h2>
    <p>{{username}} : {{score}}</p>
  </div>
</template>

<script>
const axios = require('axios')
export default {
  data () {
    return {
      username : "Username",
      target : "Ziel",
      style : "Style",
      score : 99
    }
  },
  methods: {
    getUser: function () {
      axios.get('http://localhost:8080/ingamedata', {
        headers: {
          authorization: 'Bearer ' + localStorage.accessToken
        }
      })
      .then(res => {
        console.log('Data: ' + res.data)
        this.username = res.data.name
        this.target = res.data.target
        this.style = res.data.style
        this.score = res.data.kills
      })
    }
  },
  created() {
    this.getUser()
  }
}
</script>

<style>
.center * {
  margin: auto;
  text-align: center;
}
</style>