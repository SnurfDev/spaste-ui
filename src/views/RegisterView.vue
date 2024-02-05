<script setup lang="ts">
  import { ref } from 'vue'
  import { RouterLink } from 'vue-router'
  import { API_ENDPOINT, type ApiResponse } from '@/globals'
  import router from '@/router'
  import { useAccountStore } from '@/stores/accountStore'

  let {setToken} = useAccountStore();

  let username = ref("")
  let password = ref("")
  let email = ref("")
  let gotCode = ref(false);
  let code = ref("")

  let lastError = ref("")

  let vp = ref("");
  let canContinue = ref(true);
  async function verifyPassword() {
    if(vp.value != password.value) {
      lastError.value = "Passwords don't match!"
      canContinue.value = false;
    }else{
      lastError.value = "";
      canContinue.value = true;
    }
  }
  async function tryRegister() {
    if(!username.value || !password.value) return;
    let response = await fetch(new URL("register",API_ENDPOINT),{
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        username: username.value,
        password: password.value,
        email: email.value,
        verifyCode: gotCode.value?code.value:undefined
      })
    });
    let data:ApiResponse<string> = await response.json();
    if(data.success) {
      if(data.data === "verify_code") {
        gotCode.value = true;
      }else{
        await setToken(data.data);
        await router.push("/")
      }
    }else{
      lastError.value = data.reason??"";
    }
  }
</script>

<template>
  <main>
    <form @submit.prevent="" id="registrationForm" class="viewBox">
      <h1>Register</h1>
      <span :class="['errorText',lastError.length?'enabled':'']">{{lastError}}</span>
      <input name="username" autocomplete="username" type="text" v-model="username" placeholder="Username">
      <input name="email" autocomplete="email" type="email" v-model="email" placeholder="Email">
      <input name="password" autocomplete="password" type="password" v-model="password" @input="verifyPassword" placeholder="Password">
      <input name="password_again" autocomplete="none" type="password" v-model="vp" @input="verifyPassword" placeholder="Repeat Password">
      <input v-if="gotCode" name="code" autocomplete="one-time-code" type="text" v-model="code" placeholder="Verification Code">
      <input name="login" type="submit" :value="gotCode?'Register':'Send Verification Email'" @click="tryRegister()" :disabled="!canContinue">
      <br>
      <RouterLink to="/login">Have an account? Login here</RouterLink>
    </form>
  </main>
</template>

<style scoped>
  main {
    display: flex;
    align-items: center;
    justify-content: center;
    height: calc(100vh - 100px);
  }
  #registrationForm {
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
    .errorText {color: red;font-size: 15px;}
  }
</style>