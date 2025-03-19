"use client";

import { useRouter } from "next/navigation";
import { useCallback } from "react";
import { Skeleton } from "react-loading-skeleton";

import { Button } from "@acme/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@acme/ui/card";

export const UserCardSkeleton = () => {
  return (
    <Card className="overflow-hidden">
      <CardHeader className="gap-2">
        <Skeleton height={20} width={200} />
        <Skeleton height={16} width={300} />
      </CardHeader>
      <CardContent>
        <Skeleton height={16} count={3} className="my-1" />
      </CardContent>
      <CardFooter>
        <Skeleton height={40} width={100} />
      </CardFooter>
    </Card>
  );
};

export const UserCard = ({
  id,
  name,
  email,
  image,
  role,
}: {
  id: string;
  name: string;
  email: string;
  image?: string;
  role: string;
}) => {
  const router = useRouter();
  
  const handleViewDetails = useCallback(() => {
    router.push(`/users/${id}`);
  }, [id, router]);

  return (
    <Card className="overflow-hidden">
      <CardHeader>
        <CardTitle>{name}</CardTitle>
        <CardDescription>{email}</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex items-center space-x-4">
          {image && (
            <div className="relative h-12 w-12 rounded-full overflow-hidden">
              <img 
                src={image} 
                alt={name} 
                className="object-cover h-full w-full"
              />
            </div>
          )}
          <div>
            <p className="text-sm font-medium">Role: {role}</p>
            <p className="text-sm text-gray-500">ID: {id}</p>
          </div>
        </div>
      </CardContent>
      <CardFooter>
        <Button size="sm" onClick={handleViewDetails}>
          View Details
        </Button>
      </CardFooter>
    </Card>
  );
};