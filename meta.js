let isConnected = false;

const disconnect = async () => {
  try {
    const response = await fetch("/disconnect");
    if (!response.ok) {
      throw new Error(`Error disconnecting: ${response.statusText}`);
    }
    console.log("Disconnected successfully");
    const connectText = document.getElementById('connect');
    connectText.textContent = "Connect";
    isConnected = false;
  } catch (error) {
    console.error("Error during disconnect:", error);
  }
};
const checkSession = async () => {

    try {
      const connectText = document.getElementById('connect');
      console.log("Checking session...");
      const response = await fetch("/check");
      if (!response.ok) {
        throw new Error(`Error checking session: ${response.statusText}`);
      }

      const data = await response.json();
      const { success, walletAddress } = data;
      
      if (success) {
        connectText.text('Disconnect');
        isConnected = true;
      } else {
        connectText.text("Connect");
        isConnected = false;
      }
    } catch (error) {
      console.error("Error checking session:", error);
      isConnected = false;
    }
  };
module.exports = { disconnect, checkSession, isConnected };
