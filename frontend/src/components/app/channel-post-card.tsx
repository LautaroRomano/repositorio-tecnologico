import { useState } from "react";
import { ChannelPost } from "@/types/types";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { toast } from "sonner";
import { formatDistanceToNow } from "date-fns";
import { es } from "date-fns/locale";
import { Heart, MessageCircle, Download, Loader2 } from "lucide-react";
import axios from "axios";
import { Input } from "../ui/input";
import { useAuth } from "@/hooks/useAuth";

interface ChannelPostCardProps {
  post: ChannelPost;
  onDelete?: () => void;
  isAdmin?: boolean;
}

export function ChannelPostCard({
  post,
  onDelete,
  isAdmin,
}: ChannelPostCardProps) {
  const [comment, setComment] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLiking, setIsLiking] = useState(false);

  const { me } = useAuth();

  const handleComment = async () => {
    if (!comment.trim()) return;

    setIsSubmitting(true);
    try {
      const response = await axios.post(
        `/api/channels/posts/${post.PostID}/comments`,
        {
          content: comment,
        },
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );

      if (response.status !== 200) {
        throw new Error("Error al agregar el comentario");
      }

      toast.success("Comentario agregado exitosamente");
      setComment("");
      const newComment = response.data.comment;
      post.Comments = [...(post.Comments || []), newComment];
    } catch (error) {
      toast.error("Error al agregar el comentario");
      console.error(error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleLike = async () => {
    setIsLiking(true);
    try {
      const response = await axios.post(
        `/api/channels/posts/${post.PostID}/like`,
        {},
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );

      if (response.status === 201) {
        // Like agregado
        post.Likes = [...(post.Likes || []), response.data.like];
      } else if (response.status === 200) {
        // Like quitado
        post.Likes =
          post.Likes?.filter((like) => like.UserID !== me?.UserID) || [];
      }
    } catch (error) {
      toast.error("Error al procesar el like");
      console.error(error);
    } finally {
      setIsLiking(false);
    }
  };

  const handleDelete = async () => {
    if (!confirm("¿Estás seguro de que deseas eliminar este post?")) return;

    try {
      const response = await axios.delete(
        `/api/channels/posts/${post.PostID}`,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );

      if (response.status !== 200) {
        throw new Error("Error al eliminar el post");
      }

      toast.success("Post eliminado exitosamente");
      onDelete?.();
    } catch (error) {
      toast.error("Error al eliminar el post");
      console.error(error);
    }
  };

  return (
    <Card className="mb-4">
      <CardHeader className="flex flex-row items-center gap-4">
        <Avatar>
          <AvatarImage src={post.User?.Avatar} />
          <AvatarFallback>{post.User?.Username?.[0]}</AvatarFallback>
        </Avatar>
        <div className="flex-1">
          <div className="flex items-center justify-between">
            <div>
              <p className="font-semibold">{post.User?.Username}</p>
              <p className="text-sm text-muted-foreground">
                {formatDistanceToNow(new Date(post.CreatedAt), {
                  addSuffix: true,
                  locale: es,
                })}
              </p>
            </div>
            {(post.UserID === post.UserID || isAdmin) && (
              <Button
                variant="ghost"
                size="sm"
                onClick={handleDelete}
                className="text-destructive hover:text-destructive"
              >
                Eliminar
              </Button>
            )}
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <p className="whitespace-pre-wrap">{post.Content}</p>
        {post.Files && post.Files.length > 0 && (
          <div className="mt-4 space-y-2">
            {post.Files.map((file) => (
              <div
                key={file.FileID}
                className="flex items-center justify-between p-2 bg-muted rounded-lg"
              >
                <div className="flex items-center gap-2">
                  <span className="text-sm truncate">{file.FileName}</span>
                  <span className="text-xs text-muted-foreground">
                    ({file.FileType})
                  </span>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => window.open(file.FileURL, "_blank")}
                >
                  <Download className="h-4 w-4" />
                </Button>
              </div>
            ))}
          </div>
        )}
      </CardContent>
      <CardFooter className="flex flex-col gap-4">
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="sm"
            onClick={handleLike}
            disabled={isLiking}
            className="flex items-center gap-1"
          >
            {isLiking ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Heart
                className={`h-4 w-4 ${
                  post.Likes?.some((like) => like.UserID === post.UserID)
                    ? "fill-current text-red-500"
                    : ""
                }`}
              />
            )}
            <span>{post.Likes?.length || 0}</span>
          </Button>
          <div className="flex items-center gap-1 text-muted-foreground">
            <MessageCircle className="h-4 w-4" />
            <span>{post.Comments?.length || 0}</span>
          </div>
        </div>

        {post.Comments && post.Comments.length > 0 && (
          <div className="w-full space-y-2">
            {post.Comments.map((comment) => (
              <div
                key={comment.CommentID}
                className="flex items-start gap-2 p-2 bg-muted rounded-lg"
              >
                <Avatar className="h-6 w-6">
                  <AvatarImage src={comment.User?.Avatar} />
                  <AvatarFallback>{comment.User?.Username?.[0]}</AvatarFallback>
                </Avatar>
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <p className="text-sm font-semibold">
                      {comment.User?.Username}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {formatDistanceToNow(new Date(comment.CreatedAt), {
                        addSuffix: true,
                        locale: es,
                      })}
                    </p>
                  </div>
                  <p className="text-sm">{comment.Content}</p>
                </div>
              </div>
            ))}
          </div>
        )}

        <div className="flex gap-2 w-full">
          <Input
            placeholder="Escribe un comentario..."
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            className="flex-1"
          />
          <Button
            onClick={handleComment}
            disabled={isSubmitting || !comment.trim()}
          >
            {isSubmitting ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              "Comentar"
            )}
          </Button>
        </div>
      </CardFooter>
    </Card>
  );
}
