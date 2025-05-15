"use client";

import { useAuth } from "@/hooks/useAuth";
import { Channel } from "@/types/types";
import axios from "axios";
import { useEffect, useState } from "react";
import { toast } from "react-toastify";
import { BellRing } from "lucide-react";
import { useRouter } from "next/navigation";
import ChannelSidebar from "@/components/app/channels/ChannelSidebar";
export default function ChannelsPage() {
  const [channels, setChannels] = useState<Channel[]>([]);
  console.log("🚀 ~ ChannelsPage ~ channels:", channels);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  const { requireAuth, isLoggedIn } = useAuth();
  console.log("🚀 ~ ChannelsPage ~ isLoggedIn:", isLoggedIn);

  useEffect(() => {
    if (isLoggedIn === null) return;
    const fetchChannels = async () => {
      try {
        const response = await axios.get(`/api/channels`, {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        });
        const data = response.data.channels;
        setChannels(data);
      } catch (error) {
        console.log("🚀 ~ fetchChannels ~ error:", error);
        toast.error("Error al obtener los canales");
      } finally {
        setIsLoading(false);
      }
    };
    requireAuth(fetchChannels);
  }, [isLoggedIn]);

  return (
    <div className="flex w-full h-screen ">
      <div className="w-3/4">
        <h1>Canales</h1>
      </div>
      <ChannelSidebar channels={channels} />
    </div>
  );
}
