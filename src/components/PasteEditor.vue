<script setup lang="ts">
import CodeArea from '@/components/CodeArea.vue'
import { ref } from 'vue'
import { type Post, type ApiResponse, API_ENDPOINT } from '@/globals'
import { useAccountStore } from '@/stores/accountStore'
import router from '@/router'
import { typeMap } from '@/typeMap'
import Popup from '@/components/ButtonPopup.vue'

let supportedLangs = Object.keys(typeMap);
let accs = useAccountStore();

let props = defineProps({
  isEditing: Boolean,
  canEdit: Boolean,
  id: Number
});

function extToLang(ext:string) {
  return (Object.entries(typeMap).find(v=>v[1].exts.includes(ext))??["plain"])[0];
}

let rtitle = ref("");
let rlang = ref("plain");
let rcontent = ref("");
let rownerId = ref(accs.userData.id);
let rownerName = ref("anonymous")
let reditMode = ref(props.canEdit);

let notFound = ref(false);

if(props.id) {
  fetch(new URL(`/post/${props.id}`,API_ENDPOINT)).then(r=>r.json()).then((d:ApiResponse<Post>)=>{
    rtitle.value = d.data.title;
    rlang.value = d.data.lang;
    rcontent.value = d.data.content;
    rownerId.value = d.data.ownerId;
    rownerName.value = d.data.ownerName
  }).catch(()=>notFound.value = true)
}

async function postOrEdit() {
  let response = await fetch(new URL(props.isEditing?`/post/${props.id}`:`/post`,API_ENDPOINT),{
    method: props.isEditing?"PATCH":"POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": "Bearer "+accs.token
    },
    body: JSON.stringify({
      title: rtitle.value ?? "Untitled",
      lang: rlang.value,
      content: rcontent.value
    })
  });
  let {success,data}: ApiResponse<number> = await response.json();
  if(success) {
    await router.push(`/post/${data}`);
    reditMode.value = false;
  }
}

let confirmData = ref({
  message: "",
  open: false,
});
let popupCb:(success:boolean)=>void;


function confirmPopup(message:string) {
  confirmData.value = {
    open:true,
    message
  };
  return new Promise(res=>popupCb = res);
}

async function deletePost() {
  if(!await confirmPopup(`You are about to delete "${rtitle.value}", do you want to continue?`)) return;
  let response = await fetch(new URL(`/post/${props.id}`,API_ENDPOINT),{
    method: "DELETE",
    headers: {
      "Authorization": "Bearer "+accs.token
    },
  });
  if(response.status == 200) {
    await router.push("/");
  }
}

async function copyToClipboard(event:Event) {
  let ip = event.target as HTMLInputElement;
  await navigator.clipboard.writeText(rcontent.value);
  ip.value = "Copied!"
  setTimeout(()=>ip.value = "Copy",1000);
}

function downloadFile() {
  let a = document.createElement("a");
  a.download = rtitle.value+"."+(rtitle.value.match(/(\.)[^.]+$/m)?"":typeMap[rlang.value].exts[0]);
  a.href = `data:text/${rlang.value};base64,${btoa(rcontent.value)}`;
  a.click();
}

</script>

<template>
  <Popup :open="confirmData.open" @submit="confirmData.open = false">
    <p :style="{gridColumn:'1/3'}">{{confirmData.message}}</p>
    <input name="confirm" value="Confirm" type="submit" @click="popupCb(true)">
    <input name="cancel" value="Cancel" type="submit" @click="popupCb(false)">
  </Popup>
  <div id="createPaste" class="viewBox" v-if="!notFound">
    <h1 v-if="reditMode">{{isEditing?'Edit Paste':'New Paste'}}</h1>
    <div class="pasteParams">
      <input v-if="reditMode" type="text" placeholder="Title..." v-model="rtitle" @input="(rlang = extToLang((rtitle.match(/[^.]+$/m)??['txt'])[0]))">
      <h1 v-else>{{rtitle}} <sub>By <a :href="`/profile/${rownerId}`">{{rownerName}}</a></sub></h1>

      <select v-model="rlang" :disabled="!reditMode">
        <option v-for="(slang,i) in supportedLangs" :key="i" :value="slang" :name="slang">{{slang}}</option>
      </select>
      <input v-if="rownerId && (rownerId == accs.userData.id  || accs.userData.isAdmin) && !reditMode" type="button" @click="reditMode=true" id="editBtn" value="Edit">
    </div>
    <CodeArea :value="rcontent" :language="rlang" class="codeInput" @code-input="(c:string)=>rcontent=c" :disabled="!reditMode"></CodeArea>
    <div v-if="reditMode" class="postButtons">
      <input @click="postOrEdit" type="submit" value="Post!">
      <input v-if="rownerId && (rownerId == accs.userData.id  || accs.userData.isAdmin)" @click="deletePost" type="submit" value="Delete!">
    </div>
    <div v-else id="viewerOptions">
      <input type="button" value="Copy" @click="copyToClipboard">
      <input type="button" value="Download" @click="downloadFile">
    </div>
  </div>
</template>

<style scoped>
  #createPaste {

    display: flex;
    flex-direction: column;
    gap: 10px;


    h1 {
      text-align: center;
      sub {
        font-size: 50%;
        a {
          text-decoration: underline;

        }
      }
    }
    .postButtons {
      display: grid;
      gap: 5px;
      grid-template-columns: 4fr 1fr;
    }
    .postButtons:has(:first-child:last-child) {
      grid-template-columns: 1fr !important;
    }
    .pasteParams:not(:has(#editBtn)) {
      grid-template-columns: 4fr 1fr;
    }
    .pasteParams {
      display: grid;
      grid-template-columns: 8fr 2fr 1fr;
      height: 50px;
      gap: 5px;
      width: 100%;

      input,select {
        font-size: 15px;
        min-width: 0;
      }
      h1 {
        margin: 0;
        text-align: left;
      }
      input {font-size: 20px}
    }
    input {height: 50px;font-size: 25px;};
  }
  @media only screen and (max-width: 1400px) {
    .codeInput {
      width: 90vw !important;
    }
    .pasteParams>:nth-child(1) {grid-column: 1/3}
    .pasteParams {
      grid-template-columns: 1fr 1fr !important;
      grid-template-rows: 1fr 1fr !important;
      height: 115px !important;
    }
    .pasteParams:not(:has(#editBtn))>:nth-child(2) {grid-column: 1/3}

  }
  .codeInput {
    width: 50vw;
    height: 50vh;
  }
  #viewerOptions {
    display: flex;
    flex-direction: row;
    gap: 5px;
    width: 100%;

    * {
      width: 100%;
    }
  }
</style>