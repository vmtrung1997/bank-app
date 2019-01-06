<template>
  <div class="home">
    <div v-if="getType === 'CLIENT'">
      <client/>
    </div>
    <div v-else>
      <staff/>
    </div>
  </div>
</template>

<script>
// @ is an alias to /src
import Client from '@/views/Client.vue'
import Staff from '@/views/Staff.vue'
export default {
  name: 'home',
  components: {
    Client, Staff
  },
  computed:{
    getType(){
      return this.$store.getters.userType;
    }
  },
  created(){
    this.$store.dispatch('getProfile')
  }
}
</script>
