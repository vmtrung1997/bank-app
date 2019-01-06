import Vue from 'vue'
import App from './App.vue'
import router from './router'
import store from './store'
import './../node_modules/bulma/css/bulma.css'
import VueToastr2 from 'vue-toastr-2'
import 'vue-toastr-2/dist/vue-toastr-2.min.css'
import numeral from 'numeral'
import VueReCaptcha from 'vue-grecaptcha'

// import { library } from '@fortawesome/fontawesome-svg-core'
// import { faCoffee } from '@fortawesome/free-solid-svg-icons'
// import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome'
import './style/font/css/all.css'

// library.add(faCoffee)

// Vue.component('font-awesome-icon', FontAwesomeIcon)


window.toastr = require('toastr')

Vue.use(VueToastr2)
Vue.use(VueReCaptcha, { siteKey: '6LfOP4cUAAAAAF1r7-Ds5f7d5OvsGsRqOmFYlpX9' })
Vue.filter('formatNumber', value => {
  return numeral(value).format('0,0')
})

Vue.config.productionTip = false

new Vue({
  router,
  store,
  render: h => h(App)
}).$mount('#app')
