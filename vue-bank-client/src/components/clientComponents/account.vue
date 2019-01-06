<template>
  <div>
    <div class="is-size-4" style="margin-bottom:10px">ACCOUNT LIST</div>
      <div class="columns is-multiline">
        <div v-for="acc in accounts" :key="acc._id" class="column box bd-notification is-primary has-text-left is-3" style="margin:10px">
          <div><strong><i class="fas fa-id-card"></i>&nbsp;{{acc.accountId}}</strong></div>
          <div><i class="fas fa-dollar-sign" ></i>&nbsp;{{acc.balance | formatNumber}}</div>
          <div class="is-flex"><button type="button" class="button is-danger is-outlined is-small" style="margin-left:auto" @click="closeAccount(acc.accountId)">Close</button></div>
        </div>
        <div class="modal" :class="modal?'is-active':''">
        <div class="modal-background"></div>
        <div class="modal-card">
          <header class="modal-card-head">
            <p class="modal-card-title">Submit close account</p>
            <button class="delete" aria-label="close" @click="resetModal"></button>
          </header>
          <section class="modal-card-body">
            <div class="field">
              <p>You must transfer your available balance to another account to close this account</p>
              <p>If yes, choose one account below</p>
            </div>
            <div class="field">
              <div class="control">
                <div class="select is-fullwidth">
                <select v-model="accountSelected">
                  <option v-for="acc in accountsSelect" :key="acc.accountId">{{acc.accountId}}</option>
                </select>
              </div>
              </div>
            </div>
          </section>
          <footer class="modal-card-foot">
            <button class="button is-success" @click="submitAccount">Choose</button>
            <button class="button" @click="resetModal">Cancel</button>
          </footer>
        </div>
      </div>
      </div>
        
  </div>
</template>
<script>
export default {
  name: "close-account",
  data() {
    return {
      modal: false,
      accountNumber: "",
      accountSelected: ""
    };
  },
  computed: {
    accounts(){
      return this.$store.getters.getAccountList;
    },
    accountsSelect(){
      return this.accounts.filter(x => x.accountId != this.accountNumber)
    }
  },
  methods: {
    closeAccount(accountId){
        var self = this;
        this.accountNumber = accountId
        if (confirm(`Do you want to close account ${accountId}`)){
            this.$store.dispatch('closeAccount', accountId).then(result => {
                if (result.status === 'success'){
                    self.$toastr.success('Close account successfully');
                    self.$store.dispatch('getAccountList');
                } else if (result.status === 'warning'){
                    self.modal = true;
                }
            })
            .catch(error => {
                self.$toastr.error(error.response.data.msg);
            })
        }
    },
    resetModal(){
      this.modal = false;
      this.accountNumber = "";
      this.name = "";
      this.accountSelected = "";
    },
    submitAccount(){
      var self = this;
      this.$store.dispatch('submitToClose', {accountFrom: this.accountNumber, accountTo: this.accountSelected})
        .then(result => {
           if (result.status === 'success'){
              self.$toastr.success('Close account successfully');
              self.resetModal();
           }
        })
        .catch(error => {
            self.resetModal();
            self.$toastr.error(error.response.data.msg);
        })
    }
  }
};
</script>
