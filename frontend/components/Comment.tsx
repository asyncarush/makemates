import Image from "next/image";
import React, { useEffect, useRef, useState } from "react";
import { formatDistanceToNow } from "date-fns";
import { Send, X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useGetCommentReplies, useNewReply } from "@/lib/mutations";

function Comment({ cmnt }: any) {
  const replyToCommentRef = useRef<HTMLDivElement>(null);
  const [isReplyToComment, setIsReplyToComment] = useState(false);
  const [replyText, setReplyText] = useState("");
  const [showReplies, setShowReplies] = useState(false);
  const postNewReplyMutation = useNewReply();

  const { data: replies = [] } = useGetCommentReplies(cmnt.id);

  const handleReplyToComment = (cmntId: number) => {
    setIsReplyToComment(true);
    setReplyText("");
    // Small delay to ensure the reply box is rendered before scrolling
    setTimeout(() => {
      replyToCommentRef.current?.scrollIntoView({
        behavior: "smooth",
        block: "center",
        inline: "nearest",
      });
    }, 10);
  };

  const handleSubmitReply = () => {
    if (!replyText.trim()) return;
    // send Reply
    postNewReplyMutation.mutate({
      parentCommentId: cmnt.id,
      desc: replyText,
      postId: cmnt.post_id,
    });

    // Reset after submission
    setReplyText("");
    setIsReplyToComment(false);
  };

  return cmnt ? (
    <div key={cmnt.id} className="group pl-4 flex items-start space-x-1">
      <div className="flex items-center justify-center">
        <Image
          src={cmnt?.users?.img || "/avatar.png"}
          className="rounded-full bg-blue-500 flex items-center justify-center border-2 border-gray-200"
          width="30"
          height="30"
          alt={`${cmnt?.users?.name}'s profile picture`}
        />
      </div>
      <div className="flex flex-col gap-1 w-full ">
        <div className="flex gap-1 items-center justify-center w-fit">
          <p className="font-medium text-[10px] text-gray-900 truncate px-1 py-0.5 bg-slate-200 rounded-full">
            {cmnt?.users?.name}
          </p>
          <span className="text-[10px] text-gray-500">
            {cmnt.datetime ? <TimeAgo timestamp={cmnt.datetime} /> : "2m ago"}
          </span>
        </div>
        <div>
          <p className="text-xs text-gray-700">{cmnt.desc}</p>
        </div>
        {/* need to work on this */}
        <div className="flex items-center mt-0.5 px-2">
          <div className="opacity-100 group-hover:opacity-100 transition-opacity flex items-center space-x-3">
            <button
              className="text-[11px] text-gray-500 hover:text-rose-500 flex items-center gap-1.5 transition-colors duration-150 p-1 -ml-1 rounded-md hover:bg-rose-50"
              title="Like"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="14"
                height="14"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="w-3 h-3"
              >
                <path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z" />
              </svg>
              <span>Like</span>
            </button>
            <button
              className="text-[11px] text-gray-500 hover:text-blue-500 flex items-center gap-1.5 transition-colors duration-150 p-1 -ml-1 rounded-md hover:bg-blue-50"
              onClick={() => handleReplyToComment(cmnt.id)}
              title="Reply"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="14"
                height="14"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="w-3 h-3"
              >
                <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
              </svg>
              <span>Reply</span>
            </button>

            <AnimatePresence>
              {isReplyToComment && (
                <motion.div
                  ref={replyToCommentRef}
                  className="w-full"
                  initial={{ opacity: 0, height: 0, marginTop: 0 }}
                  animate={{
                    opacity: 1,
                    height: "auto",
                    marginTop: "0.375rem",
                  }}
                  exit={{ opacity: 0, height: 0, marginTop: 0 }}
                  transition={{ duration: 0.2, ease: "easeInOut" }}
                >
                  <div className="relative flex items-center">
                    <input
                      type="text"
                      value={replyText}
                      onChange={(e) => setReplyText(e.target.value)}
                      placeholder="Write a reply..."
                      className="flex-1 w-full px-3 py-2 pr-14 text-xs bg-gray-50 rounded-xl border-0 shadow-sm focus:ring-1 focus:ring-blue-300/50 focus:bg-white/50 transition-all duration-200 placeholder:text-gray-400"
                      onKeyDown={(e) =>
                        e.key === "Enter" &&
                        replyText.trim() &&
                        handleSubmitReply()
                      }
                      autoFocus
                    />
                    <div className="absolute right-1 flex space-x-1">
                      <motion.button
                        onClick={() => {
                          setReplyText("");
                          setIsReplyToComment(false);
                        }}
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.95 }}
                        className="p-1.5 text-gray-400 hover:text-gray-600 hover:bg-gray-100/50 rounded-full transition-all duration-200"
                        title="Cancel"
                      >
                        <X className="w-4 h-4" />
                      </motion.button>
                      <motion.button
                        onClick={() => replyText.trim() && handleSubmitReply()}
                        disabled={!replyText.trim()}
                        whileHover={replyText.trim() ? { scale: 1.1 } : {}}
                        whileTap={replyText.trim() ? { scale: 0.95 } : {}}
                        className={`p-1.5 rounded-full transition-all duration-200 ${
                          replyText.trim()
                            ? "text-blue-500 hover:text-blue-600 hover:bg-blue-50/50"
                            : "text-gray-300 cursor-not-allowed"
                        }`}
                        title="Send reply"
                      >
                        <Send className="w-4 h-4" />
                      </motion.button>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>

        {replies.length > 0 && (
          <div>
            {!showReplies ? (
              <button
                onClick={() => setShowReplies(true)}
                className="text-[10px] text-gray-500"
              >
                View replies
              </button>
            ) : (
              <>
                <button
                  onClick={() => setShowReplies(false)}
                  className="text-[10px] text-gray-500"
                >
                  Hide replies
                </button>
                {showReplies && replies.length > 0 && (
                  <div className="pl-4 mt-1 flex flex-col gap-2">
                    {replies.map((reply: any) => (
                      <Comment key={reply.id} cmnt={reply} />
                    ))}
                  </div>
                )}
              </>
            )}
          </div>
        )}
      </div>
    </div>
  ) : null;
}

const TimeAgo = ({ timestamp }: { timestamp: string | number | Date }) => {
  return (
    <span>{formatDistanceToNow(new Date(timestamp), { addSuffix: true })}</span>
  );
};

export default Comment;
