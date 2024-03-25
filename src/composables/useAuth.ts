import { ref, computed, onMounted, onUnmounted } from "vue";
import { useCookies } from "@vueuse/integrations/useCookies";
import { getUser, postAuthLogin, postAuthLogout, getAuthToken } from "../api";
import useSAA from "./useSAA";

export default function useAuth() {
  const isLoading = ref(false);
  const user = ref<null | object>(null);

  const cookie = useCookies();
  const authToken = computed(() => cookie.get("auth-token"));

  const {
    topLevelSAA,
    checkTopLevelSAA,
    rSAAFor,

    iframeSAA,
    createEmbed,
    removeEmbed,
    iframeClickStatus,
  } = useSAA();

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
        cookie.set("auth-token", data.token, {
          sameSite: "none",
          maxAge: 3600000,
          secure: true,
        });
        fetchUser();
      }
    } catch (error) {}
  };

  const signInSA = async () => {
    if (topLevelSAA.value === "prompt") {
      await rSAAFor();
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
        cookie.set("auth-token", data.token, {
          sameSite: "none",
          maxAge: 3600000,
          secure: true,
        });
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

  onMounted(async () => {
    await checkTopLevelSAA();

    if (topLevelSAA.value === "granted") {
      await rSAAFor();
    }

    if (topLevelSAA.value === "not-supported") {
      await createEmbed("#signBtn");
    }

    if (!authToken.value) {
      await fetchTokenBySSO();
    }

    if (authToken.value) {
      await fetchUser();
    }
  });

  onUnmounted(() => {
    if (topLevelSAA.value === "not-supported") {
      removeEmbed();
    }
  });

  return {
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
  };
}
