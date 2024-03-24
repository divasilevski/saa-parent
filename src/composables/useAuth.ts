import { ref, computed, onMounted } from "vue";
import { useCookies } from "@vueuse/integrations/useCookies";
import { getUser, postAuthLogin, postAuthLogout, getAuthToken } from "../api";

export default function useAuth() {
  const user = ref<null | object>(null);
  const isLoading = ref(false);
  const cookie = useCookies();

  const topLevelSA = ref<"granted" | "prompt" | "not-support">("not-support");

  const authToken = computed(() => cookie.get("auth-token"));

  const removeAuthToken = () => {
    cookie.remove("auth-token");
  };

  const fetchUser = async () => {
    isLoading.value = true;
    try {
      user.value = await getUser(authToken.value);
    } catch (error) {}
    isLoading.value = false;
  };

  const signIn = async () => {
    try {
      const data = await postAuthLogin({});

      if (data.success) {
        cookie.set("auth-token", data.token);
        fetchUser();
      }
    } catch (error) {}
  };

  const signInSA = async () => {
    if (topLevelSA.value === "prompt") {
      await rSAFor();
    }

    if (!authToken.value) {
      await fetchTokenBySSO();
    }

    if (authToken.value) {
      await fetchUser();
      return true;
    }

    return false;
  };

  const fetchTokenBySSO = async () => {
    try {
      const data = await getAuthToken();

      if (data.success) {
        cookie.set("auth-token", data.token);
      }
    } catch (error) {}
  };

  const logout = async () => {
    try {
      const data = await postAuthLogout({});

      if (data.success) {
        user.value = null;
        cookie.remove("auth-token");
      }
    } catch (error) {}
  };

  const checkTopLevelSA = async () => {
    // try catch ... but i want see errors
    if ("requestStorageAccessFor" in document) {
      const response = await navigator.permissions.query({
        name: "top-level-storage-access",
        requestedOrigin: "https://saa-server.vercel.app",
      });

      topLevelSA.value = response.state;
    }
  };

  const rSAFor = async () => {
    if ("requestStorageAccessFor" in document) {
      try {
        await document.requestStorageAccessFor("https://saa-server.vercel.app");
      } catch (error) {
        console.warn(error);
      }
    }
  };

  onMounted(async () => {
    await checkTopLevelSA();

    if (topLevelSA.value === "granted") {
      await rSAFor();
    }

    if (!authToken.value) {
      await fetchTokenBySSO();
    }

    if (authToken.value) {
      await fetchUser();
    }
  });

  return {
    authToken,
    removeAuthToken,
    topLevelSA,

    isLoading,
    user,

    signIn,
    signInSA,
    logout,
  };
}
