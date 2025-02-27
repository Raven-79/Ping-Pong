import { h, Fragment, defineComponent, createApp } from "../../../lib/index.js";
import { notify } from "../../../lib/store.js";
import { BACKEND_URL } from "../../utils/apiRequest.js";
import { LoginButton } from "./LoginButton.js";

export const LogIn = defineComponent({
  state() {
    return {
      userName: "",
      password: "",
      loginError: "",
      loginInProgress: false,
    };
  },
  render() {
    return (
      <form className="vh-100 d-flex justify-content-center align-items-center c-welcoming-animation ">
        <div className="p-2   position-relative c-login-bg border">
          <div
            className="position-absolute c-close-login m-2 fs-3 text-light"
            on:click={() => this.$emit("changeState")}
          >
            <i className="fa-solid fa-xmark " role="button"></i>
          </div>
          <div className="m-2 text-center text-light m-3 mb-4">
            <h2 className="mb-0">Hello !</h2>
            <h2>Welcome Back</h2>
          </div>
          <div className="m-2 c-input-h">
            <input
              type="text"
              className="form-control h-100 w-100 c-login-input-box"
              placeholder="User name"
              on:input={(e) => {
                this.$updateState({ userName: e.target.value });
              }}
            ></input>
          </div>
          <div className="m-2 c-input-h">
            <input
              type="password"
              className="form-control h-100 w-100 c-login-input-box"
              placeholder="password"
              on:input={(e) => {
                this.$updateState({ password: e.target.value });
              }}
            ></input>
          </div>
          {this.state.loginError.length > 0 ? (
            <div className="m-2 text-danger ps-3 ">
              Incorrect login or password
            </div>
          ) : (
            <></>
          )}
          <div className="m-2 mt-3">
            <LoginButton
              content="Login"
              disabled={
                this.state.userName.length < 3 || this.state.password.length < 6
              }
              loginInProgress={this.state.loginInProgress}
              on:click={() => {
                this.$updateState({ loginError: false });
                this.loginUser(this.state.userName, this.state.password);
              }}
            />
          </div>
          <div className="m-2 ">
            <a
              href={`${BACKEND_URL}/auth/intra_login/`}
              className="btn c-btn-danger w-100"
            >
              Login with 42
            </a>
          </div>
          <div className=" m-2 p-2  text-start text-light">
            <p className="mb-0">
              Don't have an account?{" "}
              <a
                href="#"
                className="text-light"
                on:click={() => this.$emit("singUp")}
              >
                Sign up
              </a>
            </p>
          </div>
        </div>
      </form>
    );
  },
  methods: {
    async loginUser(username, password) {
      if (username.length < 3 || password.length < 6) return;
      this.$updateState({ loginInProgress: true });
      try {
        const response = await fetch(`${BACKEND_URL}/auth/api/token/`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ username, password }),
        });
        // console.log("Login response:", response);
        if (response.ok) {
          const data = await response.json();
          if (data["2FA_required"]) {
            // this.$context.router.navigateTo("/verify-2fa");
          this.$emit("verify2FA");
            return;
          }

          const accessToken = data.access;
          localStorage.setItem("access_token", accessToken);
          // console.log("Login successful, access token stored.");
          this.$emit("loggedIn");
        

          return accessToken;
        } else if (response.status === 401) {
          this.$updateState({ loginError: response.statusText, loginInProgress: false });
        } else {
          // console.error("Login failed:", response.statusText);
          notify("error", "Something went wrong, please try again later.");
          //TODO: need to recheck this
          this.$updateState({ loginInProgress: false , loginError: response.statusText });

          return null;
        }
      } catch (error) {
        
        console.error("An error occurred:", error);
        return null;
      }
    },
  },
});
