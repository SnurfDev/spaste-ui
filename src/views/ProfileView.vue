<script setup lang="ts">
import { ref, watch } from 'vue'
import { useRoute } from 'vue-router'
import { useAccountStore } from '@/stores/accountStore'
import { API_ENDPOINT, type ApiResponse, type User } from '@/globals'
import moment from 'moment'

  let route = useRoute();

  let accStore = useAccountStore();

  let notFound = ref(false);
  let userData = ref<User>(accStore.userData);
  if(route.params.id) {
    fetch(new URL(`/user/${route.params.id}`,API_ENDPOINT),{
      headers: {
        "Authorization": "Bearer "+accStore.token
      }
    }).then(r=>r.json()).then((d:ApiResponse<User>)=>{
      if(d.success) {
        userData.value = d.data;
      }else{
        notFound.value = true;
      }
    }).catch(()=>notFound.value = true)
  }
</script>

<template>
  <main>
    <div class="viewBox userView" v-if="!notFound">
      <h1>{{userData.username}}</h1>
      <p>Joined {{moment((userData.joindate??0)*1000).fromNow()}}</p>
      <h3>Recent Posts:</h3>
      <div id="postList">
        <RouterLink v-for="(post,i) in userData.posts?.slice(0,5)" :key="i" :to="`/post/${post.id}`">
          <h3>{{post.title}}</h3>
          <span>Created {{moment((post.created??0)*1000).fromNow()}}</span>
        </RouterLink>
      </div>
    </div>
  </main>
</template>

<style>
main {
  display: flex;
  align-items: center;
  justify-content: center;
  height: calc(100vh - 100px);
}
#postList {
  display: flex;
  flex-direction: column;
  width: 50vw;
  gap: 10px;

  a {
    border: 1px solid var(--text);
    border-radius: 15px;
    padding: 15px;
  }
  a:hover {
    background-color: var(--background-modified);
  }
}
</style>
