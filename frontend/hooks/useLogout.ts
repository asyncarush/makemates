import { API_ENDPOINT } from "@/axios.config";
import { AuthContext } from "@/app/context/AuthContext";
import axios from "axios";
import { useContext } from "react";
import { useRouter } from "next/navigation";

export function useLogout() {
  const { setCurrentUser } = useContext(AuthContext) || {};

  const router = useRouter();

  const logout = async () => {
    try {
      const response = await axios.post(
        `${API_ENDPOINT}/user/logout`,
        {},
        { withCredentials: true }
      );

      if (response.status === 200) {
        // Clear local storage
        localStorage.removeItem("currentUser");
        localStorage.removeItem("auth_token");
      }

      // Reset auth context
      setCurrentUser(null);

      // Redirect to login page
      router.push("/");
    } catch (error) {
      console.error("Error during logout:", error);
      // Even if the API call fails, we should still clear local state
      localStorage.removeItem("currentUser");
      localStorage.removeItem("auth_token");
      setCurrentUser(null);
      router.push("/");
    }
  };

  return logout;
}
