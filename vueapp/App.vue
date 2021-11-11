<template>
<div>
  <!--<navigation></navigation>
  <user-page></user-page> -->
  <register></register>
</div>
</template>

<script>
import Navigation from './Navigation.vue'
import Register from './Register.vue'
import UserPage from './UserPage.vue'
export default {
  components: { UserPage, Navigation, Register },
data () {
  return {
    message : "Hello WOrld!"
  }
}
}
</script>

<style>

</style>