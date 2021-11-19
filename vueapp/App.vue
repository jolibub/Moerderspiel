<template>
<div>
  <navigation></navigation>
  <user-page></user-page>
  <register></register>
  <login></login>
  <dasboard></dasboard>
</div>
</template>

<script>
import Dasboard from './dasboard.vue'
import Login from './Login.vue'
import Navigation from './Navigation.vue'
import Register from './Register.vue'
import UserPage from './UserPage.vue'
export default {
  components: { UserPage, Register, Dasboard, Navigation, Login },
data () {
  return {

  }
}
}
</script>

<style>

</style>