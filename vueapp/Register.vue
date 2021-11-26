<template>
  <div>
      <label for="username">Username</label><br>
      <input type="text" v-model="username" id="username"><br>
      <label for="email">Email</label><br>
      <input type="email" v-model="email" id="email"><br>
      <label for="password">Passwort</label><br>
      <input type="password" v-model="password" id="password"><br>
      <button v-on:click="postLogin">Login</button>
      <button v-on:click="postRegister">Registrieren</button>
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
        username: username.value,
        email: email.value,
        password: password.value
      })
    },
    postLogin: function() {
      axios.post('/login', {
        username: username.value,
        password: password.value
      })
      .then(function (response) {
        localStorage.accessToken = response.data.accessToken
      })
    }
  }
}
</script>

<style>

</style>