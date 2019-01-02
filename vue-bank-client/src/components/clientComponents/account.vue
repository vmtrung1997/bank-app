<template>
  <div style="margin-bottom:20px;">
    <h1>Account infomation</h1>
    <table class="table table-hover">
      <thead>
        <tr>
        <th>Account</th>
        <th>Balance</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="acc in accounts" :key="acc._id">
          <td>{{acc.accountId}}</td>
          <td>{{acc.balance}}</td>
        </tr>
      </tbody>
    </table>
  </div>
</template>
<script>
export default {
  name: "accounts-screen",
  data(){
    return {
      accountList: []
    }
  },
  computed:{
    accounts(){
      return this.$store.getters.getAccountList;
    }
  },
  methods: {
  },
  mounted(){
  }
};
</script>
