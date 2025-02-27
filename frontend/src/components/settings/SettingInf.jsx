import { h, defineComponent, Fragment } from "../../../lib/index.js";
import { InputField } from "./InputField.js";
import { NickName } from "./NickName.js";
import { TwoFA } from "./TwoFA.js";
import { i18n } from "../../utils/i18n.js";
import { setLanguage } from "../../utils/language.js";
import { objectsDiff } from "../../../lib/utils/objects.js";
import { Toast } from "../common/Toast.js";
import { myFetch, BACKEND_URL } from "../../utils/apiRequest.js";
//md
export const SettingInf = defineComponent({
  state() {
    return {
      toast: null,
      first_name: "",
      last_name: "",
      display_name: "",
      bio: "",
      language: "",
      // password: "",
      // oldPassword: "",
      // passwordError: null,
      // oldPasswordError: null,
    };
  },
  render() {
    return (
      <div className=" d-flex justify-content-center pt-2">
        {this.state.toast}
        <form className="col-12 col-lg-8 col-xl-6">
          <div className="row ">
            <InputField
              type="text"
              className="col-12 col-md-6 text-start mb-3  p-2"
              label={i18n.t("settings.firstName")}
              error={this.getError(this.state.first_name)}
              value={this.state.first_name}
              on:inputChange={(input) =>
                this.$updateState({
                  first_name: input.value,
                })
              }
            />

            <InputField
              type="text"
              className="col-12 col-md-6 text-start mb-3  p-2"
              label={i18n.t("settings.lastName")}
              error={this.getError(this.state.last_name)}
              value={this.state.last_name}
              on:inputChange={(input) =>
                this.$updateState({
                  last_name: input.value,
                })
              }
            />
          </div>
          <InputField
            type="text"
            className="row mb-3 text-start p-2"
            label={i18n.t("settings.displayName")}
            error={
              this.state.display_name.length === 0
                ? "This faild can't be empty."
                : null
            }
            value={this.state.display_name}
            on:inputChange={(input) =>
              this.$updateState({
                display_name: input.value,
              })
            }
          />
          {/* {this.props.userData.login_mode === "email" ? (
            <div>
              <InputField
                type="password"
                className="row mb-3 text-start p-2"
                label="New Password"
                error={this.state.passwordError}
                value=""
                on:inputChange={(input) =>
                  this.$updateState({
                    password: input.value,
                  })
                }
              />
              <InputField
                type="password"
                className="row mb-3 text-start p-2"
                label="Old Password"
                error={this.state.oldPasswordError}
                value=""
                on:inputChange={(input) =>
                  this.$updateState({
                    oldPassword: input.value,
                  })
                }
              />
            </div>
          ) : (
            <></>
          )} */}

          <div className="row mb-3">
            <div class="mb-3 text-start ">
              <label for="exampleInputEmail1" class="form-label ps-3">
                {i18n.t("settings.language")}
              </label>
              <select
                id="laguage"
                class="form-select c-floating-input border-0 "
                aria-label="Default select example"
                on:change={(e) => {
                  this.$updateState({
                    language: e.target.value,
                  });
                }}
                value={i18n.locale}
              >
                <option value="en">English</option>
                <option value="fr">Français</option>
                <option value="sp">Español</option>
              </select>
            </div>
          </div>

          <TwoFA user2FA={this.props.userData.is_2fa_enabled} />
          <div className=" mb-3 d-flex justify-content-end">
            <button
              type="submit"
              className="btn c-btn mx-1"
              disabled={this.hasError()}
              on:click={() => this.updateData()}
            >
              {i18n.t("settings.save")}
            </button>
          </div>
        </form>
      </div>
    );
  },
  methods: {
    updateData() {
      // this.$updateState({
      //   passwordError: null,
      //   oldPasswordError: null,
      // });
      // console.log(
      //   "updateData -> this.state.password",
      //   this.state.password.length
      // );
      // if (this.state.password.length > 0 && this.state.password.length < 6) {
      //   this.$updateState({
      //     passwordError: "Password must be at least 6 characters",
      //   });
      //   return;
      // }
      // if (
      //   this.state.password.length > 0 &&
      //   this.state.oldPassword.length === 0
      // ) {
      //   this.$updateState({
      //     oldPasswordError: "Old password is required",
      //   });
      //   return;
      // }

      this.$emit("updateData", {
        first_name: this.state.first_name,
        last_name: this.state.last_name,
        display_name: this.state.display_name,
        bio: this.state.bio,
        language: this.state.language,
        
      });
      // password: this.state.password,
      // oldPassword: this.state.oldPassword,
    },
    isValidName(name) {
      name = name.trim();
      const nameRegex = /^[a-zA-Z\s'-]+$/;
      const isLengthValid = name.length >= 2 && name.length <= 50;
      return nameRegex.test(name) && isLengthValid;
    },
    getError(name) {
      if (name.length === 0) {
        return i18n.t("errors.fieldRequired");
      } else if (!this.isValidName(name)) {
        return i18n.t("errors.invalidInput");
      }
      return null;
    },
    hasError() {
      return (
        this.getError(this.state.first_name) ||
        this.getError(this.state.last_name)
      );
    },
    updateUserInf() {
      this.$updateState({
        toast: (
          <Toast
            type="success"
            message="Your changes has been saved"
            on:closeToast={() => this.$updateState({ toast: null })}
          />
        ),
      });
    },
  },
  onMounted() {
    this.$updateState({
      first_name: this.props.userData.first_name,
      last_name: this.props.userData.last_name,
      display_name: this.props.userData.display_name,
      bio: this.props.userData.bio,
      language: this.props.userData.language,
    });
    const language = document.getElementById("laguage");
    if (this.props.userData.language === "fr") {
      const optionToSelect = language.querySelector('option[value="fr"]');
      optionToSelect.selected = true;
    }
    if (this.props.userData.language === "sp") {
      const optionToSelect = language.querySelector('option[value="sp"]');
      optionToSelect.selected = true;
    }
    if (this.props.userData.language === "en") {
      const optionToSelect = language.querySelector('option[value="en"]');
      optionToSelect.selected = true;
    }
  },
});
