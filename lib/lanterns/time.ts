export function addMillisecondsToClock(
  clock: string,
  deltaMilliseconds: number,
) {
  const match = clock.match(/^(\d{2}):(\d{2}):(\d{2})\.(\d{3})$/);

  if (!match) {
    throw new Error("Clock value must use HH:MM:SS.mmm.");
  }

  const [, hours, minutes, seconds, milliseconds] = match;
  const dayMilliseconds = 24 * 60 * 60 * 1000;
  const initial =
    Number(hours) * 60 * 60 * 1000 +
    Number(minutes) * 60 * 1000 +
    Number(seconds) * 1000 +
    Number(milliseconds);

  const wrapped =
    ((initial + deltaMilliseconds) % dayMilliseconds + dayMilliseconds) %
    dayMilliseconds;

  const hh = Math.floor(wrapped / (60 * 60 * 1000));
  const mm = Math.floor((wrapped % (60 * 60 * 1000)) / (60 * 1000));
  const ss = Math.floor((wrapped % (60 * 1000)) / 1000);
  const ms = wrapped % 1000;

  return [
    String(hh).padStart(2, "0"),
    String(mm).padStart(2, "0"),
    `${String(ss).padStart(2, "0")}.${String(ms).padStart(3, "0")}`,
  ].join(":");
}
