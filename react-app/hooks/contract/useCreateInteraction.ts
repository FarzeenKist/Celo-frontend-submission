import { Dispatch, SetStateAction } from "react";
import { waitForTransaction } from "wagmi/actions";
import { toast } from "react-toastify";


export default function useCreateInteraction(
  interaction: any,
  setLoading: Dispatch<SetStateAction<string>>,
  openConnectModal: any,
  address: any,
  clear: () => void,
  setError: Dispatch<SetStateAction<string>>,
  toastMessages: {
    pending: string;
    success: string;
    error: string;
  },
  loadingMsg: string
) {
  const handleInteraction =  async() => {
    if (!interaction) {
      throw "Invalid interaction";
    }
    setLoading(loadingMsg);
    try {
      // Execute the transaction
      const res = await interaction();
      // Wait for the transaction to be mined
      await waitForTransaction({ hash: res.hash });
    } catch (e) {
      throw e;
    }
  };

  // Create the callback that handles the states for the notifications and handles the interaction trigerred
  const configuredInteraction = async () => {
    clear();
    try {
      // If the user is not connected, trigger the wallet connect modal
      if (!address && openConnectModal) {
        openConnectModal();
        return;
      }
      // If the user is connected, call the handleReview function and display a notification
      await toast.promise(handleInteraction(), toastMessages);
      // If there is an error, display the error message
    } catch (e: any) {
      console.log({ e });
      setError(e?.reason || e?.message || "Something went wrong. Try again.");
      // Once the transaction is complete, clear the loading state
    } finally {
      setLoading("");
    }
  };

  return configuredInteraction;
}
