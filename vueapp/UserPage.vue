<template>
  <div class="center">
    <div v-if = "new Date(refreshedAt) <= new Date()">
      <h1>{{target}}</h1>
      <h2>{{style}}</h2>
    </div>
    <div v-else>
      Dein naechstes Ziel wird um {{new Date(refreshedAt).getHours()}}:{{(new Date(refreshedAt).getMinutes() < 10 ? '0' : '') + new Date(refreshedAt).getMinutes()}} angezeigt. 
    </div>
    <div v-if = "new Date(respawnsAt) > new Date()">
      Du bist tot. Du lebst wieder um {{new Date(respawnsAt).getHours()}}:{{(new Date(respawnsAt).getMinutes() < 10 ? '0' : '') + new Date(respawnsAt).getMinutes()}}. 
    </div>
      <p>{{username}} : {{score}}</p>
    <div class="buttons"> 
      <button v-on:click="postKill" :disabled = "new Date(refreshedAt) >= new Date() || new Date(respawnsAt) >= new Date()">Kill</button>
      <button v-on:click="postRefresh" :disabled = "new Date(refreshedAt) >= new Date()">Refresh</button>
    </div>
  </div>
</template>

<script>
const axios = require('axios')
export default {
  data () {
    return {
      username : "Username",
      target : "Ziel",
      style : "Style",
      score : 99,
      refreshedAt : new Date(),
      respawnsAt : new Date()
    }
  },
  methods: {
    getUser: function () {
      axios.get('/ingamedata', {
        headers: {
          authorization: 'Bearer ' + localStorage.accessToken
        }
      })
      .then(res => {
        this.username = res.data.name
        this.target = res.data.target
        this.style = res.data.style
        this.score = res.data.kills
        this.refreshedAt = res.data.refreshedAt
        this.respawnsAt = res.data.respawnsAt
      })
    },
    postKill: function () {
      if (!window.confirm("Echt jetzt?"))
        return
      axios.post('/kill', {},
      {
        headers: {
          authorization: 'Bearer ' + localStorage.accessToken
        }
      }).then(res => {
        if (res.data.error != undefined){
          window.confirm(res.data.error)
          return
        }
        this.username = res.data.name
        this.target = res.data.target
        this.style = res.data.style
        this.score = res.data.kills
        this.refreshedAt = res.data.refreshedAt
        this.respawnsAt = res.data.respawnsAt
      })
    },
    postRefresh: function () {
      if (!window.confirm("Echt jetzt?"))
        return
      axios.post('/refresh', {},
      {
        headers: {
          authorization: 'Bearer ' + localStorage.accessToken
        }
      }).then(res => {
        this.username = res.data.name
        this.target = res.data.target
        this.style = res.data.style
        this.score = res.data.kills
        this.refreshedAt = res.data.refreshedAt
        this.respawnsAt = res.data.respawnsAt
      })
    }
  },
  created() {
    this.getUser()
  }
}
</script>

<style>
.center * {
  margin: auto;
  text-align: center;
}

.center .buttons {
  margin-left: 30%;
  margin-right: 30%;
}

.center .buttons button {
  padding: 2vh;
}
</style>