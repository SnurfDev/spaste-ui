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

let rdata = ref({
  title: "",
  lang: "plain",
  content: "",
  ownerId: accs.userData.id,
  ownerName: accs.userData.username
})
let reditMode = ref(props.canEdit);

let notFound = ref(false);

if(props.id) {
  fetch(new URL(`post/${props.id}`,API_ENDPOINT)).then(r=>r.json()).then((d:ApiResponse<Post>)=>{
    rdata.value.title = d.data.title;
    rdata.value.lang = d.data.lang;
    rdata.value.content = d.data.content;
    rdata.value.ownerId = d.data.ownerId;
    rdata.value.ownerName = d.data.ownerName
  }).catch(()=>notFound.value = true)
}

async function postOrEdit() {
  let response = await fetch(new URL(props.isEditing?`post/${props.id}`:`post`,API_ENDPOINT),{
    method: props.isEditing?"PATCH":"POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": "Bearer "+accs.token
    },
    body: JSON.stringify({
      title: rdata.value.title ?? "Untitled",
      lang: rdata.value.lang,
      content: rdata.value.content
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
  if(!await confirmPopup(`You are about to delete "${rdata.value.title}", do you want to continue?`)) return;
  let response = await fetch(new URL(`post/${props.id}`,API_ENDPOINT),{
    method: "DELETE",
    headers: {
      "Authorization": "Bearer "+accs.token
    },
  });
  if(response.status == 200) {
    await router.push("/");
  }
}

async function copyToClipboard(text:string) {
  await navigator.clipboard.writeText(text);
}
async function copyContentToClipboard(e: Event) {
  let ip = (e.target as HTMLInputElement);
  await copyToClipboard(rdata.value.content);
  ip.innerText = "done"
  setTimeout(()=>ip.innerText = "content_copy",1000);
}

function generateRunCommand() {
  const baseUrl = `${API_ENDPOINT}post/${props.id}/raw`
  switch (rdata.value.lang) {
    case "javascript":
    case "js":
      return `curl -s ${baseUrl} | node`;
    case "typescript":
    case "ts":
      return `curl -s ${baseUrl} | ts-node`;
    case "bash":
    case "shell":
    case "sh":
      return `curl -s ${baseUrl} | bash`;

    default:
      return baseUrl;
  }
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
      <input v-if="reditMode" type="text" placeholder="Title..." v-model="rdata.title" @input="(rdata.lang = extToLang((rdata.title.match(/[^.]+$/m)??['txt'])[0]))">
      <h1 v-else>{{rdata.title}} <sub>By <a :href="`/profile/${rdata.ownerId}`">{{rdata.ownerName}}</a></sub></h1>

      <select v-model="rdata.lang" :disabled="!reditMode">
        <option v-for="(slang,i) in supportedLangs" :key="i" :value="slang" :name="slang">{{slang}}</option>
      </select>
      <input v-if="rdata.ownerId && (rdata.ownerId == accs.userData.id  || accs.userData.isAdmin) && !reditMode" type="button" @click="reditMode=true" id="editBtn" value="Edit">
    </div>
    <CodeArea :value="rdata.content" :language="rdata.lang" class="codeInput" @code-input="(c:string)=>rdata.content=c" :disabled="!reditMode">
      <span v-if="!reditMode" class="material-symbols-outlined" id="copyBtn" @click="copyContentToClipboard">
        content_copy
      </span>
    </CodeArea>
    <div v-if="reditMode" class="postButtons">
      <input @click="postOrEdit" type="submit" value="Post!">
      <input v-if="rdata.ownerId && (rdata.ownerId == accs.userData.id  || accs.userData.isAdmin)" @click="deletePost" type="submit" value="Delete!">
    </div>
    <div v-else id="viewerOptions">
      <input type="url" :value="generateRunCommand()" @keydown.prevent @click="(e)=>{
        (e.target as HTMLInputElement).setSelectionRange(0,(e.target as HTMLInputElement).value.length)
        copyToClipboard((e.target as HTMLInputElement).value);
      }">
      <a :href="`${API_ENDPOINT}post/${$route.params.id}/raw?attachment=true`"><input type="button" value="Download"></a>
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
      font-size: 10px;
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
      font-size: 20px !important;
    }
  }

  #copyBtn {
    position: absolute;
    top: 10px;
    right: 10px;
    z-index: 101;
    cursor: pointer;
    padding: 5px;
    border-radius: 100%;
    border: 1px solid transparent;
  }
  #copyBtn:hover {
    background-color: #0003;
  }
</style>