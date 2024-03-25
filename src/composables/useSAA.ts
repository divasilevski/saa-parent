import { ref, watch } from "vue";

declare global {
  interface Document {
    requestStorageAccessFor(origin: string): Promise<undefined>;
    // requestStorageAccess(): Promise<undefined>;
    // hasStorageAccess(): Promise<boolean>;
  }
}

interface EventMessageData {
  event: string;
  status: PermissionState | "not-supported";
  cookie: string;
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
  const iframeSAA = ref<PermissionState | "not-supported">("not-supported");
  const iframe = ref();
  const iframeClickStatus = ref();

  const messageListener = (event: MessageEvent) => {
    if (event.origin !== "https://saa-server.vercel.app") return;

    try {
      const data: EventMessageData = JSON.parse(event.data);
      if (data.event === "SAAStatus") {
        iframeSAA.value = data.status;
      }
      if (data.event === "SAAClick") {
        iframeClickStatus.value = data.status;
        console.log("click");
      }
    } catch (error) {}
  };

  const createEmbed = (selector: string) => {
    return new Promise((resolve, reject) => {
      const $iframe = document.createElement("iframe");
      const $el = document.querySelector(selector);

      $iframe.style.position = "absolute";
      $iframe.style.width = $el?.clientWidth + "px";
      $iframe.style.height = $el?.clientHeight + "px";
      $iframe.style.display = "none";
      // $iframe.style.left = "-9999px";
      // $iframe.style.clipPath = "circle(0)";

      $iframe.onload = () => {
        iframe.value = $iframe;
        window.addEventListener("message", messageListener);
        resolve(true);
      };

      $iframe.onerror = () => {
        reject(new Error("Failed to load iframe"));
      };

      $el?.appendChild($iframe);
      $iframe.src = "https://saa-server.vercel.app";
    });
  };

  const removeEmbed = () => {
    window.removeEventListener("message", messageListener);
    if (iframe.value) iframe.value.remove();
  };

  watch(iframeSAA, () => {
    if (iframeSAA.value === "prompt") {
      iframe.value.style.display = "block";
    }
    if (iframeSAA.value === "granted" || iframeSAA.value === "denied") {
      removeEmbed();
    }
  });

  return {
    topLevelSAA,
    checkTopLevelSAA,
    rSAAFor,

    iframeSAA,
    iframeClickStatus,
    createEmbed,
    removeEmbed,
  };
}
