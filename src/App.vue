<script setup lang="ts">
import { RouterLink, RouterView } from 'vue-router'
import { ref } from 'vue'
import WebsiteIcon from '@/components/icons/WebsiteIcon.vue'
import { useAccountStore } from '@/stores/accountStore'

let isDarkMode = ref("true" === (localStorage.getItem("darkMode")));
if(isDarkMode.value) document.body.classList.add("dark");
setTimeout(()=>document.body.classList.add("fadeDarkMode"));

let accountStore = useAccountStore();
accountStore.setToken(accountStore.token)

function toggleDarkmode() {
  isDarkMode.value = !isDarkMode.value;
  localStorage.setItem("darkMode", String(isDarkMode.value));
  if (isDarkMode.value) document.body.classList.add("dark");
  else document.body.classList.remove("dark");
}

</script>

<template>
  <header>
    <WebsiteIcon class="logo webicon" width="90" height="90" @click="$router.push('/')" />
    <div class="wrapper">
      <h1 class="webicon" @click="$router.push('/')">Paste</h1>
      <nav>
        <RouterLink to="/">
          <span class="material-symbols-outlined circleButton" title="Create Post">add</span>
        </RouterLink>
        <RouterLink v-if="accountStore.loggedIn" :to="`/profile/${accountStore.userData.id}`">
          <div class="circleButton profileButton" title="View Profile">
            <span class="material-symbols-outlined">person</span>
            {{accountStore.userData.username}}
          </div>
        </RouterLink>
        <RouterLink v-else to="/login">
          <span class="material-symbols-outlined circleButton" title="Login">login</span>
        </RouterLink>
        <a v-if="accountStore.loggedIn" @click="accountStore.setToken('')">
          <span class="material-symbols-outlined circleButton" title="Logout">logout</span>
        </a>
        <a @click="toggleDarkmode">
          <span v-if="isDarkMode" class="material-symbols-outlined circleButton" title="Switch to light mode">light_mode</span>
          <span v-else class="material-symbols-outlined circleButton" title="Switch to dark mode">dark_mode</span>
        </a>
      </nav>
      </div>
  </header>

  <RouterView />
</template>

<style scoped>
header {
  width: 100%;
  height: 100px;
  display: grid;
  align-items: center;
  grid-template-columns: 90px 1fr;
}
.wrapper {
  display: flex;
  flex-direction: row;
  align-items: center;
}
nav {
  width: 100%;
  display: flex;
  flex-direction: row;
  justify-content: right;
  align-items: center;
  margin-right: 15px;

  a {
    padding-left: 10px;
    cursor: pointer;
  }
  a.router-link-active .circleButton {
    background-color: var(--background-modified);
  }
}
a:has(.circleButton) {line-height: 1!important;}

.profileButton {
  display: flex;
  width: fit-content !important;
  flex-direction: row;

  svg {
    padding-right: 5px;
    width: 20px;
    aspect-ratio: 1/1;
  }
  font-size: 15px;
  align-items: center;
}

.webicon {
  cursor: pointer;
}
</style>
