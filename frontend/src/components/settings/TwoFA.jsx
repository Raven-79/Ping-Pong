import { h, defineComponent, Fragment } from "../../../lib/index.js";

import { i18n } from "../../utils/i18n.js";
import { myFetch, BACKEND_URL } from "../../utils/apiRequest.js";
import { notify } from "../../../lib/store.js";

export const TwoFA = defineComponent({
  state() {
    return {
      twofaIsEnabled: false,
      enableTfa: false,
      generatedCode: "",
      genCodeHasError: false,
    };
  },
  render() {
    if (!this.state.twofaIsEnabled)
      return (
        <div className="">
          <div className=" mb-3 d-flex justify-content-between align-items-center text-start ">
            <p className="m-0 ps-3">{i18n.t("settings.twoFactorAuth")}</p>
          </div>
          <div className="mb-3 d-flex row text-start c-floating-input-2fa  position-relative .blur-effect">
            <div
              className={`position-absolute top-0 start-0 w-100 h-100   d-flex justify-content-center align-items-center c-blur-dev ${
                this.state.enableTfa ? "d-none" : ""
              }`}
            >
              <div className="text-center">
                <p>{i18n.t("settings.enable2FA")}</p>
                <button
                  className="btn btn-success"
                  on:click={() => this.$updateState({ enableTfa: true })}
                >
                  <i class="fa-solid fa-shield-halved pe-2"></i>
                  {i18n.t("settings.enable")}
                </button>
              </div>
            </div>
            <div className="col-12 col-md-4 d-flex justify-content-center justify-content-md-start align-items-center">
              <img id="qr-code" className="c-qr-img p-2 " />
            </div>
            <form class="col-12 col-md-8 my-3 d-flex flex-column gap-2 ">
              <div className="text-center text-md-start ">
                <div>{i18n.t("settings.enterPin")}</div>
                <div class="d-flex justify-content-center justify-content-md-start mt-3">
                  <input
                    type="text"
                    className=" c-pin-input text-center"
                    placeholder="123456"
                    id="pin-input"
                    on:input={(e) =>
                      this.$updateState({ generatedCode: e.target.value })
                    }
                  />
                </div>
                <div>
                  {this.state.genCodeHasError ? (
                    <div class="text-danger m-1">
                      <p>{i18n.t("settings.invalidCode")}</p>
                    </div>
                  ) : (
                    <></>
                  )}
                </div>
              </div>
              <div className="d-flex justify-content-center justify-content-md-end my-2">
                <button
                  type="submit"
                  className="btn c-btn"
                  id="enable-2fa-btn"
                  disabled={this.state.generatedCode.length !== 6}
                  on:click={() => this.varifyCode(this.state.generatedCode)}
                >
                  <i class="fa-solid fa-shield-halved pe-2"></i>
                  {i18n.t("settings.enable2FA")}
                </button>
              </div>
            </form>
          </div>
        </div>
      );
    return (
      <div className="d-flex justify-content-center align-items-center c-floating-input-2fa  mb-3 p-3">
        <div className="text-center">
          <p>{i18n.t("settings.disable2FA")}</p>
          <button className="btn btn-danger" on:click={() => this.disable2FA()}>
            <i class="fa-solid fa-x pe-2"></i>
            {i18n.t("settings.disable")}
          </button>
        </div>
      </div>
    );
  },
  methods: {
    inputBluer(e) {
      this.$updateState({ generatedCode: e.target.value });
      if (e.target.value.length === 6)
        document.getElementById("pin-input").blur();
    },
    async varifyCode(code) {
      const response = await myFetch(`${BACKEND_URL}/auth/verify-otp/`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ otp_code: code }),
      });
      if (!response.ok) {
        const data = await response.json();
        this.$updateState({ genCodeHasError: true });
        return;
      }
      this.updateUser2FA(true);
    },
    async updateUser2FA(value) {
      const response = await myFetch(`${BACKEND_URL}/manage/update_user/`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ is_2fa_enabled: value }),
      });
      if (response.status === 200) {
        this.$updateState({ twofaIsEnabled: value });
      } else {
        notify("error", "Error while updating 2FA");
      }
    },
    async getQrCode() {
      const response = await myFetch(`${BACKEND_URL}/auth/generate-qr/`);
      if (!response.ok) {
        // console.log("QR Code response",response);
        // throw new Error(`HTTP error! status: ${response.status}`);
        notify("error", "Error while generating QR code");
      }

      const blob = await response.blob();

      const qrCodeUrl = URL.createObjectURL(blob);
      const qrCodeImage = document.getElementById("qr-code");

      qrCodeImage.src = qrCodeUrl;
    },
    async disable2FA() {
      this.updateUser2FA(false);
      this.getQrCode();
    },
  },
  async onMounted() {
    this.$updateState({ twofaIsEnabled: this.props.user2FA });
    if (!this.props.user2FA) {
      this.getQrCode();
    }
  },
});
