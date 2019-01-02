<template>
  <div class="home">
    <div class="field">
      <h3 class="is-size-4 has-text-weight-semibold">
        Staff app
      </h3>
    </div>
    <div class="columns">
  <div class="column is-gapless is-one-quarter is-fullheight">
    <div class="field">
    <button class="button is-block is-info is-medium is-fullwidth"  @click="mainScreen='user list'" type="text">
      User list
    </button>
    </div>
    <div class="field">
    <button class="button is-block is-info is-medium is-fullwidth" @click="mainScreen='create user'" type="text">
      Create user
    </button>
    </div>
    <div class="field">
    <button class="button is-block is-info is-medium is-fullwidth" @click="mainScreen='create account'" type="text">
      Create account
    </button>
    </div>
    <div class="field">
    <button class="button is-block is-info is-medium is-fullwidth" @click="mainScreen='credit'" type="text">
      Credit money
    </button>
    </div>
  </div>
  <div class="column">
    <user-list v-if="mainScreen === 'user list'"></user-list>
    <user-form v-if="mainScreen === 'create user'"></user-form>
    <account-form v-if="mainScreen === 'create account'"></account-form>
    <credit-form v-if="mainScreen === 'credit'"></credit-form>

  </div>
</div>
  </div>
</template>

<script>
import userList from '@/components/staffComponents/userList.vue'
import userForm from '@/components/staffComponents/userForm.vue'
import accountForm from '@/components/staffComponents/accountForm.vue'
import creditForm from '@/components/staffComponents/creditForm.vue'
export default {
  name: 'Staff',
  components: {
    userList, userForm, accountForm, creditForm
  },
  data(){
    return {
      mainScreen: ''
    }
  }
}
</script>