<template>
  <header>
    <div>
      SAA + SSO Demo
    </div>
    <div>
      <button @click="onLogin">Login</button>
      <button @click="onSignIn">Token</button>
    </div>
  </header>

  <!-- <iframe
      src="https://saa-server.vercel.app"
      sandbox="allow-storage-access-by-user-activation allow-scripts allow-same-origin"
    ></iframe> -->
</template>

<script setup>
import { onMounted } from 'vue'

const onLogin = () => {
  if ("requestStorageAccessFor" in document) {
    document
      .requestStorageAccessFor("https://saa-server.vercel.app")
      .then(
        (res) => {
          fetch("https://saa-server.vercel.app/api/auth", {
            method: "POST",
            body: JSON.stringify({ data: "data" }),
            credentials: "include",
          })
            .then((data) => data.text())
            .then((data) => console.log(data));
        },
        (err) => {
          console.log(err);
        }
      );
  }
}

const onSignIn = () => {
  if ("requestStorageAccessFor" in document) {
    document
      .requestStorageAccessFor("https://saa-server.vercel.app")
      .then(
        (res) => {
          fetch("https://saa-server.vercel.app/api/token", {
            credentials: "include",
          })
            .then((data) => data.text())
            .then((data) => console.log(data));
        },
        (err) => {
          console.log(err);
        }
      );
  }
}

onMounted(() => {
  window.addEventListener("message", (event) => {
    console.log("message", event.data);
  });

  navigator.permissions
    .query({
      name: "top-level-storage-access",
      requestedOrigin: "https://saa-server.vercel.app",
    })
    .then((res) => {
      if (res.state === "granted") {
        // Permission has already been granted
        // You can request storage access without any user gesture
        rSAFor();
      } else if (res.state === "prompt") {
        // Requesting storage access requires user gesture
        // For example, clicking a button
        // const btn = document.createElement("button");
        // btn.textContent = "Grant access";
        // btn.addEventListener("click", () => {
        //   // Request storage access
        //   rSAFor();
        // });
        // document.body.appendChild(btn);
      }
    });
})
</script>

<style scoped></style>
