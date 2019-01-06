<template>
  <div></div>
</template>

<script>
export default {
  created() {
    var self = this;
    self.$store.dispatch('logout').then(response => {
      console.log(response);
      if (response === "success") {
        self.$router.push({ name: 'login' });
      }
    }).catch(() => {self.$router.push({ name: 'login' });});
  }
};
</script>