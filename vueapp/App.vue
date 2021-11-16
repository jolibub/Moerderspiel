<template>
<div>
  <navigation></navigation>
  <user-page></user-page>
  <register></register>
  <dasboard></dasboard>
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

  }
}
}
</script>

<style>

</style>