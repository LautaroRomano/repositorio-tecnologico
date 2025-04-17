import { useState } from "react";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { FaUser, FaHeart, FaRegHeart, FaComment, FaTag, FaUniversity, FaGraduationCap } from "react-icons/fa";
import { MdAttachFile } from "react-icons/md";
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { motion } from "framer-motion";
import { Post } from "@/types/types";
import axios from "axios";
import { toast } from "react-toastify";

interface PostCardProps {
  post: Post;
  requireAuth: (action: () => void) => void;
}

const PostCard = ({ post, requireAuth }: PostCardProps) => {
  const [showComments, setShowComments] = useState(false);
  const [isLiked, setIsLiked] = useState(false);
  const [likeCount, setLikeCount] = useState(post.Likes.length);
  const [commentText, setCommentText] = useState("");
  
  // Función para formatear la fecha
  const formatDate = (dateString: string) => {
    try {
      const date = new Date(dateString);
      return format(date, "d 'de' MMMM, yyyy • HH:mm", { locale: es });
    } catch (e) {
      return dateString;
    }
  };
  
  const handleLike = async () => {
    requireAuth(async () => {
      try {
        if (isLiked) {
          // Llamada para quitar el like
          await axios.delete(`/posts/${post.PostID}/likes`);
          setLikeCount(prev => prev - 1);
        } else {
          // Llamada para dar like
          await axios.post(`/posts/${post.PostID}/likes`);
          setLikeCount(prev => prev + 1);
        }
        setIsLiked(!isLiked);
      } catch (error) {
        toast.error("Error al procesar tu acción");
      }
    });
  };

  const handleComment = async () => {
    if (!commentText.trim()) return;
    
    requireAuth(async () => {
      try {
        // Aquí iría la lógica para enviar el comentario
        // await axios.post(`/posts/${post.PostID}/comments`, { content: commentText });
        
        toast.success("Comentario añadido");
        setCommentText("");
        // Actualizaríamos los comentarios aquí con setComments o similar
      } catch (error) {
        toast.error("Error al publicar el comentario");
      }
    });
  };

  const handleShowComments = () => {
    requireAuth(() => {
      setShowComments(!showComments);
    });
  };

  // El resto de tu componente PostCard permanece igual
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="mb-6"
    >
      <Card className="overflow-hidden border-0 shadow-md">
        <div className="h-1 bg-gradient-to-r from-blue-500 to-purple-600"></div>
        
        <CardHeader className="p-4 pb-3 flex items-center space-x-3">
          <Avatar className="h-10 w-10">
            <AvatarImage src={post.User.Avatar || ""} />
            <AvatarFallback className="bg-blue-100 text-blue-800">
              <FaUser />
            </AvatarFallback>
          </Avatar>
          
          <div className="flex-1">
            <h3 className="font-medium">{post.User.Username}</h3>
            <p className="text-xs text-gray-500">{formatDate(post.CreatedAt)}</p>
          </div>
        </CardHeader>
        
        {/* Contenido del post y otros elementos... */}
        <CardContent className="p-4 pt-0">
          <div className="mb-3 whitespace-pre-wrap">{post.Content}</div>
          
          {post.Files && post.Files.length > 0 && (
            <div className="mb-4 grid grid-cols-2 gap-2">
              {post.Files.map(file => (
                <div key={file.FileID} className="relative rounded-lg overflow-hidden bg-gray-100">
                  {file.FileType.includes('image') ? (
                    <img 
                      src={file.FileURL} 
                      alt="Adjunto" 
                      className="w-full h-32 object-cover"
                    />
                  ) : (
                    <div className="h-24 w-full flex items-center justify-center text-gray-500">
                      <MdAttachFile size={32} />
                      <span className="ml-2 text-sm">{file.FileURL.split('/').pop()}</span>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
          
          {post.Tags && post.Tags.length > 0 && (
            <div className="flex flex-wrap gap-1 mb-3">
              {post.Tags.map((tag, index) => (
                <Badge 
                  key={index}
                  variant="secondary" 
                  className="text-xs bg-blue-50 text-blue-600 hover:bg-blue-100"
                >
                  <FaTag className="mr-1 text-xs" />
                  {tag}
                </Badge>
              ))}
            </div>
          )}
          
          <div className="flex items-center gap-3 text-sm text-gray-500">
            {post.University?.Name && (
              <div className="flex items-center">
                <FaUniversity className="mr-1" />
                {post.University.Name}
              </div>
            )}
            
            {post.Career?.Name && (
              <div className="flex items-center">
                <FaGraduationCap className="mr-1" />
                {post.Career.Name}
              </div>
            )}
          </div>
        </CardContent>
        
        <CardFooter className="p-0 border-t border-gray-100">
          <div className="grid grid-cols-2 w-full">
            <Button 
              variant="ghost" 
              onClick={handleLike}
              className={`rounded-none h-12 flex items-center justify-center gap-1 ${isLiked ? 'text-red-500' : 'text-gray-600'}`}
            >
              {isLiked ? <FaHeart /> : <FaRegHeart />}
              <span>{likeCount === 1 ? '1 like' : `${likeCount} likes`}</span>
            </Button>
            
            <Button 
              variant="ghost" 
              onClick={handleShowComments}
              className="rounded-none h-12 flex items-center justify-center gap-1 text-gray-600"
            >
              <FaComment />
              <span>{post.Comments.length === 1 ? '1 comentario' : `${post.Comments.length} comentarios`}</span>
            </Button>
          </div>
        </CardFooter>
        
        {showComments && (
          <div className="p-4 bg-gray-50 border-t border-gray-100">
            <h4 className="font-medium mb-3 text-sm text-gray-700">Comentarios</h4>
            
            {post.Comments.length === 0 ? (
              <p className="text-sm text-gray-500 italic">No hay comentarios aún</p>
            ) : (
              <div className="space-y-3">
                {post.Comments.map(comment => (
                  <div key={comment.CommentID} className="flex gap-2">
                    <Avatar className="h-6 w-6">
                      <AvatarImage src={comment.User.Avatar || ""} />
                      <AvatarFallback className="text-xs bg-blue-100 text-blue-800">
                        {comment.User.Username.substring(0, 2).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    
                    <div className="flex-1">
                      <div className="bg-white rounded-lg p-2 text-sm">
                        <span className="font-medium">{comment.User.Username}</span>
                        <p className="text-gray-800">{comment.Content}</p>
                      </div>
                      <p className="text-xs text-gray-500 mt-1">
                        {formatDate(comment.CreatedAt)}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
            
            {/* Formulario para agregar comentarios */}
            <div className="mt-3 flex gap-2">
              <Avatar className="h-8 w-8 shrink-0">
                <AvatarFallback className="bg-blue-100 text-blue-800">
                  <FaUser />
                </AvatarFallback>
              </Avatar>
              
              <div className="flex-1 rounded-full bg-white border border-gray-200 overflow-hidden flex items-center px-3">
                <input
                  type="text"
                  placeholder="Escribe un comentario..."
                  className="flex-1 py-2 outline-none text-sm"
                  value={commentText}
                  onChange={(e) => setCommentText(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleComment()}
                />
                <Button 
                  size="sm" 
                  variant="ghost" 
                  className="text-blue-600"
                  onClick={handleComment}
                >
                  Enviar
                </Button>
              </div>
            </div>
          </div>
        )}
      </Card>
    </motion.div>
  );
};

export default PostCard;