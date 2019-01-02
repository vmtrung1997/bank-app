<template>
  <div style="margin-bottom:20px;">
    <div class="is-1">
      <button
        class="button is-info is-pulled-right"
        style="align"
        @click="modal='active'"
      >Create contact</button>
      <div class="modal" :class="modal=='active'?'is-active':''">
        <div class="modal-background"></div>
        <div class="modal-card">
          <form action="#" @submit.prevent="saveContact">
          <header class="modal-card-head">
            <p class="modal-card-title">Contact</p>
            <button class="delete" aria-label="close" @click="resetModal"></button>
          </header>
          <section class="modal-card-body">
            <div class="field">
              <div class="control">
                <input
                  class="input is-medium"
                  type="text"
                  v-model="accountNumber"
                  placeholder="Account number"
                  autofocus
                  required
                >
              </div>
            </div>
            <div class="field">
              <div class="control">
                <input class="input is-medium" type="text" v-model="name" placeholder="Name">
              </div>
            </div>
          </section>
          <footer class="modal-card-foot">
            <button class="button is-success" type="submit">Save</button>
            <button class="button" @click="resetModal">Cancel</button>
          </footer>
          </form>
        </div>
      </div>
    </div>
    <div class>
      <table class="table table-hover">
        <thead>
          <tr>
            <th>Name</th>
            <th>Acount</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="con in contacts" :key="con._id">
            <td>{{con.name}}</td>
            <td>{{con.accountNumber}}</td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>
<script>
export default {
  name: "contact-screen",
  data() {
    return {
      modal: "",
      accountNumber: "",
      name: ""
    };
  },
  computed: {
    contacts() {
      return this.$store.getters.getContactList;
    }
  },
  methods: {
    resetModal() {
      this.modal = "";
      this.accountNumber = "";
      this.name = "";
    },
    saveContact() {
      var self = this;
      if (self.accountNumber === "") {
        self.$toastr.warning("Account number is required");
        return;
      }
      let accountNum = self.accountNumber;

      let name = self.name;
      self.$store
        .dispatch("createContact", { accountNum, name })
        .then(res => {
          if (res.status === "success") {
            self.$toastr.success("Contact has been created successfully");
            self.resetModal();
            self.$store.dispatch("getContactList");
          }
        })
        .catch(error => {
          console.log(error);
          self.$toastr.error(error);
          self.resetModal();
        });
    }
  },
  mounted() {}
};
</script>
