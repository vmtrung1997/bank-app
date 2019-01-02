<template>
  <div>
    <section class="is-fullheight">
        <div class="container has-text-centered">
          <div class="column is-4 is-offset-4">
            <h3 class="title has-text-grey">Login</h3>
            <div class="box">
              <form action="#" @submit.prevent="login">
                <div class="field">
                  <div class="control">
                    <input class="input is-medium" type="text" placeholder="Username" v-model="username" autofocus>
                  </div>
                </div>

                <div class="field">
                  <div class="control">
                    <input class="input is-medium" type="password" placeholder="Password" v-model="password">
                  </div>
                </div>
                
                <button class="button is-block is-info is-large is-fullwidth" type="submit">Login</button>
              </form>
            </div>
          </div>
        </div>
    </section>
  </div>
</template>

<script>
export default {
  name: "login",
  data() {
    return {
      username: "",
      password: ""
    };
  },
  methods: {
    login: function() {
      var self = this;
      let username = this.username;
      let password = this.password;
      this.$store
        .dispatch("login", { username, password })
        .then(response => {
          console.log(response);
          if (response.status === 'success'){
            self.$router.push({ name: 'home' })
          } else {
            self.$toastr.error("Username or password incorrect", "Error");
          }
        })
        .catch(err => {
          console.log(err);
        });
    }
  }
};
</script>