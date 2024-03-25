import { ref } from "vue";

declare global {
  interface Document {
    requestStorageAccessFor(origin: string): Promise<undefined>;
    // requestStorageAccess(): Promise<undefined>;
    // hasStorageAccess(): Promise<boolean>;
  }
}

export default function useSAA() {
  const topLevelSAA = ref<PermissionState | "not-supported">("not-supported");

  const checkTopLevelSAA = async () => {
    // try catch ... but i want see errors
    if ("requestStorageAccessFor" in document) {
      const response = await navigator.permissions.query({
        name: "top-level-storage-access" as PermissionName,
        requestedOrigin: "https://saa-server.vercel.app",
      } as PermissionDescriptor);

      topLevelSAA.value = response.state;
    }
  };

  const rSAAFor = async () => {
    if ("requestStorageAccessFor" in document) {
      try {
        await document.requestStorageAccessFor("https://saa-server.vercel.app");
      } catch (error) {
        console.warn(error);
      }
    }
  };

  // ---------------------------

  const iframe = ref();

  const messageListener = (event: MessageEvent) => {
    console.log("message", event.data);
  };

  const createEmbed = () => {
    return new Promise((resolve, reject) => {
      const $iframe = document.createElement("iframe");
      $iframe.style.position = "fixed";
      $iframe.style.left = "-9999px";
      $iframe.style.display = "none";
      $iframe.style.clipPath = "circle(0)";

      $iframe.onload = () => {
        iframe.value = $iframe;
        window.addEventListener("message", messageListener);
        resolve(true);
      };

      $iframe.onerror = () => {
        reject(new Error("Failed to load iframe"));
      };

      document.body.appendChild($iframe);
      $iframe.src = "https://saa-server.vercel.app";
    });
  };

  const removeEmbed = () => {
    window.removeEventListener("message", messageListener);
    if (iframe.value) iframe.value.remove();
  };

  return {
    topLevelSAA,
    checkTopLevelSAA,
    rSAAFor,

    createEmbed,
    removeEmbed,
  };
}
