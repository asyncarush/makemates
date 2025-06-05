import { formatDistanceToNow } from "date-fns";

interface TimeAgoProps {
  timestamp: string | number | Date;
}

export const TimeAgo: React.FC<TimeAgoProps> = ({ timestamp }) => {
  return (
    <span>{formatDistanceToNow(new Date(timestamp), { addSuffix: true })}</span>
  );
};
