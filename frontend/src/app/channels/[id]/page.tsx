"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { Channel, ChannelPost } from "@/types/types";
import { ChannelPostCard } from "@/components/app/channel-post-card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { Loader2, Send } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { formatDistanceToNow } from "date-fns";
import { es } from "date-fns/locale";
import axios from "axios";
import ChannelSidebar from "@/components/app/channels/ChannelSidebar";
import { Input } from "@/components/ui/input";

export default function ChannelPage() {
  const params = useParams();
  const [channel, setChannel] = useState<Channel | null>(null);
  const [channels, setChannels] = useState<Channel[]>([]);
  const [posts, setPosts] = useState<ChannelPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [newPost, setNewPost] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    fetchChannel();
    fetchPosts();
  }, [params.id]);

  useEffect(() => {
    fetchChannels();
  }, []);

  const fetchChannels = async () => {
    const response = await axios.get("/api/channels", {
      headers: {
        Authorization: `Bearer ${localStorage.getItem("token")}`,
      },
    });
    const data = await response.data;
    setChannels(data.channels);
  };

  const fetchChannel = async () => {
    try {
      const response = await axios.get(`/api/channels/${params.id}`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });
      const data = response.data;
      setChannel(data.channel);
    } catch (error) {
      toast.error("Error al cargar el canal");
      console.error(error);
    }
  };

  const fetchPosts = async () => {
    try {
      const response = await axios.get(`/api/channels/${params.id}/posts`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });
      const data = await response.data;
      setPosts(data.posts);
    } catch (error) {
      toast.error("Error al cargar los posts");
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmitPost = async () => {
    if (!newPost.trim()) return;

    setIsSubmitting(true);
    try {
      const response = await axios.post(
        `/api/channels/${params.id}/posts`,
        { content: newPost },
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );

      const data = await response.data;
      setPosts([data.post, ...posts]);
      setNewPost("");
      toast.success("Post creado exitosamente");
    } catch (error) {
      toast.error("Error al crear el post");
      console.error(error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeletePost = (postId: number) => {
    setPosts(posts.filter((post) => post.PostID !== postId));
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!channel) {
    return (
      <div className="text-center py-8">
        <p className="text-muted-foreground">Canal no encontrado</p>
      </div>
    );
  }

  return (
    <div className="flex w-full h-screen">
      <div className="container mx-auto p-2 w-3/4">
        <Card className="mb-2">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-2xl">{channel.Name}</CardTitle>
                <p className="text-muted-foreground">
                  {channel.University?.Name} - {channel.Career?.Name}
                </p>
              </div>
              <div className="flex items-center gap-2">
                <div>
                  <p className="text-sm font-medium">{channel.Creator?.name}</p>
                  <p className="text-xs text-muted-foreground">
                    Creado{" "}
                    {formatDistanceToNow(new Date(channel.CreatedAt), {
                      addSuffix: true,
                      locale: es,
                    })}
                  </p>
                </div>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">{channel.Description}</p>
          </CardContent>
        </Card>

        <div className="mb-2">
          <div className="flex gap-2">
            <Input
              placeholder="Escribe un nuevo post..."
              value={newPost}
              onChange={(e) => setNewPost(e.target.value)}
              className="flex-1"
            />
            <Button
              onClick={handleSubmitPost}
              disabled={isSubmitting || !newPost.trim()}
            >
              {isSubmitting ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Send className="h-4 w-4" />
              )}
            </Button>
          </div>
        </div>

        <div className="space-y-1">
          {posts.map((post) => (
            <ChannelPostCard
              key={post.PostID + Math.random()}
              post={post}
              onDelete={() => handleDeletePost(post.PostID)}
              isAdmin={isAdmin}
            />
          ))}
        </div>
      </div>
      <ChannelSidebar channels={channels} />
    </div>
  );
}
