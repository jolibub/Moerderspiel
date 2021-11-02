<template>
  <div class="center">
    <h1>{{target}}</h1>
    <h2>{{style}}</h2>
    <p>{{username}} : {{score}}</p>
  </div>
</template>

<script>
export default {
  data () {
    return {
      username : "Username",
      target : "Ziel",
      style : "Style",
      score : 99
    }
  }
}
</script>

<style>
.center * {
  margin: auto;
  text-align: center;
}
</style>