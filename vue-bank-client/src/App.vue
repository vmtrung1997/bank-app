<template>
  <div id="app">
    <nav class="navbar" role="navigation" aria-label="main navigation">
      <div id="navbarBasicExample" class="navbar-menu">
        <div class="navbar-start"></div>
        <div class="navbar-end">
          <router-link class="navbar-item" to="/">Home</router-link>
          <router-link class="navbar-item" to="/about">About</router-link>
          <router-link v-if="!isLogin" class="navbar-item" to="/login">
            <div class="buttons">
              <a class="button is-info">
                <strong>Log in</strong>
              </a>
            </div>
          </router-link>
          <router-link v-if="isLogin" class="navbar-item" to="/logout">
            <div class="buttons">
              <a class="button is-default">
                <strong>Log out</strong>
              </a>
            </div>
          </router-link>
        </div>
      </div>
    </nav>
    <div class="container">
      <div class="container-fruid">
        <router-view/>
      </div>
    </div>
  </div>
</template>
<script>
export default {
  name: "App",
  computed: {
    isLogin() {
      return this.$store.getters.loggedIn;
    }
  }
};
</script>

<style>
#app {
  font-family: "Avenir", Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  color: #2c3e50;
}
#nav {
  padding: 30px;
}
.navbar-start {
  margin: auto;
  width: 50%;
}
#nav a {
  font-weight: bold;
  color: #2c3e50;
}

#nav a.router-link-exact-active {
  color: #42b983;
}
</style>
