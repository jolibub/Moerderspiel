<template>
  <div>
    <input type="text" v-model="usernamel" id="usernamel"> 
    <input type="password" v-model="passwordl" id="passwordl">
    <button v-on:click="postLogin">Login</button>
  </div>
</template>

<script>
const axios = require('axios')
export default {
  data() {
    return {
      usernamel: "",
      passwordl: ""
    }
  },
  methods: {
    postLogin: function() {
      axios.post('/login', {
        username: usernamel.value,
        password: passwordl.value
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