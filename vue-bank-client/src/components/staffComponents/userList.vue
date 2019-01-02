<template>
  <div>
    <table class="table table-hover">
      <thead>
        <tr>
          <th>Username</th>
          <th>Fullname</th>
          <th>Email</th>
          <th>Phone</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="user in userList" :key="user.username">
          <td>{{user.username}}</td>
          <td>{{user.fullname}}</td>
          <td>{{user.email}}</td>
          <td>{{user.phone}}</td>
        </tr>
      </tbody>
    </table>
  </div>
</template>
<script>
export default {
  name: "list-form",
  data(){
    return {
      userList: []
    }
  },
  methods: {
    getList(){
      var self = this;
      self.$store.dispatch('getUsers').then(value => {
        self.userList = value.list;
      })
    }
  },
  mounted(){
    this.getList();
  }
};
</script>
