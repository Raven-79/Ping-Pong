import { h, Fragment, defineComponent, createApp } from "../../../lib/index.js";
import { BACKEND_URL, myFetch } from "../../utils/apiRequest.js";
import { LoginButton } from "./LoginButton.js";

export const SignUp = defineComponent({
  state() {
    return {
      first_name: "",
      last_name: "",
      user_name: "",
      password: "",
      email: "",
      singUpError: "",

      singUpInProgress: false,
    };
  },
  render() {
    return (
      <form>
        <div className="vh-100 d-flex justify-content-center align-items-center c-welcoming-animation ">
          <div className="p-2   position-relative c-login-bg border">
            <div
              className="position-absolute c-close-login m-2 fs-3 text-light"
              on:click={() => this.$emit("changeState")}
            >
              <i className="fa-solid fa-xmark " role="button"></i>
            </div>
            <div className="m-2 text-center text-light m-3 mb-4">
              <h2>Welcome</h2>
            </div>
            <div className="m-2 c-input-h d-flex justify-content-between gap-1">
              <input
                type="text"
                className="form-control h-100 c-login-input-box"
                placeholder="First name"
                on:input={(e) => {
                  this.$updateState({ first_name: e.target.value });
                }}
              ></input>
              <input
                type="text"
                className="form-control h-100  c-login-input-box"
                placeholder="Last name"
                on:input={(e) => {
                  this.$updateState({ last_name: e.target.value });
                }}
              ></input>
            </div>
            <div className="m-2 c-input-h">
              <input
                type="text"
                className="form-control h-100 w-100 c-login-input-box"
                placeholder="User name"
                on:input={(e) => {
                  this.$updateState({ user_name: e.target.value });
                }}
              ></input>
            </div>
            <div className="m-2 c-input-h">
              <input
                type="email"
                className="form-control h-100 w-100 c-login-input-box"
                placeholder="Email"
                on:input={(e) => {
                  this.$updateState({ email: e.target.value });
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
            {this.state.loginError ? (
              <div className="m-2 text-danger ps-3 ">
                Incorrect login or password
              </div>
            ) : (
              <></>
            )}
            <div>
              {this.state.singUpError.length > 0 ? (
                <div className="m-2 text-danger ps-3 ">
                  {this.state.singUpError}
                </div>
              ) : (
                <></>
              )}
            </div>
            <div className="m-2 mt-3">
              <LoginButton
                content="SingUp"
                disabled={
                  this.state.first_name.length < 3 ||
                  this.state.last_name.length < 3 ||
                  this.state.user_name.length < 3 ||
                  this.state.email.length < 6 ||
                  this.state.password.length < 6
                }
                loginInProgress={this.state.singUpInProgress}
                on:click={() => {
                  this.$updateState({ singUpError: false });
                  this.singUpUser(
                    this.state.first_name,
                    this.state.last_name,
                    this.state.user_name,
                    this.state.email,
                    this.state.password
                  );
                }}
              />
            </div>
            <div className=" m-2 p-2  text-start text-light">
              <p className="mb-0">
                Already regestered or have intra 42 account?{" "}
                <a
                  href="#"
                  className="text-light"
                  on:click={() => this.$emit("login")}
                >
                  LogIn
                </a>
              </p>
            </div>
          </div>
        </div>
      </form>
    );
  },
  methods: {
    async singUpUser(first_name, last_name, user_name, email, password) {
      this.$updateState({ singUpError: "" });
      if (!this.isValidName(first_name) || !this.isValidName(last_name)) {
        this.$updateState({
          singUpError: "First and last name must contain only letters.",
        });
        return;
      }
      this.$updateState({ singUpInProgress: true });
      try {
        const response = await fetch(`${BACKEND_URL}/auth/signup/`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            first_name,
            last_name,
            user_name,
            email,
            password,
          }),
        });
        if (response.status === 201) {
          const data = await response.json();
          const accessToken = data.access;
          localStorage.setItem("access_token", accessToken);
          // console.log("Login successful after SingUp, access token stored.");
          this.$emit("loggedIn");
          // this.$updateState({ singUpInProgress: false });

          return accessToken;
        } else if (response.status === 400) {
          const data = await response.json();
          this.$updateState({
            singUpError: data.error,
            singUpInProgress: false,
          });
        } else {
          console.error("Login failed:", response.statusText);
          this.$updateState({ singUpInProgress: false });
          return null;
        }
      } catch (error) {
        console.error("Error:", error);
        this.$updateState({ singUpInProgress: false });
      }
    },
    isValidName(name) {
      name = name.trim();
      const nameRegex = /^[a-zA-Z\s'-]+$/;
      const isLengthValid = name.length >= 2 && name.length <= 50;
      return nameRegex.test(name) && isLengthValid;
    },
  },
});
