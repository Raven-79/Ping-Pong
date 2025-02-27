import { h, defineComponent } from "../../../../lib/index.js";
import { myFetch,BACKEND_URL } from "../../../utils/apiRequest.js";
import { i18n } from "../../../utils/i18n.js";

export const Charts = defineComponent({
  state() {
    return{
      statics :[
        
      ]
    }
  },
  render() {
    // const props = [
    //   { win: 0, lose: 0 },
    //     { win: 0, lose: 0 },
    //     { win: 0, lose: 0 },
    //     { win: 0, lose: 0 },
    // ];

    const maxValue = Math.max(
      ...this.state.statics.flatMap((item) => [item.win, item.lose])
    );
    const yAxisMax = Math.ceil(maxValue / 3) * 3;
    const yAxisValues = [0, 1, 2, 3, 4].map((i) =>
      Math.ceil((yAxisMax / 4) * (4 - i))
    );

    return (
      <div>
        <div className="row my-2 mx-3">
          <p className="col-12 col-lg-6 m-0 ps-2 text-center  text-lg-start ">
            {i18n.t("profile.playerPerformance")}
          </p>
          <div className="col-12 col-lg-6 d-flex justify-content-center justify-content-lg-end">
            <p className="m-0 d-flex align-items-center pe-2">
              W <div className="c-win-box ms-2"></div>
            </p>
            <p className="m-0 d-flex align-items-center">
              L <div className="c-lose-box ms-2"></div>
            </p>
          </div>
        </div>
        <div className="position-relative p-3 " style={{ height: "300px" }}>
          <div className="position-absolute d-flex flex-column justify-content-between c-y-axis">
            {yAxisValues.map((value) => (
              <div key={value} className="text-white-50 small">
                {value}
              </div>
            ))}
          </div>

          <div className="position-absolute d-flex justify-content-around align-items-end gap-4 z-1 c-charts-section">
            {this.state.statics.map((item, index) => (
              <div
                key={index}
                className="d-flex align-items-end h-100  gap-1"
                style={{
                  width: `${100 / this.state.statics.length}%`,
                }}
              >
                <div
                  className="chart-line-win w-50"
                  style={{
                    height: `${(item.win / yAxisMax) * 100}%`,
                  }}
                />
                <div
                  className="chart-line-lose w-50"
                  style={{
                    height: `${(item.lose / yAxisMax) * 100}%`,
                  }}
                />
              </div>
            ))}
          </div>
          <div className="position-absolute d-flex justify-content-around gap-4 c-labels">
            {["W3", "W2", "W1", "W0"].map((item) => (
              <div
                className="text-white-50 text-center small"
                style={{
                  width: `${100 / this.state.statics.length}%`,
                }}
              >
                {item}
              </div>
            ))}
          </div>

          <div className="position-absolute d-flex flex-column justify-content-between c-bg-lines">
            {[0, 1, 2, 3, 4].map((_, index) => (
              <div
                key={index}
                className="w-100"
                style={{ borderTop: "1px solid rgba(255,255,255,0.1)" }}
              />
            ))}
          </div>
        </div>
      </div>
    );
  },
  async onMounted() {
    const userId = this.$context.router.params.id;
    let response;
    if (!userId) {
      response = await myFetch(`${BACKEND_URL}/manage/week-statics/`);
    } else {
      response = await myFetch(
        `${BACKEND_URL}/manage/week-statics/${userId}/`
      );
    }
    if (response.ok) {
      const data = await response.json();
      if(data.length < 4){
        for(let i = data.length; i < 4; i++){
          data.push({ win: 0, lose: 0 });
        }
      }
      this.$updateState({ statics: data });
    } else {
      console.log("error");
    }
  },
});
