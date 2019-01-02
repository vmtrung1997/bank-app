import Vue from 'vue'
import Vuex from 'vuex'
import axios from 'axios'
Vue.use(Vuex)


axios.defaults.baseURL = 'http://localhost:3000/api'

export default new Vuex.Store({
  state: {
    access_token: localStorage.getItem('access_token') || null,
    refresh_token: null,
    profile: {},
    accountList: [],
    contactList: [],
    transList: []
  },
  getters: {
    loggedIn(state) {
      return state.access_token != null;
    },
    userType(state) {
      return state.profile.role_id;
    },
    fullname(state) {
      return state.profile.fullname
    },
    email(state) {
      return state.profile.email
    },
    phone(state) {
      return state.profile.phone
    }
    ,
    getAccountList(state) {
      return state.accountList;
    },
    getContactList(state) {
      return state.contactList;
    },
    getTransListById: (state) => (id) => {
      return state.transList.filter(trans => trans.accountId === id);
    }
  },
  mutations: {
    retrieveAccessToken(state, data) {
      state.access_token = data
    },
    retrieveRefreshToken(state, data) {
      state.refresh_token = data
    },
    retrieveProfile(state, data) {
      state.profile = data
    },
    retrieveAccountList(state, data) {
      state.accountList = data
    },
    retrieveTransList(state, data) {
      state.transList = data
    },
    retrieveContactList(state, data) {
      state.contactList = data
    },
    destroyAccessToken(state) {
      state.access_token = null
    },
    destroyRefreshToken(state) {
      state.refresh_token = null
    },
    destroyProfile(state) {
      state.profile = null
    }
  },
  actions: {
    getProfile(context) {
      var refresh_token = localStorage.getItem('refresh_token');
      if (refresh_token) {
        return new Promise((resolve, reject) => {
          axios.post('/user/getaccess', { refresh_token: refresh_token })
            .then(result => {
              var res = result.data;
              context.commit('retrieveAccessToken', res.access_token);
              context.commit('retrieveRefreshToken', res.refresh_token);
              context.commit('retrieveProfile', res.user);
              resolve(res)
            }).catch(err => {
              reject(err);
            })
        })
      }
    },
    login(context, data) {
      return new Promise((resolve, reject) => {
        axios.post('/user/login', {
          username: data.username,
          password: data.password,
        })
          .then(response => {
            if (response.data.status == 'success') {
              var data = response.data;

              localStorage.setItem('access_token', data.access_token);
              localStorage.setItem('refresh_token', data.refresh_token);

              context.commit('retrieveAccessToken', data.access_token);
              context.commit('retrieveRefreshToken', data.refresh_token);
              context.commit('retrieveProfile', data.user);
              resolve(response.data)
            } else {
              reject({ status: 'fail' })
            }
          })
          .catch(error => {
            reject(error)
          })
      })
    },
    logout(context) {
      axios.defaults.headers.common['x-access-token'] = context.state.access_token;
      axios.defaults.headers.common['x-refresh-token'] = context.state.refresh_token;
      if (context.getters.loggedIn) {
        return new Promise((resolve, reject) => {
          axios.get('/logout').then(res => {
            console.log(res);
            if (res.data.status === 'success') {
              localStorage.removeItem('access_token');
              localStorage.removeItem('refresh_token');

              context.commit('destroyAccessToken');
              context.commit('destroyRefreshToken')
              context.commit('destroyProfile')
              resolve(res.data.status);
            } else {
              reject(res.data.status);
            }
          }).catch(error => {
            console.log(error)
            reject(error);
          })
        })
      }
    },
    createUser(context, data) {
      axios.defaults.headers.common['x-access-token'] = context.state.access_token;
      axios.defaults.headers.common['profile'] = context.state.profile;
      return new Promise((resolve, reject) => {
        axios.post('/staff/create_user', data).then(result => {
          if (result.data) {
            resolve(result.data)
          } else reject(result.msg);
        }).catch(error => reject(error))
      })
    },
    getAccountList(context) {
      axios.defaults.headers.common['x-access-token'] = context.state.access_token;
      return new Promise((resolve, reject) => {
        axios.post('/client/account_list').then(result => {
          if (result.data) {
            resolve(result.data);
          }
        }).catch(error => reject(error))
      })
    },
    getInfomation(context) {
      axios.defaults.headers.common['x-access-token'] = context.state.access_token;
      axios.get('/client/infomation').then(result => {
        if (result.data) {
          if (result.data.status === 'success') {
            context.commit('retrieveAccountList', result.data.value.accountList);
            context.commit('retrieveContactList', result.data.value.contactList);
            context.commit('retrieveTransList', result.data.value.transList);
          } else {
            console.log(result.data.msg);
          }
        }
      }).catch(error => console.log(error))
    },
    createContact(context, data) {
      axios.defaults.headers.common['x-access-token'] = context.state.access_token;
      return new Promise((resolve, reject) => {
        axios.post('/client/create_contact', {
          accountNumber: data.accountNum,
          name: data.name
        }).then(result => {
          if (result.data) {
            resolve(result.data);
          }
        }).catch(error => reject(error))
      })
    },
    
    getContactList(context) {
      axios.defaults.headers.common['x-access-token'] = context.state.access_token;
      return new Promise((resolve, reject) => {
        axios.get('/client/contacts').then(result => {
          if (result.data) {
            if (result.data.status === 'success') {
              context.commit('retrieveContactList', result.data.contactList);
              resolve(result.data);
            }
          }
        }).catch(error => reject(error))
      })
    },
    createAccount(context, data) {
      axios.defaults.headers.common['x-access-token'] = context.state.access_token;
      return new Promise((resolve, reject) => {
        axios.post('/staff/create_account', {username: data}).then(result => {
          if (result.data) {
            resolve(result.data);
          }
        }).catch(error => reject(error))
      })
    },
    creditMoney(context, data) {
      axios.defaults.headers.common['x-access-token'] = context.state.access_token;
      return new Promise((resolve, reject) => {
        axios.post('/staff/credit', data).then(result => {
          if (result.data) {
            resolve(result.data);
          }
        }).catch(error => reject(error))
      })
    },
    getUsers(context, data) {
      axios.defaults.headers.common['x-access-token'] = context.state.access_token;
      return new Promise((resolve, reject) => {
        axios.post('/staff/users', {username: data}).then(result => {
          if (result.data) {
            resolve(result.data);
          }
        }).catch(error => reject(error))
      })
    }
  }
})
