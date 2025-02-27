import { h, defineComponent } from "../../../lib/index.js";

export const NoDataMessage = defineComponent({
    render() {
      return (
        <div className="d-flex  justify-content-center align-items-center c-no-result py-3 h-100">
          <div>
           
            <img src={this.props.iconPath} alt="" className=" c-no-result-icon my-4" />
            <div className="mb-3">
              <h5>{this.props.message}</h5>
            </div>
          </div>
        </div>
      );
    },
  });