<template>
  <div>
      <input type="text" v-model="username" id="username"> 
      <input type="email" v-model="email" id="email"> 
      <input type="password" v-model="password" id="password">
      <button v-on:click="postRegister">Registrieren</button>
    <h1>Username: {{username}}</h1>
  </div>
</template>

<script>
const axios = require('axios')
export default {
  data() {
    return {
      username: "",
      email: "",
      password: ""
    }
  },
  methods: {
    postRegister: function () {
      axios.post('/register', {
        username: username,
        email: email,
        password: password
      })
    }
  }
}
</script>

<style>

</style>