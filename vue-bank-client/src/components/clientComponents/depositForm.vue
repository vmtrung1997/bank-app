<template>
  <div style="margin-bottom:20px;">
    This is pay into screen
  </div>
</template>
<script>
export default {
  name: "deposit-screen",
  data(){
    return {
      accounts: []
    }
  },
  methods: {
    accountList(){
      var self = this;
      this.$store.dispatch('accountList').then(value => {
        self.accounts = value.accountList
      })
    }
  },
  mounted(){
  }
};
</script>
