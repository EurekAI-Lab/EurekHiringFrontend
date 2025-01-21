import { defineStore } from 'pinia'
import { ref } from 'vue'

export const usePublicStore = defineStore({
  id: 'publicStore',
  state: () => ({
    isLoading: false,
    questionState: {
      // 岗位名称
      positionName: '',
      // 企业类型
      companyType: '',
      // 企业规模
      companySize: '',
      // 题目集合
      questions: [] as any[],
      loading: false,
    },
  }),
  getters: {},
  actions: {
    startLoading() {
      this.isLoading = true
    },
    endLoading() {
      this.isLoading = false
    },
  },
})
