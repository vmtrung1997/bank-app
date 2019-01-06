<template>
  <div class="body">
    <div class="columns is-size-6">
      <div class="column is-3 is-offset-1 has-text-justified">
        <aside class="menu">
          <p class="menu-label">
            <strong>Fullname:</strong>&nbsp;
            <span class="menu-label-none">{{fullname}}</span>
          </p>
          <p class="menu-label">
            <strong>Email:</strong>&nbsp;
            <span class="menu-label-none">{{email}}</span>
          </p>
          <p class="menu-label">
            <strong>Phone:</strong>&nbsp;
            <span class="menu-label-none">{{phone}}</span>
          </p>
          <p class="menu-label">
            <strong>Functions</strong>
          </p>
          <ul class="menu-list">
            <li><a @click="screen='accounts'" :class="screen=='accounts'?'is-active':''">Accounts</a></li>
            <li><a @click="screen='contacts'" :class="screen=='contacts'?'is-active':''">Contacts</a></li>
            <li><a @click="screen='make deposit'" :class="screen=='make deposit'?'is-active':''">Make a deposit</a></li>
            <li><a @click="screen='history'" :class="screen=='history'?'is-active':''">History</a></li>
            <!-- <li><a @click="screen='close account'" :class="screen=='close account'?'is-active':''">Close account</a></li> -->
          </ul>
        </aside>
      </div>
      <div class="column is-8">
          <div v-if="screen=='accounts'"><account/></div>
          <div v-if="screen=='contacts'"><contact/></div>
          <div v-if="screen=='make deposit'"><deposit-form /></div>
          <div v-if="screen=='history'"><history /></div>
          <!-- //<div v-if="screen=='close account'"><close-account/></div> -->
      </div>
    </div>
  </div>
</template>

<script>
import account from '@/components/clientComponents/account.vue'
import contact from '@/components/clientComponents/contact.vue'
import depositForm from '@/components/clientComponents/depositForm.vue'
import history from '@/components/clientComponents/history.vue'
//import closeAccount from '@/components/clientComponents/closeAccount.vue'
export default {
  name: "client",
  components: {
    account,depositForm,contact,history,//closeAccount
  },
  data() {
    return {
      currentTab: "",
      screen: ''
    };
  },
  computed:{
    fullname(){
      return this.$store.getters.fullname;
    },
    email(){
      return this.$store.getters.email;
    },
    phone(){
      return this.$store.getters.phone;
    }
  },
  methods: {
    getInfomation(){
      this.$store.dispatch('getInfomation')
    }
  },
  mounted() {
    this.getInfomation();
  }
};
</script>
<style>
.menu-label-none {
  text-transform: none;
}
.menu-label a {
  color: #7a7a7a;
}
</style>

