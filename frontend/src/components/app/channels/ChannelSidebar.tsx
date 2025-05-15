import { Channel } from "@/types/types";
import { BellRing } from "lucide-react";
import { useRouter } from "next/navigation";

export default function ChannelSidebar({ channels }: { channels: Channel[] }) {
  const router = useRouter();

  return (
    <div className="w-1/4 max-w-64  gap-2 border h-full rounded-md my-2">
      <h1 className="text-xl font-bold text-center my-2 border-b">Canales</h1>
      {channels.map((channel) => (
        <button
          key={channel.ChannelID}
          className="flex w-full items-center justify-between space-x-4 border p-1 px-2 hover:bg-gray-100 cursor-pointer transition-all duration-300"
          onClick={() => {
            router.push(`/channels/${channel.ChannelID}`);
          }}
        >
          <div className="flex-1 space-y-1">
            <p className="text-sm font-medium leading-none">{channel.Name}</p>
            <p className="text-sm text-muted-foreground">
              {channel.Description}
            </p>
          </div>
          <BellRing size={16} />
        </button>
      ))}
    </div>
  );
}
