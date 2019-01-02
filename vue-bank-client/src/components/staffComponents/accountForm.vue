<template>
  <div>
    <section class="is-fullheight">
      <div class="container">
        <div class="column is-6 is-offset-1">
          <form action="#" @submit.prevent="createAccount">
            <div class="field">
              <label class="label has-text-left">Input username</label>
              <div class="control">
                <input class="input" type="text" v-model="username" autofocus required>
              </div>
            </div>
            
            <button type="submit" class="button is-block is-info is-large is-fullwidth">Create account</button>
          </form>
        </div>
      </div>
    </section>
  </div>
</template>
<script>
export default {
  name: "account-form",
  data(){
      return {
          username: ''
      }
  },
  methods: {
      resetForm(){
        this.username = ''
      },
      createAccount(){
          var self = this;
          const data = self.username
          console.log(data);
          self.$store.dispatch('createAccount', data).then(res => {
              if (res.status === 'success'){
                  self.$toastr.success(`The account's ${data} has been created`, 'Success');
                  self.resetForm();
              }
          }).catch(error=>{
              self.$toastr.error(error.response.data.msg)
          })
      }
  }
};
</script>
