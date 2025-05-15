import { useEffect, useState } from "react";
import { Channel } from "@/types/types";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Loader2, Users, Lock } from "lucide-react";
import axios from "axios";

export function ChannelList() {
  const [channels, setChannels] = useState<Channel[]>([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    fetchChannels();
  }, []);

  const fetchChannels = async () => {
    try {
      const response = await axios.get("/api/channels", {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });
      const data = await response.data;
      setChannels(data.channels);
    } catch (error) {
      toast.error("Error al cargar los canales");
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[200px]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (channels.length === 0) {
    return (
      <div className="text-center py-8">
        <p className="text-muted-foreground">No tienes canales disponibles</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {channels.map((channel) => (
        <Card
          key={channel.ChannelID}
          className="hover:shadow-lg transition-shadow"
        >
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-xl">{channel.Name}</CardTitle>
              {channel.IsPrivate && (
                <Lock className="h-4 w-4 text-muted-foreground" />
              )}
            </div>
            <CardDescription>
              {channel.University?.Name} - {channel.Career?.Name}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground line-clamp-2">
              {channel.Description}
            </p>
            <div className="flex items-center gap-2 mt-2 text-sm text-muted-foreground">
              <Users className="h-4 w-4" />
              <span>{channel.Members?.length || 0} miembros</span>
            </div>
          </CardContent>
          <CardFooter>
            <Button
              onClick={() => router.push(`/channels/${channel.ChannelID}`)}
              className="w-full"
            >
              Ver canal
            </Button>
          </CardFooter>
        </Card>
      ))}
    </div>
  );
}
