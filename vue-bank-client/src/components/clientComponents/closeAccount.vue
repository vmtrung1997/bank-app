<template>
  <div style="margin-bottom:20px;">
    <h1 class="is-size-4" style="margin-bottom: 1.5em">Account list</h1>
    <ul>
        <li v-for="acc in accounts" :key="acc._id" class="box" style="max-width:50%" @click="closeAccount(acc.accountId)">{{acc.accountId}}</li>
    </ul>
  </div>
</template>
<script>
export default {
  name: "close-account",
  data() {
    return {
      modal: "",
      accountNumber: "",
      name: ""
    };
  },
  computed: {
    accounts(){
      return this.$store.getters.getAccountList;
    }
  },
  methods: {
    closeAccount(accountId){
        var self = this;
        if (confirm(`Do you want to close account ${accountId}`)){
            this.$store.dispatch('closeAccount', accountId).then(result => {
                if (result.status === 'success'){
                    self.$toastr.success('Close account successfully');
                }
            }).catch(error => {
                self.$toastr.error(error.response.data.msg);
            })
        }
    }
  }
};
</script>
