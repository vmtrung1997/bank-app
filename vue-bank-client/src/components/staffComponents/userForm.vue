<template>
  <div>
    <section class="is-fullheight">
      <div class="container">
        <div class="column is-6 is-offset-1">
          <form action="#" @submit.prevent="createUser">
            <div class="field">
              <label class="label has-text-left">Fullname</label>
              <div class="control">
                <input class="input" type="text" v-model="user.fullname" autofocus required>
              </div>
            </div>
            <div class="field">
              <label class="label has-text-left">Email</label>
              <div class="control">
                <input class="input" type="email" v-model="user.email" required>
              </div>
            </div>

            <div class="field">
              <label class="label has-text-left">Phone</label>
              <div class="control">
                <input class="input" type="text" v-model="user.phone">
              </div>
            </div>
            <div class="field">
              <label class="label has-text-left">Username</label>
              <div class="control">
                <input class="input" type="text" v-model="user.username" required>
              </div>
            </div>
            <div class="field">
              <label class="label has-text-left">Password</label>
              <div class="control">
                <input class="input" type="password" v-model="user.password" required>
              </div>
            </div>
            
            <button type="submit" class="button is-block is-info is-large is-fullwidth">Create user</button>
          </form>
        </div>
      </div>
    </section>
  </div>
</template>
<script>
export default {
  name: "user-form",
  data(){
      return {
          user: {
              fullname: '',
              email: '',
              phone: '',
              username: '',
              password: ''
          }
      }
  },
  methods: {
      resetForm(){
        this.user.fullname = '';
        this.user.email = '';
        this.user.phone = '';
        this.user.username = '';
        this.user.password = '';
      },
      createUser(){
          var self = this;
          const data = self.user
          self.$store.dispatch('createUser', data).then(res => {
              if (res.status === 'success'){
                  self.$toastr.success('User has been created successfully', 'Success');
                  self.resetForm();
              }
          }).catch(error=>{
              self.$toastr.error(error.response.data.msg)
          })
      }
  }
};
</script>
