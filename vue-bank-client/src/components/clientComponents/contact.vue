<template>
  <div style="margin-bottom:20px;">
    <h1 class="is-size-4">CONTACT LIST</h1>
    <div class="is-1 is-flex" style="margin-bottom:10px">
      <button class="button is-info" @click="modal=true" style="margin-left:auto">Create contact</button>
      <div class="modal" :class="modal?'is-active':''">
        <div class="modal-background"></div>
        <div class="modal-card">
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
            <button class="button is-success" v-show="!isEdit" @click="saveContact">Save</button>
            <button class="button is-success" v-show="isEdit" @click="updateContact">Update</button>
            <button class="button" @click="resetModal">Cancel</button>
          </footer>
        </div>
      </div>
    </div>
    <div class="columns is-multiline">
      <div
        v-for="con in contacts"
        class="column box is-success is-3 has-text-left"
        style="margin:10px"
        :key="con._id"
      >
        <div>
          <i class="fas fa-address-book"></i>
          <strong>&nbsp;{{con.name}}</strong>
        </div>
        <div>
          <i class="far fa-id-card"></i>
          {{con.accountNumber}}
        </div>
        <div class="is-flex">
          <button
            class="button is-small"
            style="margin-left:auto"
            @click="editContact(con._id)"
            title="Edit"
          >
            <i class="fas fa-edit"></i>
          </button>
          <button
            class="button is-small"
            style="margin-left:10px"
            @click="deleteContact(con._id)"
            title="Delete"
          >
            <i class="fas fa-trash"></i>
          </button>
        </div>
      </div>
    </div>
  </div>
</template>
<script>
export default {
  name: "contact-screen",
  data() {
    return {
      modal: false,
      accountNumber: "",
      name: "",
      contactEdit: {},
      isEdit: false
    };
  },
  computed: {
    contacts() {
      return this.$store.getters.getContactList;
    }
  },
  methods: {
    resetModal() {
      this.modal = false;
      this.accountNumber = "";
      this.name = "";
      this.isEdit = false;
    },
    editContact(id) {
      this.isEdit = true;
      this.modal = true;
      var contact = this.contacts.find(c => c._id === id);
      this.contactEdit = contact;
      this.accountNumber = contact.accountNumber;
      this.name = contact.name;
    },
    updateContact() {
      var self = this;
      var data = {
        idContact: this.contactEdit._id,
        accountNum: this.accountNumber,
        name: this.name
      };
      self.$store
        .dispatch("updateContact", data)
        .then(result => {
          if (result.status === "success") {
            self.$toastr.success("Contact has been edited");
            this.resetModal();
          }
        })
        .catch(err => {
          console.log(err);
          self.$toastr.error(err.response.msg);
          this.resetModal();
        });
    },
    deleteContact(id) {
      var self = this;
      if (confirm("Are you sure to delete this contact")) {
        self.$store
          .dispatch("deleteContact", { contactId: id })
          .then(result => {
            if (result.status === "success") {
              self.$toastr.success("Contact has been delete");
            }
          })
          .catch(error => {
            self.$toastr.error(error.response.data.msg);
          });
      }
    },
    saveContact() {
      if (this.isEdit) {
        return;
      }
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
          }
        })
        .catch(error => {
          self.$toastr.error(error.response.data.msg);
        });
    }
  },
  mounted() {}
};
</script>
