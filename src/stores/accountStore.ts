import { ref } from 'vue'
import { defineStore } from 'pinia'
import { API_ENDPOINT, type ApiResponse, type User } from '@/globals'
import { useSessionStorage } from '@vueuse/core'

export const useAccountStore = defineStore('counter', {
  state:()=> ({
        token: useSessionStorage("token",""),
        userData: {username:"anonymous",id:0} as User,
        loggedIn: false
  }),
  actions: {
    async setToken(token:string) {
      this.token = token;

      const response = await fetch(new URL("user/@me",API_ENDPOINT),{
        headers:{
          "Authorization":"Bearer "+token
        }
      });

      const data:ApiResponse<User> = await  response.json();
      if(data.success) {
        this.userData = data.data;
        this.loggedIn = true;
        console.log(this.loggedIn)
      }else{
        this.userData = {username:"anonymous",id:0}
        this.loggedIn = false;
      }
    }
  }
})