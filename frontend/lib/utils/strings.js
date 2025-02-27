export function isNotEmptyString(str) {
  return str !== "";
}
export function isNotBlankOrEmptyString(str) {
  return isNotEmptyString(str.trim());
}
export function isStrigable(elem) {
  return (
    typeof elem === "string" ||
    typeof elem === "number" ||
    typeof elem === "boolean" ||
    typeof elem === "bigint" ||
    typeof elem === "symbol"
  );
}
