<template>
  <div>
    <section class="is-fullheight">
      <div class="container">
        <div class="column is-6 is-offset-1">
          <form action="#" @submit.prevent="creditSubmit">
            <div class="field">
              <label class="label has-text-left">Account number</label>
              <div class="control">
                <input class="input" type="text" v-model="accountNumber" autofocus required>
              </div>
            </div>
            <div class="field">
              <label class="label has-text-left">Credit number</label>
              <div class="control">
                <input class="input" type="number" v-model="credit" autofocus required>
              </div>
            </div>
            <button type="submit" class="button is-block is-info is-large is-fullwidth">Credit</button>
          </form>
        </div>
      </div>
    </section>
  </div>
</template>
<script>
export default {
  name: "credit-form",
  data(){
      return {
          accountNumber: '',
          credit: 0,
      }
  },
  methods: {
      resetForm(){
        this.accountNumber = '';
        this.credit= 0
      },
      creditSubmit(){
          var self = this;
          var balance = parseInt(self.credit);
          if (balance){
              if (balance<0){
                  self.$toastr.error('Credit must be greater than 0')
                  return;
              }
          } else {
              self.$toastr.error('Credit must be a number')
              return;
          }
          const data = {account: self.accountNumber, balance: self.credit}
          console.log(data);
          self.$store.dispatch('creditMoney', data).then(res => {
              if (res.status === 'success'){
                  self.$toastr.success(`The account's ${data.account} has been credited`);
                  self.resetForm();
              }
          }).catch(error=>{
              self.$toastr.error(error.response.data.msg)
          })
      }
  }
};
</script>