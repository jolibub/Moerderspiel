<template>
<div>
  <navigation></navigation>
  <div class="content">
    <user-page v-if="loggedIn"></user-page>
    <register v-if="!loggedIn"></register>
    <dasboard v-if="!loggedIn"></dasboard>
  </div>
</div>
</template>

<script>
import Dasboard from './dasboard.vue'
import Navigation from './Navigation.vue'
import Register from './Register.vue'
import UserPage from './UserPage.vue'
export default {
  components: { UserPage, Register, Dasboard, Navigation },
  data () {
    return {
      loggedIn: false
    }
  },
  created() {
    if(localStorage.accessToken != undefined) {
      this.loggedIn = true
    } else {
      this.loggedIn = false
    }
  },
  beforeUpdate() {
    if(localStorage.accessToken != undefined) {
      this.loggedIn = true
    } else {
      this.loggedIn = false
    }
  }
}
</script>

<style>
.content {
  margin: auto;
  text-align: center;
}
</style>