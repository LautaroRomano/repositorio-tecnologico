"use client";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
} from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

// Componente de esqueleto para carga
export default function PostSkeleton() {
  return (
    <div className="mb-6 md:w-[500px]">
      <Card className="overflow-hidden border-0 shadow-md">
        <div className="h-1 bg-gradient-to-r from-gray-300 to-gray-200"></div>

        <CardHeader className="p-4 pb-3 flex items-center space-x-3">
          <Skeleton className="h-10 w-10 rounded-full" />
          <div className="flex-1">
            <Skeleton className="h-4 w-24 mb-2" />
            <Skeleton className="h-3 w-32" />
          </div>
        </CardHeader>

        <CardContent className="p-4 pt-0">
          <Skeleton className="h-4 w-full mb-2" />
          <Skeleton className="h-4 w-full mb-2" />
          <Skeleton className="h-4 w-3/4 mb-4" />

          <div className="flex flex-wrap gap-1 mb-3">
            <Skeleton className="h-5 w-16 rounded-full" />
            <Skeleton className="h-5 w-20 rounded-full" />
          </div>
        </CardContent>

        <CardFooter className="p-0 border-t border-gray-100">
          <div className="grid grid-cols-2 w-full">
            <Skeleton className="h-12 rounded-none" />
            <Skeleton className="h-12 rounded-none" />
          </div>
        </CardFooter>
      </Card>
    </div>
  );
}
