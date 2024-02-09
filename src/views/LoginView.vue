<script setup lang="ts">
  import { ref } from 'vue'
  import { RouterLink } from 'vue-router'
  import { API_ENDPOINT, type ApiResponse } from '@/globals'
  import router from '@/router'
  import { useAccountStore } from '@/stores/accountStore'

  let {setToken} = useAccountStore();

  let username = ref("")
  let password = ref("")

  let lastError = ref("")


  async function tryLogin() {
    if(!username.value || !password.value) return;
    let response = await fetch(new URL("login",API_ENDPOINT),{
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        username: username.value,
        password: password.value
      })
    });
    let data:ApiResponse<string> = await response.json();
    if(data.success) {
      await setToken(data.data);
      await router.back()
    }else{
      lastError.value = data.reason??"";
    }
  }
</script>

<template>
  <main>
    <form @submit.prevent="" id="loginForm" class="viewBox">
      <h1>Login</h1>
      <span :class="['errorText',lastError.length?'enabled':'']">{{lastError}}</span>
      <input name="username" autocomplete="username" type="text" v-model="username" placeholder="Username123">
      <input name="password" autocomplete="password" type="password" v-model="password" placeholder="&middot;&middot;&middot;&middot;&middot;&middot;">
      <input name="login" type="submit" value="Login" @click="tryLogin()">
      <br>
      <RouterLink to="/register">Don't have an account? Register here</RouterLink>
    </form>
  </main>
</template>

<style lang="scss" scoped>
  main {
    display: flex;
    align-items: center;
    justify-content: center;
    height: calc(100vh - 100px);
  }
  #loginForm {
    display: flex;
    flex-direction: column;
    width: 500px;
    height: fit-content;
    gap: 10px;

    h1 {text-align: center}
    a {
      color: var(--accent);
      font-size: 15px;
      text-decoration: underline;
    }
    * {
      width: 100%;
      height: 50px;
    }
    input {
      font-size: 20px;
    }
    .errorText {color: red;font-size: 25%;}
  }
</style>