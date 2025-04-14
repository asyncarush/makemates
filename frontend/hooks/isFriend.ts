import { API_ENDPOINT } from "@/axios.config";
import { AuthContext } from "@/app/context/AuthContext";
import axios from "axios";
import { useState, useEffect, useContext } from "react";

// Check user if User Follow to Other user
export function useFollowed(friendId: number) {
  const [isFollowed, setIsFollowed] = useState(false);
  const { currentUser }: any = useContext(AuthContext);

  useEffect(() => {
    const getResult = async () => {
      try {
        const res = await axios.post(
          `${API_ENDPOINT}/search/checkFollowed`,
          { friendId },
          { withCredentials: true }
        );
        setIsFollowed(res.data === "USER_FOUND");
      } catch (err) {
        console.error(err);
        setIsFollowed(false);
      }
    };

    if (friendId) {
      getResult();
    }
  }, [friendId, currentUser?.id]); // Add currentUser.id as dependency

  return { isFollowed, setIsFollowed };
}
