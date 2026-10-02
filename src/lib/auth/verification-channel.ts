// Email verify hone ki khabar ek tab se doosre tab tak (same browser, same origin).
// Gmail ka link naya tab kholta hai; ye us tab se purane "check email" tab ko batata hai.
// BroadcastChannel ke saath localStorage "storage" event fallback hai (purane browsers).

const channelName = "nexhire.email-verification";
const storageKey = "nexhire.email-verified-at";

export function announceEmailVerified() {
  try {
    const channel = new BroadcastChannel(channelName);
    channel.postMessage("verified");
    channel.close();
  } catch {
    // BroadcastChannel unavailable: storage event neeche kaam karega.
  }
  try {
    window.localStorage.setItem(storageKey, String(Date.now()));
    window.localStorage.removeItem(storageKey);
  } catch {
    // Storage blocked: user "Already verified? Log in" se khud ja sakta hai.
  }
}

export function onEmailVerified(callback: () => void): () => void {
  let channel: BroadcastChannel | null = null;
  try {
    channel = new BroadcastChannel(channelName);
    channel.onmessage = () => callback();
  } catch {
    channel = null;
  }

  function handleStorage(event: StorageEvent) {
    if (event.key === storageKey && event.newValue) callback();
  }
  window.addEventListener("storage", handleStorage);

  return () => {
    channel?.close();
    window.removeEventListener("storage", handleStorage);
  };
}
