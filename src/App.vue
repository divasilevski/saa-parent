<template>
  <header>
    <h1>SAA + SSO Demo</h1>
    <div>
      <a target="_blank" :href="siteUrl">Another domain</a>
      <Loader v-if="isLoading" />
      <button v-else-if="!user" @click="onSignIn">Sign In</button>
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
    <hr>
    <button v-if="user" @click="logout">Logout</button>
  </main>
</template>

<script setup>
import { onMounted, computed, ref } from "vue";
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

const onSignIn = () => {
  isModalOpen.value = true;
};

const {
  authToken,
  removeAuthToken,

  isLoading,
  user,

  signIn,
  logout,
} = useAuth();

const onLogin = () => {
  signIn();
  onClose();
  // if ("requestStorageAccessFor" in document) {
  //   document
  //     .requestStorageAccessFor("https://saa-server.vercel.app")
  //     .then(
  //       (res) => {
  //         fetch("https://saa-server.vercel.app/api/auth", {
  //           method: "POST",
  //           body: JSON.stringify({ data: "data" }),
  //           credentials: "include",
  //         })
  //           .then((data) => data.text())
  //           .then((data) => {
  //             console.log(data)
  //             cookie.set('auth-token', 'test-auth-token')
  //             onClose()
  //           });
  //       },
  //       (err) => {
  //         console.log(err);
  //       }
  //     );
  // }
};

// const onToken = () => {
//   if ("requestStorageAccessFor" in document) {
//     document.requestStorageAccessFor("https://saa-server.vercel.app").then(
//       (res) => {
//         fetch("https://saa-server.vercel.app/api/token", {
//           credentials: "include",
//         })
//           .then((data) => data.text())
//           .then((data) => {
//             console.log(data);
//           });
//       },
//       (err) => {
//         console.log(err);
//       }
//     );
//   }
// };

onMounted(() => {
  window.addEventListener("message", (event) => {
    console.log("message", event.data);
  });

  // navigator.permissions
  //   .query({
  //     name: "top-level-storage-access",
  //     requestedOrigin: "https://saa-server.vercel.app",
  //   })
  //   .then((res) => {
  //     if (res.state === "granted") {
  //       // Permission has already been granted
  //       // You can request storage access without any user gesture
  //       rSAFor();
  //     } else if (res.state === "prompt") {
  //       // Requesting storage access requires user gesture
  //       // For example, clicking a button
  //       // const btn = document.createElement("button");
  //       // btn.textContent = "Grant access";
  //       // btn.addEventListener("click", () => {
  //       //   // Request storage access
  //       //   rSAFor();
  //       // });
  //       // document.body.appendChild(btn);
  //     }
  //   });
});
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
