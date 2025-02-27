import { h, Fragment, defineComponent, createApp } from "../../../lib/index.js";
import { BACKEND_URL, myFetch } from "../../utils/apiRequest.js";
import { LoginButton } from "./LoginButton.js";
import { Store, updateStore } from "../../../lib/store.js";
import { i18n } from "../../utils/i18n.js";

export const Verify2FA = defineComponent({
  state() {
    return {
      code: "",
      verifying: false,
      error: false,
      serverError: false,
    };
  },
  render() {
    if (Store.userData) {
      this.$context.router.navigateTo("/");
    }
    return (
      <form className="sky-bg">
        <div className="vh-100 d-flex justify-content-center align-items-center c-welcoming-animation ">
          <div className="p-2   position-relative c-login-bg border">
            {/* <div
            className="position-absolute c-close-login m-2 fs-3 text-light"
            on:click={() => this.$emit("changeState")}
          >
            <i className="fa-solid fa-xmark " role="button"></i>
          </div> */}
            <div className="m-2 text-center text-light m-3 mb-4">
              <h2 className="mb-0">Hello !</h2>
            </div>
            <div className="m-2 c-input-h">
              <input
                type="text"
                className="form-control h-100 w-100 c-login-input-box"
                placeholder="Enter 2FA code"
                on:input={(e) => {
                  this.$updateState({ code: e.target.value });
                }}
              ></input>
            </div>
            {this.state.error ? (
              <div className="m-2 text-danger ps-3 ">Incorrect code</div>
            ) : (
              <></>
            )}
            {this.state.serverError ? (
              <div className="m-2 text-danger ps-3 ">
                Somthing went wrong, please try again later
              </div>
            ) : (
              <></>
            )}
            <div className="m-2 mt-3">
              <LoginButton
                content="Verify"
                disabled={this.state.code.length < 6}
                loginInProgress={this.state.verifying}
                on:click={() => {
                  this.verify2FACode(this.state.code);
                }}
              />
            </div>
          </div>
        </div>
      </form>
    );
  },
  methods: {
    async verify2FACode(code) {
      const response = await fetch(`${BACKEND_URL}/auth/verify_2fa_tmp/`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          otp_code: code,
        }),
      });
      if (response.ok) {
        const data = await response.json();
        const accessToken = data.access;
        localStorage.setItem("access_token", accessToken);
        // console.log("Login successful, access token stored.");
        const user = await fetchUserData();
        updateStore({ userData: user, needs_2fa: user == null });
        // console.log("User data fetched", Store.userData);
        this.$context.router.navigateTo("/");
        return accessToken;
      } else if (response.status === 400) {
        this.$updateState({ verifying: false, error: true });
      } else {
        const data = await response.json();
        // console.log("Login failed.", data);
        this.$updateState({ verifying: false, serverError: true });
        // this.$emit("changeState");
      }
    },
  },
});

export async function fetchUserData() {
  const profile = await myFetch(`${BACKEND_URL}/manage/profile/`);
  if (!profile.ok) {
    return null;
  }
  const userData = await profile.json();
  i18n.locale = userData.language;
  return userData;
}
