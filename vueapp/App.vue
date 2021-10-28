<template>
<div>
  <h1>{{message}}</h1>
  <hallo></hallo>
</div>
</template>

<script>
import Hallo from './Hallo.vue'
export default {
  components: { Hallo },
data () {
  return {
    message : "Hello WOrld!"
  }
}
}
</script>

<style>

</style>