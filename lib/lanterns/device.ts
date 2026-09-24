export function createRingSerial() {
  const random = new Uint32Array(1);
  window.crypto.getRandomValues(random);
  return `2814-${String(random[0] % 100000000).padStart(8, "0")}`;
}

export function ringFeedback(
  kind: "soft" | "confirm" | "alert",
  options: { sound?: boolean; haptics?: boolean } = {},
) {
  if (typeof window === "undefined") return;

  const { sound = true, haptics = true } = options;

  if (haptics && "vibrate" in navigator) {
    navigator.vibrate(
      kind === "alert" ? [18, 32, 26] : kind === "confirm" ? [12, 18, 22] : 8,
    );
  }

  if (!sound) return;

  try {
    const audio = new AudioContext();
    const oscillator = audio.createOscillator();
    const gain = audio.createGain();
    const now = audio.currentTime;

    oscillator.type = "sine";
    oscillator.frequency.setValueAtTime(
      kind === "alert" ? 180 : kind === "confirm" ? 420 : 320,
      now,
    );
    oscillator.frequency.exponentialRampToValueAtTime(
      kind === "alert" ? 92 : kind === "confirm" ? 720 : 410,
      now + 0.16,
    );

    gain.gain.setValueAtTime(0.0001, now);
    gain.gain.exponentialRampToValueAtTime(
      kind === "confirm" ? 0.055 : 0.03,
      now + 0.018,
    );
    gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.2);

    oscillator.connect(gain);
    gain.connect(audio.destination);
    oscillator.start(now);
    oscillator.stop(now + 0.22);
    oscillator.addEventListener("ended", () => {
      void audio.close();
    });
  } catch {
    // Sound is enhancement only; browser policy or device support may block it.
  }
}
