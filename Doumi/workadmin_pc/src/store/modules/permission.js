// initial state
const state = () => ({
  permissions: []
})

// getters
const getters = {}

// actions
const actions = {}

// mutations
const mutations = {
  setPermission (state, permissions) {
    state.permissions = permissions
  },
}

export default {
  namespaced: true,
  state,
  getters,
  actions,
  mutations
}