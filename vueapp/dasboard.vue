<template>
<div>
  <table>
    <tr>
      <th>Name</th>
      <th>Kills</th>
      <th>Dead?</th>
    </tr>
    <tr v-for="item in dashboarddata" :key="item.name">
      <td>{{ item.name }}</td>
      <td>{{ item.kills }}</td>
      <td>{{ item.dead }}</td>
    </tr>
  </table>
</div>
</template>

<script>
const axios = require('axios')
export default {
  data() {
    return {
      dashboarddata: null
    }
  },
  methods: {
    getDashboard: function () {
      axios.get('/dashboarddata').then(res => {
        this.dashboarddata = res.data
        console.log(this.dashboarddata)
      })
    }
  },
  created() {
    this.getDashboard()
  }
}
</script>

<style>

</style>