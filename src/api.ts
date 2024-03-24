interface Response {
  success: boolean;
  token: string;
}

function postAuthLogin(data: object) {
  return new Promise<Response>((resolve, reject) => {
    fetch("https://saa-server.vercel.app/api/auth", {
      method: "POST",
      body: JSON.stringify({ data }),
      credentials: "include",
    })
      .then((data) => data.json())
      .then((data) => resolve(data))
      .catch(() => reject());
  });
}

function postAuthLogout(data: object) {
  return new Promise<Response>((resolve, reject) => {
    fetch("https://saa-server.vercel.app/api/logout", {
      method: "POST",
      body: JSON.stringify({ data }),
      credentials: "include",
    })
      .then((data) => data.json())
      .then((data) => resolve(data))
      .catch(() => reject());
  });
}

function getAuthToken() {
  return new Promise<Response>((resolve, reject) => {
    fetch("https://saa-server.vercel.app/api/token", { credentials: "include" })
      .then((data) => data.json())
      .then((data) => resolve(data))
      .catch(() => reject());
  });
}

function getUser(token: string) {
  return new Promise<object>((resolve, reject) => {
    setTimeout(() => {
      if (token === "test-auth-token") {
        resolve({ username: "User" });
      } else {
        reject();
      }
    }, 1000);
  });
}

export { postAuthLogin, postAuthLogout, getAuthToken, getUser };
