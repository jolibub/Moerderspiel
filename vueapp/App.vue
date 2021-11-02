<template>
<div>
  <navigation></navigation>
  <user-page></user-page>
</div>
</template>

<script>
import Navigation from './Navigation.vue'
import UserPage from './UserPage.vue'
export default {
  components: { UserPage, Navigation },
data () {
  return {
    message : "Hello WOrld!"
  }
}
}
</script>

<style>

</style>