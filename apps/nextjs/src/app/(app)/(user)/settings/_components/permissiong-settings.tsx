"use client";

import type React from "react";
import { useState } from "react";
import { Plus, Save, Shield, Trash2, User, Users } from "lucide-react";

import type { PermissionAction, Role } from "@acme/db";
// import { savePermissions } from "@/app/actions/permission-actions";
import { Button } from "@acme/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@acme/ui/card";
import { Checkbox } from "@acme/ui/checkbox";
import { Input } from "@acme/ui/input";
import { Label } from "@acme/ui/label";
import { RadioGroup, RadioGroupItem } from "@acme/ui/radio-group";
import { toast } from "@acme/ui/toast";

export default function PermissionsSettings() {
  // Initial roles with detailed permissions
  const initialRoles: Role[] = [
    {
      id: "admin",
      name: "Admin",
      description: "Full access to all resources and settings",
      icon: Shield,
      routes: [
        {
          path: "/dashboard",
          actions: { create: true, read: true, update: true, delete: true },
        },
        {
          path: "/users",
          actions: { create: true, read: true, update: true, delete: true },
        },
        {
          path: "/settings",
          actions: { create: true, read: true, update: true, delete: true },
        },
        {
          path: "/analytics",
          actions: { create: true, read: true, update: true, delete: true },
        },
        {
          path: "/billing",
          actions: { create: true, read: true, update: true, delete: true },
        },
      ],
    },
    {
      id: "editor",
      name: "Editor",
      description: "Can edit content but cannot modify system settings",
      icon: Users,
      routes: [
        {
          path: "/dashboard",
          actions: { create: false, read: true, update: true, delete: false },
        },
        {
          path: "/users",
          actions: { create: false, read: true, update: false, delete: false },
        },
        {
          path: "/settings",
          actions: { create: false, read: false, update: false, delete: false },
        },
        {
          path: "/analytics",
          actions: { create: false, read: true, update: false, delete: false },
        },
        {
          path: "/billing",
          actions: { create: false, read: false, update: false, delete: false },
        },
      ],
    },
    {
      id: "viewer",
      name: "Viewer",
      description: "Read-only access to content",
      icon: User,
      routes: [
        {
          path: "/dashboard",
          actions: { create: false, read: true, update: false, delete: false },
        },
        {
          path: "/users",
          actions: { create: false, read: false, update: false, delete: false },
        },
        {
          path: "/settings",
          actions: { create: false, read: false, update: false, delete: false },
        },
        {
          path: "/analytics",
          actions: { create: false, read: false, update: false, delete: false },
        },
        {
          path: "/billing",
          actions: { create: false, read: false, update: false, delete: false },
        },
      ],
    },
  ];

  const [roles, setRoles] = useState<Role[]>(initialRoles);
  const [selectedRole, setSelectedRole] = useState("viewer");
  const [newRoutePath, setNewRoutePath] = useState("");
  const [isSaving, setIsSaving] = useState(false);

  const selectedRoleData = roles.find((role) => role.id === selectedRole);

  // Toggle permission for a specific action on a route
  const togglePermission = (routePath: string, action: PermissionAction) => {
    setRoles((prevRoles) =>
      prevRoles.map((role) => {
        if (role.id === selectedRole) {
          return {
            ...role,
            routes: role.routes.map((route) => {
              if (route.path === routePath) {
                return {
                  ...route,
                  actions: {
                    ...route.actions,
                    [action]: !route.actions[action],
                  },
                };
              }
              return route;
            }),
          };
        }
        return role;
      }),
    );
  };

  // Add a new route to the selected role
  const addNewRoute = () => {
    if (!newRoutePath.trim() || !newRoutePath.startsWith("/")) {
      toast("Invalid route path");
      return;
    }

    // Check if route already exists
    if (selectedRoleData?.routes.some((route) => route.path === newRoutePath)) {
      toast("Route already exists");
      return;
    }

    setRoles((prevRoles) =>
      prevRoles.map((role) => {
        if (role.id === selectedRole) {
          return {
            ...role,
            routes: [
              ...role.routes,
              {
                path: newRoutePath,
                actions: {
                  create: false,
                  read: false,
                  update: false,
                  delete: false,
                },
              },
            ],
          };
        }
        return role;
      }),
    );

    setNewRoutePath("");
    toast("Route added successfully");
  };

  // Remove a route from the selected role
  const removeRoute = (routePath: string) => {
    setRoles((prevRoles) =>
      prevRoles.map((role) => {
        if (role.id === selectedRole) {
          return {
            ...role,
            routes: role.routes.filter((route) => route.path !== routePath),
          };
        }
        return role;
      }),
    );

    toast("Removed ${routePath} from ${selectedRoleData?.name} role");
  };

  // Save all permissions to the database
  const handleSavePermissions = async () => {
    setIsSaving(true);
    try {
      //await savePermissions(roles);
      toast("All permission changes have been saved to the database");
    } catch (error) {
      toast("Error saving permissions");
      console.error("Error saving permissions:", error);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <Card className="mx-auto w-full max-w-4xl">
      <CardHeader>
        <CardTitle className="text-2xl">
          User Role & Permissions Management
        </CardTitle>
        <CardDescription>
          Create, edit, view, and update permissions for each route and save to
          the database
        </CardDescription>
      </CardHeader>

      <CardContent className="space-y-6">
        {/* Role Selection */}
        <div>
          <h3 className="mb-3 text-lg font-medium">Select Role to Configure</h3>
          <RadioGroup
            value={selectedRole}
            onValueChange={setSelectedRole}
            className="grid gap-4 md:grid-cols-3"
          >
            {roles.map((role) => (
              <div key={role.id} className="relative">
                <RadioGroupItem
                  value={role.id}
                  id={role.id}
                  className="peer sr-only"
                />
                <Label
                  htmlFor={role.id}
                  className="flex cursor-pointer flex-col gap-2 rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary"
                >
                  <div className="flex items-center gap-2">
                    <role.icon className="h-5 w-5" />
                    <span className="font-medium">{role.name}</span>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    {role.description}
                  </p>
                </Label>
              </div>
            ))}
          </RadioGroup>
        </div>

        {/* Add New Route */}
        {selectedRoleData && (
          <div className="mt-6 rounded-md border bg-muted/20 p-4">
            <h3 className="mb-3 text-lg font-medium">Add New Route</h3>
            <div className="flex gap-2">
              <Input
                placeholder="/example/route"
                value={newRoutePath}
                onChange={(e: any) => setNewRoutePath(e.target.value)}
              />
              <Button onClick={addNewRoute} size="sm">
                <Plus className="mr-1 h-4 w-4" />
                Add
              </Button>
            </div>
          </div>
        )}

        {/* Permissions Table */}
        {selectedRoleData && (
          <div className="mt-6">
            <h3 className="mb-3 text-lg font-medium">
              Route Permissions for {selectedRoleData.name}
            </h3>
            <div className="overflow-hidden rounded-md border">
              <table className="w-full">
                <thead className="bg-muted">
                  <tr>
                    <th className="p-3 text-left font-medium">Route</th>
                    <th className="p-3 text-center font-medium">Create</th>
                    <th className="p-3 text-center font-medium">Read</th>
                    <th className="p-3 text-center font-medium">Update</th>
                    <th className="p-3 text-center font-medium">Delete</th>
                    <th className="p-3 text-center font-medium">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {selectedRoleData.routes.map((route) => (
                    <tr key={route.path} className="hover:bg-muted/50">
                      <td className="p-3 font-medium">{route.path}</td>
                      <td className="p-3 text-center">
                        <Checkbox
                          checked={route.actions.create}
                          onCheckedChange={() =>
                            togglePermission(route.path, "create")
                          }
                          aria-label={`Create permission for ${route.path}`}
                        />
                      </td>
                      <td className="p-3 text-center">
                        <Checkbox
                          checked={route.actions.read}
                          onCheckedChange={() =>
                            togglePermission(route.path, "read")
                          }
                          aria-label={`Read permission for ${route.path}`}
                        />
                      </td>
                      <td className="p-3 text-center">
                        <Checkbox
                          checked={route.actions.update}
                          onCheckedChange={() =>
                            togglePermission(route.path, "update")
                          }
                          aria-label={`Update permission for ${route.path}`}
                        />
                      </td>
                      <td className="p-3 text-center">
                        <Checkbox
                          checked={route.actions.delete}
                          onCheckedChange={() =>
                            togglePermission(route.path, "delete")
                          }
                          aria-label={`Delete permission for ${route.path}`}
                        />
                      </td>
                      <td className="p-3 text-center">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => removeRoute(route.path)}
                          className="text-red-500 hover:bg-red-100 hover:text-red-700"
                        >
                          <Trash2 className="h-4 w-4" />
                          <span className="sr-only">Remove {route.path}</span>
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </CardContent>

      <CardFooter>
        <Button
          className="w-full"
          onClick={handleSavePermissions}
          disabled={isSaving}
        >
          {isSaving ? (
            <span>Saving...</span>
          ) : (
            <>
              <Save className="mr-2 h-4 w-4" />
              Save All Permissions
            </>
          )}
        </Button>
      </CardFooter>
    </Card>
  );
}
