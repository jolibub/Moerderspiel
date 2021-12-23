<template>
  <ul>
    <li><a href="">Mörderspiel und so</a></li>
    <li class="right"><a href="" v-on:click="logOut">Ausloggen</a></li> <!-- v-if="loggedIn" -->
  </ul>
</template>

<script>
export default {

  data() {
    return {
    }
  },
  methods: {
    logOut: function () {
      localStorage.removeItem('accessToken')
    }
  }

}
</script>

<style>
ul {
  list-style-type: none;
  margin: 0;
  padding: 0;
  overflow: hidden;
  background-color: #333;
}

li {
  float: left;
}

li a {
  display: block;
  color: white;
  text-align: center;
  padding: 14px 16px;
  text-decoration: none;
}

/* Change the link color to #111 (black) on hover */
li a:hover {
  background-color: #111;
}

.right {
  float: right;
}
</style>