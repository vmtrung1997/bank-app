<template>
  <div class="has-text-justified" style="margin-bottom:20px;">
    <div class="has-text-centered is-size-4">TRANSFER</div>
    <form action="#" @submit.prevent="submitRequest">
      <div class="field">
        <label class="label has-text-left">Account number</label>
        <div class="control">
          <div class="select is-fullwidth">
            <select v-model="accountSelected">
              <option v-for="acc in accounts" :key="acc.accountId">{{acc.accountId}}</option>
            </select>
          </div>
        </div>
      </div>
      <div class="field">
        <label class="label has-text-left">Recipient account</label>
        <div class="control">
          <input class="input" v-model="recipientAccount" type="number" @blur="checkAccount" autofocus required>
        </div>
      </div>
      <div class="field" v-show="checkRecipient">
        <label class="label has-text-left">Recipient infomation</label>
        <p>Fullname: {{recipient.fullname}}</p>
        <p>Email: {{recipient.email}}</p>
        <p>Phone: {{recipient.phone}}</p>
        <p><button class="button is-info" v-show="!isSaveContact" @click.prevent="modalContact=true">Save contact</button></p>
      </div>
      <div class="field">
        <label class="label has-text-left">Transfer money</label>
        <div class="control">
          <input class="input" type="number" v-model="balance" autofocus required>
        </div>
      </div>
      <div class="field">
        <label class="label has-text-left">Message</label>
        <div class="control">
          <input class="input" type="text" v-model="message">
        </div>
      </div>
      <div class="field">
        <label class="label has-text-left">Type transfer</label>
        <div class="control">
          <label class="radio">
            <input type="radio" value="PAYER FEE" v-model="feeType">
            Sender fee
          </label>
          <label class="radio">
            <input type="radio" value="RECIPIENT FEE" v-model="feeType">
            Recipient fee
          </label>
        </div>
      </div>
      <button type="submit" class="button is-block is-info is-large is-fullwidth">Transfer</button>
    </form>
    <div class="modal" :class="modal?'is-active':''">
        <div class="modal-background"></div>
        <div class="modal-card">
          <form action="#" @submit.prevent="submitOtp">
          <header class="modal-card-head">
            <p class="modal-card-title">Submit OTP mail</p>
            <button class="delete" aria-label="close"></button>
          </header>
          <section class="modal-card-body">
            <div class="field">
              <div class="control">
                <p>Input your 6 digit number we have sent your email</p>
                <input
                  class="input is-medium" type="text" v-model="otpNumber" placeholder="OTP number" autofocus
                  required>
              </div>
            </div>
          </section>
          <footer class="modal-card-foot">
            <button class="button is-success" type="submit">Submit</button>
          </footer>
          </form>
        </div>
      </div>
      <div class="modal" :class="modalContact?'is-active':''">
        <div class="modal-background"></div>
        <div class="modal-card">
          <header class="modal-card-head">
            <p class="modal-card-title">Contact</p>
            <button class="delete" aria-label="close" @click="resetContactModal"></button>
          </header>
          <section class="modal-card-body">
            <div class="field">
              <div class="control">
                <input
                  class="input is-medium"
                  type="text"
                  v-model="recipientAccount"
                  disabled
                >
              </div>
            </div>
            <div class="field">
              <div class="control">
                <input class="input is-medium" type="text" v-model="contactName" placeholder="Name">
              </div>
            </div>
          </section>
          <footer class="modal-card-foot">
            <button class="button is-success" @click="saveContact">Save</button>
            <button class="button" @click="resetContactModal">Cancel</button>
          </footer>
        </div>
      </div>
  </div>
</template>
<script>
export default {
  name: "deposit-screen",
  data() {
    return {
      accountSelected: "",
      recipientAccount: "",
      recipient: {
        fullname: "",
        email: "",
        phone: ""
      },
      contactName: "",
      feeType: "PAYER FEE",
      balance: 0,
      message: "",
      checkRecipient: false,
      otpNumber: "",
      modal: false,
      modalContact: false
    };
  },
  computed: {
    accounts() {
      return this.$store.getters.getAccountList;
    },
    isSaveContact() {
      return !!this.$store.getters.getContactByContactNum(this.recipientAccount);
    }
  },
  methods: {
    resetContactModal(){
      this.contactName = "";
      this.modalContact = false;
    },
    resetDepositForm() {
      this.accountSelected= "";
      this.recipientAccount= "";
      this.recipient= {
        fullname: "",
        email: "",
        phone: ""
      }
      this.message = "";
      this.balance = 0;
      this.feeType= "PAYER FEE";
      this.resetRecipientForm()
    },
    resetRecipientForm() {
      this.checkRecipient = false;
      this.recipient = {
        fullname: "",
        email: "",
        phone: ""
      };
    },
    accountList() {
      var self = this;
      this.$store.dispatch("accountList").then(value => {
        self.accounts = value.accountList;
      });
    },
    checkAccount() {
      var self = this;
      self.resetRecipientForm();
      var accountNumber = self.recipientAccount;
      if (self.recipientAccount == "") return;
      self.$store
        .dispatch("checkAccount", accountNumber)
        .then(value => {
          if (value.status === "success") {
            self.checkRecipient = true;
            self.recipient = value.user;
          }
        })
        .catch(error => {
          self.$toastr.error(error.response.data.msg);
        });
    },
    submitRequest() {
      if (!this.checkRecipient){
        this.$toastr.error('Please check recipient account');
        return;
      } else if (this.balance < 0){
           this.$toastr.error('Transfer money must be greater than 0');
          return;
        }
      var data = {
          accountId: this.accountSelected,
          detail: {
              type: this.feeType,
              accountTo: this.recipientAccount,
              balance: this.balance,
              message: this.message
          }
      }
      var self = this;
      this.$store.dispatch('transfer', data).then(result => {
        if (result.status === 'success'){
          self.modal = true;
        }
      }).catch(error => {
        self.$toastr.error(error.response.data.msg);
      })
    },
    submitOtp(){
      var data = {
        accountId: this.accountSelected,
        code: this.otpNumber
      }
      var self = this;
      this.$store.dispatch('submitOtp', data).then(result=> {
        if (result.status === 'success'){
          self.$toastr.success('Transfer has been completed successfully');
          self.modal = false;
          self.resetDepositForm();
          self.otpNumber = '';
        }
      }).then(() => {
        self.$store.dispatch('getInfomation');
      })
      .catch(error => {
        if (error.response.data.msg === 'INVALID CODE')
            self.$toastr.error(error.response.data.msg);
        else
          {
            self.modal = false;
            self.otpNumber = '';
            self.$toastr.error(error.response.data.msg);
            self.resetDepositForm();
          }
      })
    },
    saveContact() {
      var self = this;
      let accountNum = self.recipientAccount;
      let name = self.contactName;
      self.$store
        .dispatch("createContact", { accountNum, name })
        .then(res => {
          if (res.status === "success") {
            self.$toastr.success("Contact has been created successfully");
            self.$store.dispatch("getContactList");
            self.contactName ="";
            self.modalContact = false;
          }
        })
        .catch(error => {
          self.$toastr.error(error);
        });
    }
  },
  mounted() {}
};
</script>
