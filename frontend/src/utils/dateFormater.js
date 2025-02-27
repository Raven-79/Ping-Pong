export function formatDate(date) {
  const days = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

  const adjustedDate = new Date(date);
  adjustedDate.setHours(date.getHours() + 1);

  const day = days[adjustedDate.getDay()];
  const hours = String(adjustedDate.getHours()).padStart(2, "0");
  const minutes = String(adjustedDate.getMinutes()).padStart(2, "0");

  return `${day} ${hours}:${minutes}`;
}

export function getUserbadge(level) {
  if (level < 5) {
    return "img/lvl05.png";
  }
  if (level < 10) {
    return "img/lvl04.png";
  }
  if (level < 20) {
    return "img/lvl03.png";
  }
  if (level < 40) {
    return "img/lvl02.png";
  }

  return "img/lvl01.png";
}
