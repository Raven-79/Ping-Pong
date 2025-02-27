import { h, defineComponent } from "../../../../lib/index.js";
import { i18n } from "../../../utils/i18n.js";

export const RoundedChart = defineComponent({
  state() {
    return {
      playerLvl: 0,
      lvlFractions: 0,
    };
  },
  render() {
    return (
      <div className="">
        <h4>{i18n.t("profile.level")} {this.state.playerLvl}</h4>
        <canvas id="chartCanvas" width="300" height="300"></canvas>
      </div>
    );
  },
  onMounted() {
    const needPoint = Math.pow(2, this.props.userLevel ) * 10;
    this.$updateState({
      playerLvl: this.props.userLevel,
      lvlFractions:Math.round((this.props.userExp / needPoint) * 100) ,
    });
    const canvas = document.getElementById("chartCanvas");
    const ctx = canvas.getContext("2d");

    let startAngle = (3 * Math.PI) / 2; 
    let endAngle = startAngle;
    const targetEndAngle =
      startAngle + 2 * Math.PI * (this.state.lvlFractions / 100);
    const animationDuration = 1000; 
    let startTime = null;

    const animate = (timestamp) => {
      if (!startTime) startTime = timestamp;
      const elapsedTime = timestamp - startTime;
      const progress = elapsedTime / animationDuration;

      endAngle = startAngle + (targetEndAngle - startAngle) * progress;

      ctx.clearRect(0, 0, canvas.width, canvas.height);

      ctx.beginPath();
      ctx.arc(150, 150, 130, 0, Math.PI * 2, false);
      ctx.strokeStyle = "#ffffff26";
      ctx.lineWidth = 15;
      ctx.stroke();

      ctx.beginPath();
      ctx.arc(150, 150, 130, startAngle, endAngle, false);
      ctx.strokeStyle = "#088395";
      ctx.lineWidth = 15;
      ctx.stroke();

      ctx.font = "30px Arial";
      ctx.fillStyle = "#ffffff";
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.fillText(
        `${Math.floor(this.state.lvlFractions * progress)}%`,
        150,
        150
      );

      if (elapsedTime < animationDuration) {
        requestAnimationFrame(animate);
      } else {
        endAngle = targetEndAngle;
        ctx.beginPath();
        ctx.arc(150, 150, 130, startAngle, endAngle, false);
        ctx.stroke();
        ctx.fillText(`${this.state.lvlFractions}%`, 150, 150);
      }
    }

    requestAnimationFrame(animate);
  },
});
