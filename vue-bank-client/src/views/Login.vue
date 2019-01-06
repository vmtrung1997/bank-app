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
                  <input
                    class="input is-medium"
                    type="text"
                    placeholder="Username"
                    v-model="username"
                    autofocus
                  >
                </div>
              </div>

              <div class="field">
                <div class="control">
                  <input
                    class="input is-medium"
                    type="password"
                    placeholder="Password"
                    v-model="password"
                  >
                </div>
              </div>
              <vue-recaptcha ref="recaptcha"
          @verify="onVerify"
          sitekey="6LfOP4cUAAAAAF1r7-Ds5f7d5OvsGsRqOmFYlpX9">
                
              </vue-recaptcha>
              <button class="button is-block is-info is-large is-fullwidth" :disabled="!submitCapcha" type="submit">Login</button>
            </form>
          </div>
        </div>
      </div>
    </section>
  </div>
</template>

<script>
import VueRecaptcha from 'vue-recaptcha';
export default {
  name: "login",
  components: {
    VueRecaptcha
  },
  data() {
    return {
      submitCapcha: false,
      username: "",
      password: "",
      captchaResponse: ""
    };
  },
  methods: {
    onVerify() {
      // validate your form , if you don't have validate prop , default validate pass .
      this.submitCapcha = true;
    },
    callback(token) {
      // google recaptcha token , then you can pass to backend with your form data .
      if (token) {
        alert(token);
      }else{
        // if you use data-size show reCAPTCHA , maybe you will get empty token.
        alert('please check you are not robot');
      }
    },
    login: function() {
      var self = this;
      let username = this.username;
      let password = this.password;
      this.$store
        .dispatch("login", { username, password })
        .then(response => {
          console.log(response);
          if (response.status === "success") {
            self.$router.push({ name: "home" });
          }
        })
        .catch(err => {
          console.log(err);
          self.$toastr.error("Username or password incorrect", "Error");
        });
    }
  }
};
</script>