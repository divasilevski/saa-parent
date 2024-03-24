import { ref, computed, onMounted } from "vue";
import { useCookies } from "@vueuse/integrations/useCookies";
import { getUser, postAuthLogin, postAuthLogout, getAuthToken } from "../api";

export default function useAuth() {
  const user = ref<null | object>(null);
  const isLoading = ref(false);
  const cookie = useCookies();

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

  onMounted(async () => {
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

    isLoading,
    user,

    signIn,
    logout,
  };
}
