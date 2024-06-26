<template>
  <header>
    <h1>SAA + SSO Demo</h1>
    <div>
      <a target="_blank" :href="siteUrl">Another domain</a>
      <Loader v-if="isLoading" />
      <div v-show="!isLoading && !user" id="signBtn">
        <button @click="onSignIn">Sign In</button>
      </div>
      <div>{{ user?.username }}</div>
    </div>
  </header>

  <dialog v-if="isModalOpen">
    <span>Auth modal</span>
    <button @click="onLogin">Login/Register</button>
    <div class="close" @click="onClose">✖</div>
  </dialog>

  <main>
    Tokens:
    <div>
      <b>authToken:</b> {{ authToken }}
      <input v-if="authToken" type="button" value="remove" @click="removeAuthToken" />
    </div>
    <div><b>topLevelSAA:</b> {{ topLevelSAA }}</div>
    <div><b>iframeSAA:</b> {{ iframeSAA }}</div>
    <div><b>iframeClickStatus:</b> {{ iframeClickStatus }}</div>
    <hr>
    <button @click="ensureLoginAnd">Ensure Login</button>
    <button v-if="user" @click="logout">Logout</button>
  </main>
</template>

<script setup>
import { onMounted, computed, ref, watch } from "vue";
import Loader from "./components/Loader.vue";
import useAuth from "./composables/useAuth";

const SITES = [
  "https://master--melodious-marigold-1931f5.netlify.app/",
  "https://divasilevski.github.io/saa-parent/",
];

const isModalOpen = ref(false);

const siteUrl = computed(() => {
  return SITES[0].includes(window.location.origin) ? SITES[1] : SITES[0];
});

const onClose = () => {
  isModalOpen.value = false;
};

const {
  authToken,
  removeAuthToken,
  topLevelSAA,
  iframeSAA,
  iframeClickStatus,

  isLoading,
  user,

  signIn,
  signInSA,
  logout,
} = useAuth(isModalOpen);

const onSignIn = async () => {
  const isSuccess = await signInSA()
  if (!isSuccess) {
    isModalOpen.value = true;
  }
};

const onLogin = () => {
  signIn();
  onClose();
};


const ensureLoginAnd = async () => {
  if (!user.value) {
    const isSuccess = await signInSA()
    if (!isSuccess) {
      isModalOpen.value = true;
    }
  }
}

watch(iframeClickStatus, () => {
  if (iframeClickStatus.value === 'start') {
    isLoading.value = true
  }
  if (iframeClickStatus.value === 'end') {
    isLoading.value = false
    ensureLoginAnd()
  }
})
</script>

<style scoped>
header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 16px;
  background-color: white;
  box-shadow: 0px 10px 4px -7px rgba(0, 0, 0, 0.11);
}

header div {
  display: flex;
  align-items: center;
  gap: 16px;
}

main {
  padding: 16px;
}

dialog {
  position: fixed;
  inset: 0;
  display: flex;
  flex-direction: column;
  gap: 16px;
  border: none;
  border-radius: 8px;
  box-shadow: 0px 0px 60px 0px rgba(0, 0, 0, 0.15);
}

dialog .close {
  position: absolute;
  right: -20px;
  top: -20px;
  background: white;
  height: 16px;
  height: 16px;
  border-radius: 100%;
  cursor: pointer;
}
</style>
