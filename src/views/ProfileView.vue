<script setup lang="ts">
import { ref, watch } from 'vue'
import { RouterLink, useRoute } from 'vue-router'
import { useAccountStore } from '@/stores/accountStore'
import { API_ENDPOINT, type ApiResponse, type User } from '@/globals'
import moment from 'moment'

  let route = useRoute();
  let accStore = useAccountStore();

  let notFound = ref(false);
  let userData = ref<User>(accStore.userData);
  let isInPostView = ref(false);


  if(route.params.id) {
    fetch(new URL(`user/${route.params.id}`,API_ENDPOINT),{
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
      <div v-if="isInPostView" class="content">

        <h1><span class="material-symbols-outlined circleButton" @click="isInPostView=false">arrow_back</span> {{userData.username}}'s Posts</h1>

        <div id="postList" class="scrollContent">
          <RouterLink v-for="(post,i) in userData.posts" :key="i" :to="`/post/${post.id}`">
            <h3>{{post.title}}</h3>
            <span>Created {{moment((post.created??0)*1000).fromNow()}}</span>
          </RouterLink>
        </div>
      </div>
      <div v-else class="content">
        <div class="profile_header">
          <h1>{{userData.username}}</h1>
          <RouterLink v-if="accStore.userData.id==userData.id" :to="`/settings`"><span class="material-symbols-outlined circleButton">settings</span></RouterLink>
        </div>
        <p>Joined {{moment((userData.joindate??0)*1000).fromNow()}}</p>
        <h3>Recent Posts:</h3>
        <div id="postList">
          <RouterLink v-for="(post,i) in userData.posts?.slice(0,4)" :key="i" :to="`/post/${post.id}`">
            <h3>{{post.title}}</h3>
            <span>Created {{moment((post.created??0)*1000).fromNow()}}</span>
          </RouterLink>
        </div>
        <a v-if="(userData.posts?.length??0) > 4" @click="isInPostView = true" id="viewMore">More...</a>
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
.content {
  width: 50vw;
  height: 75vh;
}
#postList {
  display: flex;
  flex-direction: column;
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

#viewMore {
  text-decoration: underline;
  cursor: pointer;
  text-align: center;
  width: 100%;
}
.scrollContent {
  overflow-y: auto;
  height: 90%;
}
.profile_header {
  display: grid;
  grid-template-columns: 1fr 50px;
  align-items: center;
}
</style>
