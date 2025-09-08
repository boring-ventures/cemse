"use client";

import type { ReactNode } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { ChevronRight } from "lucide-react";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import {
  SidebarGroup,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
  useSidebar,
} from "@/components/ui/sidebar";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import type {
  NavCollapsible,
  NavItem,
  NavLink,
  NavGroup as NavGroupType,
} from "./types";
import { cn } from "@/lib/utils";

export function NavGroup({ title, items }: NavGroupType) {
  const { state } = useSidebar();
  const pathname = usePathname();

  return (
    <SidebarGroup>
      <SidebarGroupLabel>{title}</SidebarGroupLabel>
      <SidebarMenu>
        {items.map((item: NavItem) => {
          const key = `${item.title}-${item.url}`;

          if (!item.items)
            return (
              <SidebarMenuLink key={key} item={item} pathname={pathname} />
            );

          if (state === "collapsed")
            return (
              <SidebarMenuCollapsedDropdown
                key={key}
                item={item}
                pathname={pathname}
              />
            );

          return (
            <SidebarMenuCollapsible key={key} item={item} pathname={pathname} />
          );
        })}
      </SidebarMenu>
    </SidebarGroup>
  );
}

const NavBadge = ({ children }: { children: ReactNode }) => (
  <Badge className="rounded-full px-2 py-0.5 text-xs font-medium bg-sidebar-primary/10 text-sidebar-primary border-0 shadow-sm">
    {children}
  </Badge>
);

function isNavLink(item: NavItem): item is NavLink {
  return "url" in item;
}

const SidebarMenuLink = ({
  item,
  pathname,
}: {
  item: NavLink;
  pathname: string;
}) => {
  const { setOpenMobile } = useSidebar();
  const isDisabled = item.disabled || false;
  const isActive = checkIsActive(pathname, item);

  return (
    <SidebarMenuItem>
      <SidebarMenuButton
        asChild={!isDisabled}
        isActive={isActive}
        tooltip={item.title}
        disabled={isDisabled}
        className={cn(
          "group relative overflow-hidden",
          isDisabled && "opacity-50 cursor-not-allowed",
          isActive &&
            "shadow-sm bg-sidebar-accent/20 border-l-2 border-sidebar-primary"
        )}
      >
        {isDisabled ? (
          <div className="flex items-center gap-3 w-full">
            {item.icon && (
              <item.icon
                className={cn(
                  "w-4 h-4 flex-shrink-0 transition-colors",
                  isActive
                    ? "text-sidebar-primary-foreground"
                    : "text-sidebar-foreground/70"
                )}
              />
            )}
            <span className="flex-1 min-w-0 font-medium">{item.title}</span>
            {item.badge && <NavBadge>{item.badge}</NavBadge>}
          </div>
        ) : (
          <Link
            href={item.url}
            onClick={() => setOpenMobile(false)}
            className="flex items-center gap-3 w-full"
          >
            {item.icon && (
              <item.icon
                className={cn(
                  "w-4 h-4 flex-shrink-0 transition-colors",
                  isActive
                    ? "text-sidebar-primary-foreground"
                    : "text-sidebar-foreground/70 group-hover:text-sidebar-accent-foreground"
                )}
              />
            )}
            <span className="flex-1 min-w-0 font-medium">{item.title}</span>
            {item.badge && <NavBadge>{item.badge}</NavBadge>}
          </Link>
        )}
      </SidebarMenuButton>
    </SidebarMenuItem>
  );
};

const SidebarMenuCollapsible = ({
  item,
  pathname,
}: {
  item: NavCollapsible;
  pathname: string;
}) => {
  const { setOpenMobile } = useSidebar();
  const isDisabled = item.disabled || false;
  const isActive = checkIsActive(pathname, item, true);

  return (
    <Collapsible asChild defaultOpen={isActive} className="group/collapsible">
      <SidebarMenuItem>
        <CollapsibleTrigger asChild disabled={isDisabled}>
          <SidebarMenuButton
            tooltip={item.title}
            disabled={isDisabled}
            className={cn(
              "group relative overflow-hidden",
              isDisabled && "opacity-50 cursor-not-allowed",
              isActive &&
                "shadow-sm bg-sidebar-accent/20 border-l-2 border-sidebar-primary"
            )}
          >
            {item.icon && (
              <item.icon
                className={cn(
                  "w-4 h-4 flex-shrink-0 transition-colors",
                  isActive
                    ? "text-sidebar-primary-foreground"
                    : "text-sidebar-foreground/70 group-hover:text-sidebar-accent-foreground"
                )}
              />
            )}
            <span className="flex-1 min-w-0 font-medium">{item.title}</span>
            {item.badge && <NavBadge>{item.badge}</NavBadge>}
            <ChevronRight className="ml-auto transition-transform duration-200 group-data-[state=open]/collapsible:rotate-90 flex-shrink-0 text-sidebar-foreground/50" />
          </SidebarMenuButton>
        </CollapsibleTrigger>
        <CollapsibleContent className="CollapsibleContent">
          <SidebarMenuSub>
            {item.items.map((subItem: NavItem) => {
              if (isNavLink(subItem)) {
                const isSubDisabled = subItem.disabled || false;
                const isSubActive = checkIsActive(pathname, subItem);
                return (
                  <SidebarMenuSubItem key={subItem.title}>
                    <SidebarMenuSubButton
                      asChild={!isSubDisabled}
                      isActive={isSubActive}
                      className={cn(
                        "group/sub relative",
                        isSubDisabled && "opacity-50 cursor-not-allowed",
                        isSubActive &&
                          "bg-sidebar-accent/15 border-l-2 border-sidebar-primary/60"
                      )}
                    >
                      {isSubDisabled ? (
                        <div className="flex items-center gap-3 w-full">
                          {subItem.icon && (
                            <subItem.icon className="w-4 h-4 flex-shrink-0 text-sidebar-foreground/50" />
                          )}
                          <span className="flex-1 min-w-0 font-medium">
                            {subItem.title}
                          </span>
                          {subItem.badge && (
                            <NavBadge>{subItem.badge}</NavBadge>
                          )}
                        </div>
                      ) : (
                        <Link
                          href={subItem.url}
                          onClick={() => setOpenMobile(false)}
                          className="flex items-center gap-3 w-full"
                        >
                          {subItem.icon && (
                            <subItem.icon
                              className={cn(
                                "w-4 h-4 flex-shrink-0 transition-colors",
                                isSubActive
                                  ? "text-sidebar-primary"
                                  : "text-sidebar-foreground/50 group-hover/sub:text-sidebar-accent-foreground"
                              )}
                            />
                          )}
                          <span className="flex-1 min-w-0 font-medium">
                            {subItem.title}
                          </span>
                          {subItem.badge && (
                            <NavBadge>{subItem.badge}</NavBadge>
                          )}
                        </Link>
                      )}
                    </SidebarMenuSubButton>
                  </SidebarMenuSubItem>
                );
              }
              return null;
            })}
          </SidebarMenuSub>
        </CollapsibleContent>
      </SidebarMenuItem>
    </Collapsible>
  );
};

const SidebarMenuCollapsedDropdown = ({
  item,
  pathname,
}: {
  item: NavCollapsible;
  pathname: string;
}) => {
  return (
    <SidebarMenuItem>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <SidebarMenuButton
            tooltip={item.title}
            isActive={checkIsActive(pathname, item)}
          >
            {item.icon && <item.icon />}
            <span>{item.title}</span>
            {item.badge && <NavBadge>{item.badge}</NavBadge>}
            <ChevronRight className="ml-auto transition-transform duration-200 group-data-[state=open]/collapsible:rotate-90" />
          </SidebarMenuButton>
        </DropdownMenuTrigger>
        <DropdownMenuContent side="right" align="start" sideOffset={4}>
          <DropdownMenuLabel>
            {item.title} {item.badge ? `(${item.badge})` : ""}
          </DropdownMenuLabel>
          <DropdownMenuSeparator />
          {item.items.map((sub: NavItem) => {
            if (isNavLink(sub)) {
              return (
                <DropdownMenuItem key={`${sub.title}-${sub.url}`} asChild>
                  <Link
                    href={sub.url}
                    className={`${checkIsActive(pathname, sub) ? "bg-sidebar-accent/20 text-sidebar-primary font-medium" : ""}`}
                  >
                    {sub.icon && <sub.icon />}
                    <span className="max-w-52 text-wrap">{sub.title}</span>
                    {sub.badge && (
                      <span className="ml-auto text-xs">{sub.badge}</span>
                    )}
                  </Link>
                </DropdownMenuItem>
              );
            }
            return null;
          })}
        </DropdownMenuContent>
      </DropdownMenu>
    </SidebarMenuItem>
  );
};

function checkIsActive(pathname: string, item: NavItem, mainNav = false) {
  return (
    pathname === item.url || // /endpoint
    !!item?.items?.filter((i: NavItem) => i.url === pathname).length || // if child nav is active
    (mainNav &&
      pathname.split("/")[1] !== "" &&
      pathname.split("/")[1] === item?.url?.split("/")[1])
  );
}
