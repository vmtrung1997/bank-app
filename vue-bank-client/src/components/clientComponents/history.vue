<template>
  <div style="margin-bottom:20px;"><span class="is-size-4">HISTORY</span>
    <div class="columns">
      <div class="column is-4">
        <ul class="menu-list">
          <li v-for="acc in accounts" :key="acc._id">
            <a
              @click="historyAccount(acc.accountId)"
              :class="accSelect===acc.accountId?'is-active':''"
            >{{acc.accountId}}</a>
          </li>
        </ul>
      </div>
      <div class="column is-8">
        <div class="box has-text-left" v-for="trans in transactionList" :key="trans._id" style="margin-top:10px">
            <p class="title is-5">{{trans.accountTo}}</p>
           <p>Balance: {{trans.balance}}</p>
              <p>Message: {{trans.message}}</p>
              <p>Fee: 
                  <span v-if="trans.type==='PAYER FEE'">Sender</span>
                  <span v-else>Recipient</span>
              </p>
              <p>Time: <time :datetime="trans.time">{{coverTime(trans.time)}}</time></p>
        </div>
      </div>
    </div>
  </div>
</template>
<script>
export default {
  name: "history",
  data() {
    return {
      modal: "",
      accountNumber: "",
      name: "",
      accSelect: ""
    };
  },
  computed: {
    accounts() {
      return this.$store.getters.getAccountList;
    },
    transactionList() {
      var id = this.accSelect;
      return this.$store.getters.getTransListById(id);
    },
    
  },
  methods: {
    historyAccount(id) {
      this.accSelect = id;
    },
    coverTime(time){
        var t = new Date(time);
        return t.toLocaleString();
    }
  },
  mounted() {}
};
</script>
